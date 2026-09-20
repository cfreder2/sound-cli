// The renderer: a score plus an era, into stereo samples.
//
// There is exactly one of these. VECTRENCH has three synths today -- the
// browser player, the vendored copy in AXI, and an offline mirror whose own
// first line admits it "mirrors src/music.js closely enough" -- and nothing
// tests that they agree. This file is the only thing that turns a note into a
// number, and both the CLI and the preview page call it, so there is nothing
// left to drift against.

import {
  RATE, pulse, saw, sine, triangle, nesTriangle, noiseBed, quantize, sweepPoints,
  adsr, nesEnv, Biquad, Echo, hz, panGains, limit, clamp, db,
} from './dsp.js';
import { instrumentFor, ALGOS } from './instruments.js';

const TAIL = 1.2;                  // seconds of room past the last note

function oscSample(kind, phase, dt, duty, noise, noiseIdx) {
  switch (kind) {
    case 'pulse': return pulse(phase, dt, duty);
    case 'saw': return saw(phase, dt);
    case 'sine': return sine(phase);
    case 'tri': return triangle(phase);
    case 'nestri': return nesTriangle(phase);
    case 'noise': return noise[noiseIdx % noise.length];
    default: return sine(phase);
  }
}

/**
 * Four-operator FM. `mod` says who modulates whom; `out` says who is heard.
 *
 * Written to allocate NOTHING per sample. The obvious version builds a
 * four-element array and an envelope object per operator per sample, which at
 * 44.1 kHz is about 25 million allocations for a two-minute track and shows up
 * as GC rather than as synthesis. The scratch array is hoisted, the envelope
 * parameters are read from flat arrays, and operators that contribute nothing
 * are skipped instead of computed and multiplied by zero.
 */
const TAU = Math.PI * 2;
function fmVoice(spec) {
  const algo = ALGOS[spec.algo] || ALGOS.brass;
  const n = spec.ops.length;
  const ratio = new Float64Array(n), level = new Float64Array(n), fb = new Float64Array(n);
  const ea = new Float64Array(n), ed = new Float64Array(n);
  const es = new Float64Array(n), er = new Float64Array(n);
  spec.ops.forEach((o, i) => {
    ratio[i] = o.ratio; level[i] = o.level; fb[i] = o.fb || 0;
    ea[i] = o.a; ed[i] = o.d; es[i] = o.s; er[i] = o.r;
  });

  // An operator matters only if it is heard, or modulates something that is.
  const needed = new Set(algo.out);
  for (let pass = 0; pass < n; pass++) {
    for (let i = 0; i < n; i++) if (needed.has(i)) for (const m of algo.mod[i]) needed.add(m);
  }
  const order = [];
  for (let i = n - 1; i >= 0; i--) if (needed.has(i) && level[i] > 0) order.push(i);
  const mods = algo.mod.map((a) => a.filter((m) => needed.has(m) && level[m] > 0));
  const outs = algo.out.filter((c) => level[c] > 0);
  const outScale = 1.6 / Math.max(1, outs.length);

  const phase = new Float64Array(n);
  const last = new Float64Array(n);
  const val = new Float64Array(n);

  return (f, age, dur) => {
    for (let k = 0; k < order.length; k++) {
      const i = order[k];
      let mod = 0;
      const ms = mods[i];
      for (let j = 0; j < ms.length; j++) mod += val[ms[j]];
      if (fb[i]) mod += last[i] * fb[i];
      let ph = phase[i] + (f * ratio[i]) / RATE;
      ph -= Math.floor(ph);
      phase[i] = ph;
      const e = adsr(age, dur, { a: ea[i], d: ed[i], s: es[i], r: er[i] });
      const v = Math.sin((ph + mod) * TAU) * level[i] * e;
      last[i] = v;
      val[i] = v * 2.6;            // modulation index: how bright the FM gets
    }
    let sum = 0;
    for (let k = 0; k < outs.length; k++) sum += val[outs[k]];
    return (sum / 2.6) * outScale;
  };
}

/**
 * One note, summed into the mix.
 *
 * Every layer of the instrument is rendered here and added -- that is all
 * layering is, and keeping it in one visible loop is why `instruments.js` can
 * be data. A layer with `delay` starts late, which is how a slapback is one
 * layer rather than a second effects stage.
 */
