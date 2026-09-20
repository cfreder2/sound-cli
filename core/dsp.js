// The sounding primitives. No AudioContext, no I/O, no browser: everything
// here turns numbers into numbers, so the same code runs in Node writing a WAV
// and in a page filling an AudioBuffer. That is the whole reason this file is
// separate -- VECTRENCH currently has two synths that agree by hand, and the
// one that renders offline says so in its first line.

export const RATE = 44100;
const CPU_HZ = 1789773;              // NTSC 2A03 clock

// ---------------------------------------------------------------- waveforms --
//
// Naive square and saw alias badly: a 1 kHz square at 44.1 kHz folds every
// harmonic above 22 kHz back down as an inharmonic whistle, and chip leads live
// exactly in the range where that is worst. PolyBLEP fixes the two
// discontinuities per cycle with a two-sample polynomial correction, which is
// cheap and inaudible in the good way.

function polyBlep(t, dt) {
  if (t < dt) { const x = t / dt; return x + x - x * x - 1; }
  if (t > 1 - dt) { const x = (t - 1) / dt; return x * x + x + x + 1; }
  return 0;
}

/** A pulse of the given duty, band-limited. duty 0.5 is a square. */
export function pulse(phase, dt, duty) {
  let v = phase < duty ? 1 : -1;
  v += polyBlep(phase, dt);
  v -= polyBlep((phase - duty + 1) % 1, dt);
  return v;
}

export function saw(phase, dt) {
  return 2 * phase - 1 - polyBlep(phase, dt);
}

export function sine(phase) { return Math.sin(phase * 2 * Math.PI); }

/** A smooth triangle, integrated from the band-limited square. Used by 16-bit. */
export function triangle(phase) {
  return phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
}

/**
 * The NES triangle: a staircase of sixteen levels up and sixteen down.
 *
 * It is not band-limited on purpose. The corners of those steps are the rasp,
 * and smoothing them is exactly the difference between a 2A03 bass and a
 * synthesiser playing a triangle wave.
 */
export function nesTriangle(phase) {
  const i = Math.floor(phase * 32) % 32;
  return ((i < 16 ? i : 31 - i) / 7.5) - 1;
}

// -------------------------------------------------------------------- noise --

/**
 * The NES noise channel: a fifteen-bit shift register clocked at one of
 * sixteen periods, feeding back bit 0 xor bit 1 -- or bit 6 in short mode,
 * which drops the sequence from 32767 steps to 93 and turns hiss into a
 * pitched metallic rasp. Lifted from VECTRENCH/src/nes.js, which is the
 * reference implementation and is unchanged here.
 */
export function lfsr(seconds, { short = false, period = 8, rate = RATE } = {}) {
  const clocks = CPU_HZ / period;
  const len = Math.max(1, Math.floor(rate * seconds));
  const out = new Float32Array(len);
  const per = rate / clocks;
  let reg = 1, acc = 0, level = 1;
  for (let i = 0; i < len; i++) {
    acc += 1;
    while (acc >= per) {
      acc -= per;
      const bit = (reg ^ (reg >> (short ? 6 : 1))) & 1;
      reg = (reg >> 1) | (bit << 14);
      level = (reg & 1) ? -1 : 1;
    }
    out[i] = level;
  }
  return out;
}

/** True white noise, for the 16-bit era where the shift register is not the point. */
export function white(seconds, seed = 0x2545f491, rate = RATE) {
  const out = new Float32Array(Math.max(1, Math.floor(rate * seconds)));
  let s = seed >>> 0;
  for (let i = 0; i < out.length; i++) {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    out[i] = (s / 0x7fffffff) - 1;
  }
  return out;
}

const NOISE_CACHE = new Map();
/** Shared noise beds, built once. Deterministic, so renders are reproducible. */
export function noiseBed(kind) {
  if (NOISE_CACHE.has(kind)) return NOISE_CACHE.get(kind);
  const buf = kind === 'metal' ? lfsr(2, { short: true, period: 64 })
    : kind === 'white' ? white(2)
      : lfsr(2, { short: false, period: 8 });
  NOISE_CACHE.set(kind, buf);
  return buf;
}

// -------------------------------------------------------------- the 2A03 bits --

