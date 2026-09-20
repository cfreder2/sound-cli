// The renderer: a score plus an era, into stereo samples.
//
// There is exactly one of these. VECTRENCH has three synths today -- the
// browser player, the vendored copy in AXI, and an offline mirror whose own
// first line admits it "mirrors src/music.js closely enough" -- and nothing
// tests that they agree. This file is the only thing that turns a note into a
// number, and both the CLI and the preview page call it, so there is nothing
// left to drift against.

import {
  RATE, triangle, nesTriangle, noiseBed, Biquad, Echo, panGains, limit, clamp, db,
} from './dsp.js';
import { instrumentFor } from './instruments.js';
import { Voice } from './voice.js';

const TAIL = 1.2;                  // seconds of room past the last note

/**
 * One note, summed into the mix.
 *
 * A thin adapter now. The synthesis moved to core/voice.js so that the same
 * code can also be driven a block at a time by an AudioWorklet -- playing a
 * keyboard needs sound within milliseconds, and building a second synth out of
 * Web Audio nodes to get it is the arrangement this package exists to delete.
 */
function renderNote(mix, opts) {
  const { at, dur, note, inst } = opts;
  const v = new Voice(inst, note, { ...opts, dur });
  const start = Math.floor(at * RATE);
  if (start >= mix.L.length) return;
  // Enough samples for the longest layer: the note's own span, plus whatever
  // a delayed layer (a slapback) needs after it.
  let lag = 0;
  for (const l of inst.layers || []) lag = Math.max(lag, l.delay || 0);
  const span = Math.floor((dur + v.tail) * RATE) + Math.round(lag * RATE) + 1;
  v.fill(mix.L, mix.R, mix.S, start, Math.min(span, mix.L.length - start));
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