function renderNote(mix, opts) {
  const {
    at, dur, note, inst, gain, pan, vib, sweep, accent, send, tone,
  } = opts;
  const baseMidi = note;
  const env = inst.env === 'nes' ? null : (inst.env || { a: 0.005, d: 0.06, s: 0.7, r: 0.1 });
  const relTail = env ? env.r : 0;
  const total = dur + relTail;
  const [gl, gr] = panGains(pan);
  // `trim` makes `mix=` mean one thing across every instrument. See instruments.js.
  const amp = gain * (inst.trim ?? 1) * (accent ? 1.35 : 1);
  // The sweep, flattened once. Rescanning the table on every sample -- and
  // calling quantize() inside that scan -- was ten redundant comparisons and a
  // division per sample on any note carrying a slide.
  const sweepRaw = sweep ? sweepPoints(hz(baseMidi), { up: sweep > 0 }) : null;
  const fm = inst.fm ? fmVoice(inst.fm) : null;

  for (const layer of (inst.layers || [{ osc: 'sine', gain: 1 }])) {
    const lag = layer.delay || 0;
    const start = Math.floor((at + lag) * RATE);
    const n = Math.floor((layer.hold ?? total) * RATE);
    if (start >= mix.L.length) continue;

    const lm = baseMidi + (layer.semi || 0);
    let f0 = hz(lm) * 2 ** ((layer.detune || 0) / 1200);
    if (inst.quantize) f0 = quantize(f0);
    const lg = amp * (layer.gain ?? 1);
    // The instrument's own voicing filter, then the voice's tone. Both are
    // per-note here rather than on a shared bus, which costs a few biquads and
    // buys not having to restructure the mixer for a feature most voices do
    // not use.
    const chain = [];
    if (inst.cut) chain.push(new Biquad('lowpass', inst.cut, 0.8));
    if (tone?.lp) chain.push(new Biquad('lowpass', tone.lp, 0.707));
    if (tone?.hp) chain.push(new Biquad('highpass', tone.hp, 0.707));
    if (tone?.tilt) chain.push(new Biquad('highshelf', 1500, 0.707, tone.tilt));
    const noise = layer.osc === 'noise' ? noiseBed(layer.bed || 'long') : null;
    let phase = 0;

    // Per-layer, precomputed once.
    const sweepT = sweepRaw ? sweepRaw.map((p) => p.t) : null;
    const sweepF = sweepRaw
      ? sweepRaw.map((p) => (inst.quantize ? quantize(p.f) : p.f)) : null;
    let sweepAt = 0;
    const isFm = layer.osc === 'fm' && !!fm;
    const duty = layer.duty ?? 0.5;
    const nesEnvelope = !env;

    for (let i = 0; i < n; i++) {
      const j = start + i;
      if (j >= mix.L.length) break;
      const age = i / RATE;

      let f = f0;
      if (sweepT) {
        while (sweepAt < sweepT.length && age >= sweepT[sweepAt]) sweepAt += 1;
        if (sweepAt > 0) f = sweepF[sweepAt - 1];
      }
      // Vibrato arrives late on purpose: a note that wavers from the instant
      // it starts sounds seasick, and one that never wavers is a test tone.
      // The pow stays. Linearising it is a 0.05 cent error -- inaudible on its
      // own, two thousand times below the just-noticeable difference -- but
      // frequency error integrates into PHASE error, and over a three-second
      // held note that reached 17 degrees, which is a 10 dB sample-wise
      // divergence from the same note rendered the other way. Renders have to
      // be reproducible to be worth diffing, so the exact form stays.
      if (vib && age > 0.14) {
        f *= 2 ** ((Math.sin((age - 0.14) * TAU * 5.5) * 14) / 1200);
      }

      const e = nesEnvelope ? nesEnv(age, dur) : adsr(age, dur, env);
      if (e <= 0 && age > dur) break;

      let s;
      if (isFm) {
        s = fm(f, age, dur);
      } else {
        const dt = f / RATE;
        phase += dt;
        if (phase >= 1) phase -= Math.floor(phase);
        s = oscSample(layer.osc, phase, dt, duty, noise, i);
      }
      s *= e * lg;
      for (let k = 0; k < chain.length; k++) s = chain[k].run(s);

      mix.L[j] += s * gl;
      mix.R[j] += s * gr;
      if (send > 0) mix.S[j] += s * send;
    }
  }
}

