// One sounding note, as an object you tick.
//
// This is the same synthesis the offline renderer has always done, lifted out
// of its loop so it can also be driven a block at a time by an AudioWorklet.
// That matters more here than anywhere else in the package: playing a virtual
// keyboard needs sound within a few milliseconds of the key going down, and
// the obvious way to get that -- build a second synth out of Web Audio nodes --
// is exactly the arrangement this library exists to delete. VECTRENCH has
// three synths that agree by hand. One is the whole point.
//
// The difference between rendering and performing is the envelope. A rendered
// note knows its length before it starts. A played one does not, so `dur`
// begins as Infinity and `release()` sets it to the age at which the key came
// up. `adsr` already does the right thing with that -- it sustains while
// `age < dur` and releases after -- so the gate model needed no new envelope.

import {
  RATE, pulse, saw, sine, triangle, nesTriangle, noiseBed, quantize, sweepPoints,
  adsr, nesEnv, Biquad, hz, panGains, clamp,
} from './dsp.js';
import { ALGOS } from './instruments.js';

const TAU = Math.PI * 2;
const DRV = new Map();
const drv = (d) => {
  let v = DRV.get(d);
  if (v === undefined) { v = Math.tanh(d); DRV.set(d, v); }
  return v;
};

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

/** Resample a noise bed so its rasp tracks pitch. See instruments.js. */
const pitchedIndex = (i, f) => Math.floor(i * (f / 220));

/** Four-operator FM, allocating nothing per sample. */
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
  const envp = { a: 0, d: 0, s: 0, r: 0 };

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
      envp.a = ea[i]; envp.d = ed[i]; envp.s = es[i]; envp.r = er[i];
      const e = adsr(age, dur, envp);
      const v = Math.sin((ph + mod) * TAU) * level[i] * e;
      last[i] = v;
      val[i] = v * 2.6;
    }
    let sum = 0;
    for (let k = 0; k < outs.length; k++) sum += val[outs[k]];
    return (sum / 2.6) * outScale;
  };
}

/** One layer of one note: its own oscillator, filters and phase. */
class Layer {
  constructor(spec, cfg) {
    const { inst, baseMidi, amp, tone, fm, sweepRaw } = cfg;
    this.osc = spec.osc;
    this.duty = spec.duty ?? 0.5;
    this.gain = amp * (spec.gain ?? 1);
    this.drive = spec.drive || 0;
    this.crush = spec.crush || 0;
    this.pitched = !!spec.pitched;
    this.startAt = Math.round((spec.delay || 0) * RATE);
    this.hold = spec.hold ?? null;
    this.isFm = spec.osc === 'fm' && !!fm;
    this.fm = fm;
    this.noise = spec.osc === 'noise' ? noiseBed(spec.bed || 'long') : null;

    const lm = baseMidi + (spec.semi || 0);
    this.f0 = hz(lm) * 2 ** ((spec.detune || 0) / 1200);
    if (inst.quantize) this.f0 = quantize(this.f0);

    this.chain = [];
    if (inst.cut) this.chain.push(new Biquad('lowpass', inst.cut, 0.8));
    if (inst.eq) this.chain.push(new Biquad('peaking', inst.eq.f, inst.eq.q ?? 1.2, inst.eq.gain ?? 6));
    if (tone?.lp) this.chain.push(new Biquad('lowpass', tone.lp, 0.707));
    if (tone?.hp) this.chain.push(new Biquad('highpass', tone.hp, 0.707));
    if (tone?.tilt) this.chain.push(new Biquad('highshelf', 1500, 0.707, tone.tilt));

    this.sweepT = sweepRaw ? sweepRaw.map((p) => p.t) : null;
    this.sweepF = sweepRaw ? sweepRaw.map((p) => (inst.quantize ? quantize(p.f) : p.f)) : null;
    this.sweepAt = 0;
    this.phase = 0;
    this.i = 0;                 // samples since this layer began
    this.ended = false;
  }
}

/**
 * One note. `dur` is its held length in seconds, or Infinity while a key is
 * down; `post` is the instrument trim, applied after the waveshaper.
 */