/**
 * A frequency as the hardware could actually have played it.
 *
 * The pulse channels divide the CPU clock by an eleven-bit period, so playable
 * pitches are a fixed grid that grows coarse at the top -- near C7 the gap is
 * most of a semitone, which is why NES leads sound sour up there. That sourness
 * is character, not error, and `era: 8bit` keeps it.
 */
export function quantize(f) {
  if (!(f > 0)) return f;
  const p = Math.round(CPU_HZ / (16 * f)) - 1;
  if (p < 8) return CPU_HZ / (16 * 9);
  if (p > 2047) return f;
  return CPU_HZ / (16 * (p + 1));
}

/** How far off the wanted pitch that grid puts you, in cents. */
export const quantizeError = (f) => 1200 * Math.log2(quantize(f) / f);

/**
 * The sweep unit: every tick it adds or subtracts the period shifted right by
 * `shift`, a change of a fixed fraction -- so a slide covers the same musical
 * interval wherever it starts, and accelerates in Hz as it rises.
 */
export function sweepPoints(f0, { up = true, shift = 4, ticks = 10, rate = 120 } = {}) {
  const pts = [];
  let period = CPU_HZ / (16 * f0) - 1;
  for (let i = 0; i < ticks; i++) {
    period += up ? -(Math.floor(period) >> shift) : (Math.floor(period) >> shift);
    if (period < 8 || period > 2047) break;
    pts.push({ t: (i + 1) / rate, f: CPU_HZ / (16 * (period + 1)) });
  }
  return pts;
}

// ---------------------------------------------------------------- envelopes --

/**
 * ADSR, as a function of age in seconds. `dur` is the note's held length; the
 * release runs past it, which is why a voice's tail can overlap the next note.
 */
export function adsr(age, dur, { a = 0.005, d = 0.05, s = 0.7, r = 0.08 } = {}) {
  if (age < 0) return 0;
  if (age < a) return age / a;
  if (age < a + d) return 1 - (1 - s) * ((age - a) / d);
  if (age < dur) return s;
  const rel = age - dur;
  return rel < r ? s * (1 - rel / r) : 0;
}

/**
 * The 2A03 envelope: fifteen steps down, counted, not eased. On a short note
 * you hear the stairs, and that is the point.
 */
export function nesEnv(age, dur, ticks = 15) {
  if (age < 0 || age > dur) return 0;
  if (age < 0.004) return age / 0.004;
  const k = Math.floor(((age - 0.004) / (dur - 0.004)) * ticks);
  return Math.max(0, (ticks - k) / ticks);
}

// ------------------------------------------------------------------ filters --

/** RBJ cookbook biquad, direct form I. One instance per voice per render. */
export class Biquad {
  constructor(type, freq, q = 0.707, gainDb = 0, rate = RATE) {
    this.x1 = this.x2 = this.y1 = this.y2 = 0;
    this.set(type, freq, q, gainDb, rate);
  }

  set(type, freq, q = 0.707, gainDb = 0, rate = RATE) {
    const w = 2 * Math.PI * Math.min(Math.max(freq, 10), rate * 0.49) / rate;
    const cw = Math.cos(w), sw = Math.sin(w);
    const alpha = sw / (2 * Math.max(0.0001, q));
    const A = 10 ** (gainDb / 40);
    let b0, b1, b2, a0, a1, a2;
    switch (type) {
      case 'highpass':
        b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0;
        a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; break;
      case 'bandpass':
        b0 = alpha; b1 = 0; b2 = -alpha;
        a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; break;
      case 'peaking':
        b0 = 1 + alpha * A; b1 = -2 * cw; b2 = 1 - alpha * A;
        a0 = 1 + alpha / A; a1 = -2 * cw; a2 = 1 - alpha / A; break;
      case 'lowshelf': {
        const s = 2 * Math.sqrt(A) * alpha;
        b0 = A * ((A + 1) - (A - 1) * cw + s); b1 = 2 * A * ((A - 1) - (A + 1) * cw);
        b2 = A * ((A + 1) - (A - 1) * cw - s); a0 = (A + 1) + (A - 1) * cw + s;
        a1 = -2 * ((A - 1) + (A + 1) * cw); a2 = (A + 1) + (A - 1) * cw - s; break;
      }
      case 'highshelf': {
        const s = 2 * Math.sqrt(A) * alpha;
        b0 = A * ((A + 1) + (A - 1) * cw + s); b1 = -2 * A * ((A - 1) + (A + 1) * cw);
        b2 = A * ((A + 1) + (A - 1) * cw - s); a0 = (A + 1) - (A - 1) * cw + s;
        a1 = 2 * ((A - 1) - (A + 1) * cw); a2 = (A + 1) - (A - 1) * cw - s; break;
      }
      default: // lowpass
        b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0;
        a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha;
    }
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0;
    this.a1 = a1 / a0; this.a2 = a2 / a0;
    return this;
  }