/**
 * The drum kit. Not an instrument with a pitch -- a small fixed set of layered
 * one-shots, because that is what a kit is.
 *
 * Each hit is spelled out as its layers so the 8-bit and 16-bit versions can
 * be read against each other: the 16-bit kick is the same swept sine with a
 * body tone and a longer click under it, which is exactly the difference the
 * A/B is meant to demonstrate.
 */
function renderDrum(mix, at, hit, gain, era, send) {
  const start = Math.floor(at * RATE);
  const put = (i, s, pan = 0) => {
    const j = start + i;
    if (j < 0 || j >= mix.L.length) return;
    const [gl, gr] = panGains(pan);
    mix.L[j] += s * gl; mix.R[j] += s * gr;
    if (send > 0) mix.S[j] += s * send;
  };
  const wide = era === '16bit';
  const noiseL = noiseBed('long'), noiseM = noiseBed('metal'), noiseW = noiseBed('white');

  if (hit === 'k') {
    const dur = wide ? 0.20 : 0.14;
    const n = Math.floor(dur * RATE);
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const u = i / n, age = i / RATE;
      const f = (wide ? 160 : 150) * ((wide ? 40 : 44) / (wide ? 160 : 150)) ** (u ** 0.6);
      ph += f / RATE;
      const body = Math.sin(ph * 2 * Math.PI) * (1 - u) ** (wide ? 1.8 : 2.2);
      const click = age < 0.012 ? noiseW[i] * 0.25 * (1 - age / 0.012) : 0;
      // The 8-bit kick is crushed to four bits: it is a tiny DPCM ROM, and the
      // crunch is why it cuts through at arcade tempos.
      let s = (body * 0.9 + click) * gain * 0.9;
      if (!wide) s = Math.round(clamp(s, -1, 1) * 7) / 7;
      put(i, s);
    }
    if (wide) {                                   // a sub layer, 16-bit only
      const m = Math.floor(0.26 * RATE);
      for (let i = 0; i < m; i++) {
        put(i, Math.sin((i / RATE) * 2 * Math.PI * 52) * (1 - i / m) ** 2 * gain * 0.45);
      }
    }
    return;
  }

  if (hit === 's' || hit === 'x') {
    const dur = wide ? 0.18 : 0.11;
    const n = Math.floor(dur * RATE);
    const bed = wide ? noiseW : noiseL;
    const hp = new Biquad('highpass', wide ? 900 : 1400, 0.9);
    const bp = new Biquad('bandpass', wide ? 2100 : 3000, 1.1);
    for (let i = 0; i < n; i++) {
      const u = i / n;
      let s = hp.run(bed[i + 2000]) * (1 - u) ** 2.4;
      if (wide) s += bp.run(bed[i + 9000]) * (1 - u) ** 1.6 * 0.6;
      // 16-bit snares are a noise layer AND a tone layer. That tone is the
      // "crack"; without it a snare is a hiss.
      if (wide) s += Math.sin((i / RATE) * 2 * Math.PI * 185) * (1 - u) ** 3 * 0.35;
      put(i, s * gain * (wide ? 0.6 : 0.7));
    }
    return;
  }

  if (hit === 'h' || hit === 'm') {
    const dur = hit === 'm' ? 0.06 : 0.04;
    const n = Math.floor(dur * RATE);
    const bed = hit === 'm' ? noiseM : (wide ? noiseW : noiseM);
    const hp = new Biquad('highpass', wide ? 7800 : 6000, 0.8);
    for (let i = 0; i < n; i++) {
      put(i, hp.run(bed[i + 400]) * (1 - i / n) ** 2.2 * gain * 0.5, wide ? 0.18 : 0);
    }
    return;
  }

  if (hit === 'c') {
    const dur = wide ? 1.1 : 0.5;
    const n = Math.floor(dur * RATE);
    const bed = wide ? noiseW : noiseL;
    const hp = new Biquad('highpass', 5200, 0.7);
    for (let i = 0; i < n; i++) {
      put(i, hp.run(bed[i % bed.length]) * (1 - i / n) ** 2.6 * gain * 0.4, -0.2);
    }
    return;
  }

  if (hit === 't') {
    const n = Math.floor(0.16 * RATE);
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const u = i / n;
      ph += (240 * (0.45 ** u)) / RATE;
      const s = (wide ? triangle(ph % 1) : nesTriangle(ph % 1)) * (1 - u) ** 2 * gain * 0.6;
      put(i, s, 0.25);
    }
  }
}