export class Voice {
  constructor(inst, midi, {
    gain = 0.2, pan = 0, vib = false, sweep = 0, accent = false, tone = null,
    dur = Infinity, send = 0,
  } = {}) {
    this.inst = inst;
    this.env = inst.env === 'nes' ? null : (inst.env || { a: 0.005, d: 0.06, s: 0.7, r: 0.1 });
    this.dur = dur;
    this.post = inst.trim ?? 1;
    this.send = send;
    this.vib = vib;
    const [gl, gr] = panGains(pan);
    this.gl = gl; this.gr = gr;
    const amp = gain * (accent ? 1.35 : 1);
    const fm = inst.fm ? fmVoice(inst.fm) : null;
    const sweepRaw = sweep ? sweepPoints(hz(midi), { up: sweep > 0 }) : null;
    const cfg = { inst, baseMidi: midi, amp, tone, fm, sweepRaw };
    this.layers = (inst.layers || [{ osc: 'sine', gain: 1 }]).map((l) => new Layer(l, cfg));
    this.pos = 0;              // samples since note start
    this.done = false;
  }

  /** Key up. Everything after this is the release tail. */
  release() {
    if (this.dur === Infinity) this.dur = this.pos / RATE;
  }

  /** How long the tail runs past `dur`. */
  get tail() { return this.env ? this.env.r : 0; }

  /**
   * Add `count` samples into the buffers starting at `at`.
   *
   * Returns false once every layer has finished, so a caller can drop the
   * voice. `S` is the echo send and may be null.
   */
  fill(L, R, S, at, count) {
    const { env, vib } = this;
    const nesEnvelope = !env;
    for (const ly of this.layers) {
      if (ly.ended) continue;
      // How long this layer may sound. A rendered note is capped at its own
      // length plus the release, which can cut the envelope off mid-decay --
      // piano decays for 0.85 s and a sixteenth note gets 0.49 s of it. That
      // truncation is what every existing render already sounds like, so it
      // stays. A HELD note has no such cap, because nobody knows yet how long
      // it will be.
      const lim = ly.hold !== null
        ? Math.floor(ly.hold * RATE)
        : (Number.isFinite(this.dur) ? Math.floor((this.dur + this.tail) * RATE) : Infinity);

      for (let k = 0; k < count; k++) {
        const vp = this.pos + k;
        if (vp < ly.startAt) continue;
        if (ly.i >= lim) { ly.ended = true; break; }

        const age = ly.i / RATE;
        let f = ly.f0;
        if (ly.sweepT) {
          while (ly.sweepAt < ly.sweepT.length && age >= ly.sweepT[ly.sweepAt]) ly.sweepAt += 1;
          if (ly.sweepAt > 0) f = ly.sweepF[ly.sweepAt - 1];
        }
        if (vib && age > 0.14) {
          f *= 2 ** ((Math.sin((age - 0.14) * TAU * 5.5) * 14) / 1200);
        }

        const e = nesEnvelope ? nesEnv(age, this.dur) : adsr(age, this.dur, env);
        if (e <= 0 && age > this.dur) { ly.ended = true; break; }

        let s;
        if (ly.isFm) {
          s = ly.fm(f, age, this.dur);
        } else {
          const dt = f / RATE;
          ly.phase += dt;
          if (ly.phase >= 1) ly.phase -= Math.floor(ly.phase);
          s = oscSample(ly.osc, ly.phase, dt, ly.duty, ly.noise,
            ly.pitched ? pitchedIndex(ly.i, f) : ly.i);
        }
        s *= e * ly.gain;
        if (ly.drive) s = Math.tanh(s * ly.drive) / drv(ly.drive);
        s *= this.post;
        if (ly.crush) {
          const q = (1 << ly.crush) - 1;
          s = Math.round(clamp(s, -1, 1) * q) / q;
        }
        for (let c = 0; c < ly.chain.length; c++) s = ly.chain[c].run(s);

        const j = at + k;
        if (j >= L.length) { ly.ended = true; break; }
        L[j] += s * this.gl;
        R[j] += s * this.gr;
        if (S && this.send > 0) S[j] += s * this.send;
        ly.i += 1;
      }
    }

    this.pos += count;
    // Checked AFTER the block, not before it. Testing at the top meant a voice
    // that finished during this call still reported itself alive, so the
    // worklet held it for one more block before dropping it.
    this.done = this.layers.every((l) => l.ended);
    return !this.done;
  }
}

/**
 * The 2A03 envelope, held.
 *
 * `nesEnv` counts down over a known duration, which a performed note does not
 * have. While the key is down the counter holds at its floor instead of
 * running off the end; the release then falls from there.
 */
export const heldNesDur = 0.45;