  run(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2
      - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x;
    this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

// -------------------------------------------------------------------- delay --

/**
 * The echo send. This is the SNES's signature -- an S-DSP echo buffer with a
 * short FIR in the feedback path -- and it is most of why 16-bit soundtracks
 * sound wet where 8-bit ones sound dry. One send bus per render.
 */
export class Echo {
  constructor(time = 0.16, feedback = 0.35, damp = 4200, rate = RATE) {
    this.n = Math.max(1, Math.floor(time * rate));
    this.buf = new Float32Array(this.n);
    this.i = 0;
    this.fb = Math.min(0.85, feedback);
    this.lp = new Biquad('lowpass', damp, 0.707, 0, rate);
  }

  run(x) {
    const out = this.buf[this.i];
    this.buf[this.i] = this.lp.run(x + out * this.fb);
    this.i = (this.i + 1) % this.n;
    return out;
  }
}

// ------------------------------------------------------------------ helpers --

export const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
export const db = (x) => 20 * Math.log10(Math.max(1e-9, Math.abs(x)));
export const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);

/** Equal-power pan. -1 hard left, 0 centre, 1 hard right. */
export function panGains(p) {
  const a = (clamp(p, -1, 1) + 1) * 0.25 * Math.PI;
  return [Math.cos(a), Math.sin(a)];
}

/**
 * Hold the mix under a ceiling, and report what it took.
 *
 * A whole-signal scale was costing FUR ELISE 3.3 dB because a handful of piano
 * attacks poked above the ceiling -- so the entire track came out quieter than
 * its 8-bit twin, and the A/B stopped comparing timbre. This rides the gain
 * instead: it pulls down only around the peaks and recovers, so the body of
 * the track keeps its level.
 *
 * 5 ms attack, not 1: at a 73 Hz bass note one cycle is 13.7 ms, and a gain
 * envelope that moves faster than the waveform IS distortion rather than
 * limiting. A final clamp catches the few samples the attack cannot reach.
 *
 * Returns the peak AFTER the reduction, plus how much was applied. Returning
 * the peak it found rather than the peak it left behind is a lie that reads as
 * "this track clips" about a track that does not -- and it hides the thing
 * actually worth knowing, which is how many dB of headroom the arrangement is
 * short. A whole-signal scale is used rather than a real limiter because it is
 * transparent: nothing is distorted, the track is simply quieter.
 */
export function limit(L, R, ceiling = 0.89, rate = RATE) {
  let raw = 0;
  for (let i = 0; i < L.length; i++) raw = Math.max(raw, Math.abs(L[i]), Math.abs(R[i]));
  if (raw <= ceiling || raw === 0) return { peak: raw, reducedDb: 0, rawPeak: raw };

  const att = Math.exp(-1 / (0.005 * rate));
  const rel = Math.exp(-1 / (0.150 * rate));
  let g = 1, minG = 1, peak = 0;
  for (let i = 0; i < L.length; i++) {
    const x = Math.max(Math.abs(L[i]), Math.abs(R[i]));
    const want = x > ceiling ? ceiling / x : 1;
    g = want < g ? att * g + (1 - att) * want : rel * g + (1 - rel) * want;
    if (g < minG) minG = g;
    let l = L[i] * g, r = R[i] * g;
    if (l > ceiling) l = ceiling; else if (l < -ceiling) l = -ceiling;
    if (r > ceiling) r = ceiling; else if (r < -ceiling) r = -ceiling;
    L[i] = l; R[i] = r;
    peak = Math.max(peak, Math.abs(l), Math.abs(r));
  }
  return { peak, reducedDb: 20 * Math.log10(minG), rawPeak: raw };
}