/**
 * Render a whole track.
 *
 * `era` overrides what the score asks for, which is the entire point of the
 * A/B: one file, two rigs, and the instrument substitution table in
 * instruments.js decides what a 25% pulse becomes on a 16-bit rig.
 */
export function renderTrack(track, {
  era = track.era, rate = RATE, intensity = 1, bars = null, tail = TAIL,
  targetRmsDb = -18, normalize = true, bpm = null, from = 0, tilt = 0, ceiling = 0.89,
  onProgress = null,
} = {}) {
  // Overriding the tempo here re-sequences the score, so the notes keep their
  // pitch. The preview page's speed slider resamples instead, which is instant
  // but drags pitch along with it -- two different questions, two different
  // controls, and the difference is worth knowing.
  const stepTime = 60 / (bpm || track.bpm) / 4;
  // A window, not a prefix. `from` is a bar index and `bars` a count from it,
  // so a layer view can jump to where a voice actually enters -- which for
  // Canon's second violin is bar 17, and a prefix render would have meant
  // rendering the whole piece to see it.
  const firstStep = Math.max(0, (from | 0) * track.beats);
  const lastStep = Math.min(track.steps, firstStep + (bars ?? track.totalBars) * track.beats);
  const steps = Math.max(0, lastStep - firstStep);
  const limitBars = steps / track.beats;
  const seconds = steps * stepTime + tail;
  const n = Math.ceil(seconds * rate);
  const mix = { L: new Float32Array(n), R: new Float32Array(n), S: new Float32Array(n) };

  const used = [];
  // Real progress, not an estimate. A cost model built from note counts and
  // durations came out 45% off in the median case, because vibrato makes a
  // held note several times more expensive per sample than a short one and no
  // amount of counting notes sees that. The renderer knows exactly where it
  // is, so it says so: five per cent of the work is the tail, the rest is the
  // voices, weighted by how many steps each one actually has to sound.
  const totalWork = Math.max(1, track.voices.length * steps);
  let workDone = 0;
  let lastReport = 0;
  // The mix buffer is handed to the callback so a caller can read peaks out of
  // it while the render is still running -- which is what lets the previewer
  // draw the waveform filling in rather than a spinner.
  const report = () => {
    if (!onProgress) return;
    const frac = (workDone / totalWork) * 0.95;
    if (frac - lastReport < 0.02) return;
    lastReport = frac;
    onProgress(frac, mix);
  };

  for (const voice of track.voices) {
    const { name, inst, substituted, from } = instrumentFor(voice.inst, era);
    used.push({ voice: voice.id, inst: name, substituted, from });
    const send = era === '16bit' ? (voice.echo || 0.12) : 0;
    const octShift = (voice.oct || 0) * 12;
    const tone = (voice.lp || voice.hp || voice.tilt)
      ? { lp: voice.lp, hp: voice.hp, tilt: voice.tilt } : null;

    for (let i = firstStep; i < lastStep; i++) {
      workDone += 1;
      report();
      const cell = voice.bars[Math.floor(i / track.beats)]?.[i % track.beats];
      if (!cell) continue;
      // Swing pushes every offbeat sixteenth late by a fraction of a step. At
      // 0 it is a grid; at 0.2 it is a shuffle.
      const swing = (i % 2 === 1) ? track.swing * stepTime * 0.5 : 0;
      const at = (i - firstStep) * stepTime + swing;

      if (voice.kind === 'drum') {
        renderDrum(mix, at, cell.hit, voice.mix * (inst.trim ?? 1) * intensity * 2.2, era, send * 0.5);
      } else if (voice.kind === 'chord') {
        // An arpeggio is one voice cycling a chord faster than the ear
        // separates it. It costs one channel and buys a chord, which is the
        // single most useful thing the NES taught anybody.
        const span = cell.steps;
        for (let k = 0; k < span; k++) {
          const nt = cell.chord[k % cell.chord.length];
          if (nt == null) continue;
          renderNote(mix, {
            at: at + k * stepTime, dur: stepTime * 0.9, note: nt + octShift + 12,
            inst, gain: voice.mix * intensity, pan: voice.pan, vib: false,
            sweep: 0, accent: false, send, tone,
          });
        }
      } else {
        renderNote(mix, {
          at, dur: stepTime * (cell.steps - 0.06), note: cell.note + octShift,
          inst, gain: voice.mix * intensity, pan: voice.pan,
          vib: cell.vib || cell.steps > 5, sweep: cell.sweep, accent: cell.accent, send, tone,
        });
      }
    }
  }

  workDone = totalWork;
  report();

  // The echo send. 8-bit gets none at all -- a dry mix is half of what makes
  // the era sound like the era.
  if (era === '16bit') {
    const echo = new Echo(0.19, 0.33, 4000, rate);
    for (let i = 0; i < n; i++) {
      const w = echo.run(mix.S[i]) * 0.5;
      mix.L[i] += w * 0.9; mix.R[i] += w;
    }
  }

  // A master high-pass at 40 Hz, 24 dB/oct.
  //
  // Standard practice and not optional for game audio: nothing below roughly
  // 40 Hz survives a laptop, phone, tablet or TV speaker, so any energy down
  // there is inaudible AND expensive -- it drives the limiter, which pulls
  // everything audible down to make room for it. Cutting it makes the mix
  // louder and cleaner at once. It also stops any future instrument from
  // reintroducing the bug that put 45% of Canon's bass below 45 Hz.
  const hp = [
    new Biquad('highpass', 40, 0.541, 0, rate), new Biquad('highpass', 40, 1.307, 0, rate),
    new Biquad('highpass', 40, 0.541, 0, rate), new Biquad('highpass', 40, 1.307, 0, rate),
  ];
  for (let i = 0; i < n; i++) {
    mix.L[i] = hp[1].run(hp[0].run(mix.L[i]));
    mix.R[i] = hp[3].run(hp[2].run(mix.R[i]));
  }

  // A master tilt: dB of high shelf at 1.2 kHz. Negative darkens, positive
  // brightens. Applied before loudness matching so the match accounts for it.
  if (tilt) {
    const tl = new Biquad('highshelf', 1200, 0.707, tilt, rate);
    const tr2 = new Biquad('highshelf', 1200, 0.707, tilt, rate);
    for (let i = 0; i < n; i++) { mix.L[i] = tl.run(mix.L[i]); mix.R[i] = tr2.run(mix.R[i]); }
  }

  // Match loudness, then limit.
  //
  // Without this the A/B is a lie. Rendered raw the two eras are about 5 dB
  // apart -- 16-bit the louder, since instrument calibration landed -- and the
  // louder of two takes wins a comparison regardless of which is better.
  // Matching before limiting means what you hear between the two buttons is
  // timbre, which is the only thing the comparison is about.
  let sum0 = 0;
  for (let i = 0; i < n; i++) sum0 += mix.L[i] * mix.L[i] + mix.R[i] * mix.R[i];
  const rms0 = Math.sqrt(sum0 / (2 * n));
  let gain = 1;
  if (normalize && rms0 > 1e-6) {
    gain = clamp((10 ** (targetRmsDb / 20)) / rms0, 0.25, 12);
    for (let i = 0; i < n; i++) { mix.L[i] *= gain; mix.R[i] *= gain; }
  }

  // `ceiling: Infinity` leaves the mix untouched, which analysis needs: a
  // limiter engaging during a calibration measurement means calibrating
  // against the limiter rather than against the instrument.
  if (onProgress) onProgress(1, mix);
  const { peak, reducedDb } = Number.isFinite(ceiling)
    ? limit(mix.L, mix.R, ceiling, rate)
    : { peak: mix.L.reduce((m, v, i) => Math.max(m, Math.abs(v), Math.abs(mix.R[i])), 0), reducedDb: 0 };
  let sum = 0;
  for (let i = 0; i < n; i++) sum += mix.L[i] * mix.L[i] + mix.R[i] * mix.R[i];
  const rms = Math.sqrt(sum / (2 * n));

  return {
    L: mix.L, R: mix.R, rate, era,
    stats: {
      seconds: n / rate, bars: limitBars, steps, from, bpm: bpm || track.bpm,
      peakDb: db(peak), rmsDb: db(rms), gainDb: db(gain), limitDb: reducedDb, voices: used,
    },
  };
}
