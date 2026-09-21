// Sound effects: the same plain-text, one-file-per-thing discipline as a
// score, because an effect is just as much something you review in a diff.
//
// AN EFFECT IS A STACK OF LAYERS AND NOTHING ELSE. One line is one layer, and
// reading top to bottom tells you how the sound is built:
//
//   @fx laser
//     desc  a charged shot
//
//   @era 8bit
//     tone   wave=pulse25  from=1800  to=220  dur=0.18  gain=0.16
//     tone   wave=pulse12  from=900   to=110  dur=0.18  gain=0.08  at=0.005
//     noise  bed=metal     from=6000  to=1200 dur=0.06  gain=0.06
//
// That third line is the attack. Nearly every effect that sounds "real"
// rather than "synthesised" is a tonal layer for the pitch, a second tonal
// layer an octave down for weight, and a short noise burst on the very front
// for the transient -- the click of the switch, the pluck of the string, the
// slap of the water. Ears locate an event by its first 20 ms, so the noise
// layer does more work than its gain suggests.

import {
  RATE, pulse, saw, sine, triangle, nesTriangle, noiseBed, quantize,
  Biquad, Echo, panGains, limit, clamp, db,
} from './dsp.js';

const num = (v, d) => (v === undefined ? d : Number(v));

/** Parse a .fx file. Like scores, collects every error rather than throwing. */
export function parseFx(text, filename = '<fx>') {
  const fx = { id: null, desc: '', tags: [], eras: {}, vary: null, source: filename };
  const errors = [];
  let era = null;
  let inHeader = false;

  text.split(/\r?\n/).forEach((rawLine, i) => {
    const at = `${filename}:${i + 1}`;
    const line = rawLine.replace(/\s+#.*$/, '').replace(/^\s*#.*$/, '').trim();
    if (!line) return;

    if (line.startsWith('@')) {
      const [word, ...rest] = line.slice(1).split(/\s+/);
      if (word === 'fx') { fx.id = rest[0]; inHeader = true; era = null; }
      else if (word === 'era') { era = rest[0]; fx.eras[era] = []; inHeader = false; }
      else if (word === 'vary') {
        fx.vary = Object.fromEntries(rest.map((kv) => {
          const j = kv.indexOf('=');
          return [kv.slice(0, j), Number(kv.slice(j + 1))];
        }));
      } else errors.push(`${at}: unknown directive @${word}`);
      return;
    }

    if (inHeader) {
      const [key, ...vals] = line.split(/\s+/);
      if (key === 'desc') fx.desc = vals.join(' ');
      else if (key === 'tags') fx.tags = vals;
      else errors.push(`${at}: unknown fx key '${key}'`);
      return;
    }

    if (!era) { errors.push(`${at}: layer outside any @era`); return; }
    const [kind, ...rest] = line.split(/\s+/);
    if (!['tone', 'noise', 'echo'].includes(kind)) {
      errors.push(`${at}: unknown layer type '${kind}' (tone, noise, echo)`);
      return;
    }
    const o = {};
    for (const kv of rest) {
      const j = kv.indexOf('=');
      if (j < 0) { errors.push(`${at}: '${kv}' is not key=value`); continue; }
      o[kv.slice(0, j)] = kv.slice(j + 1);
    }
    fx.eras[era].push({ kind, ...o, line: i + 1 });
  });

  if (!fx.id) errors.push(`${filename}: no @fx`);
  if (!Object.keys(fx.eras).length) errors.push(`${filename}: no @era blocks`);
  return { fx, errors };
}

const WAVES = {
  sine: (p) => sine(p), tri: (p) => triangle(p), nestri: (p) => nesTriangle(p),
  saw: (p, dt) => saw(p, dt), square: (p, dt) => pulse(p, dt, 0.5),
  pulse12: (p, dt) => pulse(p, dt, 0.125), pulse25: (p, dt) => pulse(p, dt, 0.25),
  pulse50: (p, dt) => pulse(p, dt, 0.5),
};

/** A deterministic PRNG, so `--vary` stays reproducible under a given seed. */
function rng(seed) {
  let s = (seed || 1) >>> 0;
  return () => {
    s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
    return s / 0xffffffff;
  };
}

/**
 * Render one effect for one era.
 *
 * `crush` is what makes an 8-bit effect sound 8-bit beyond its waveform: the
 * DMC channel was seven bits and everything sampled went through it, so
 * quantising the output is a real part of the character rather than a filter
 * pretending to be one.
 */
export function renderFx(fx, era = '8bit', {
  rate = RATE, seed = 1, vary = false, targetPeakDb = -3, normalize = true,
  maxLayers = null, soloLayer = null,
} = {}) {
  let layers = fx.eras[era] || fx.eras[Object.keys(fx.eras)[0]] || [];
  // Layer isolation. `maxLayers` plays the first N, which is how you hear an
  // effect being BUILT one line at a time; `soloLayer` plays exactly one,
  // which is how you find out what a line you do not understand contributes.
  // The echo bus is not a layer and rides along with whatever is left.
  if (soloLayer !== null) {
    const sounding = layers.filter((l) => l.kind !== 'echo');
    layers = [sounding[soloLayer]].filter(Boolean);
  } else if (maxLayers !== null) {
    let kept = 0;
    layers = layers.filter((l) => (l.kind === 'echo' ? true : kept++ < maxLayers));
  }
  const rand = rng(seed);
  const jitter = (amount) => (vary && amount ? 1 + (rand() * 2 - 1) * amount : 1);

  const span = layers.reduce((m, l) => Math.max(m, num(l.at, 0) + num(l.dur, 0)), 0.2);
  const n = Math.ceil((span + 0.5) * rate);
  const L = new Float32Array(n), R = new Float32Array(n), S = new Float32Array(n);
  let echoCfg = null;

  for (const l of layers) {
    if (l.kind === 'echo') { echoCfg = l; continue; }
    const at = num(l.at, 0);
    const dur = num(l.dur, 0.12);
    const start = Math.floor(at * rate);
    const len = Math.floor(dur * rate);
    const gain = num(l.gain, 0.12) * jitter(fx.vary?.gain);
    const pitchJ = jitter(fx.vary?.pitch);
    const [gl, gr] = panGains(num(l.pan, 0));
    const from = num(l.from, 440) * pitchJ;
    const to = num(l.to, from) * pitchJ;
    const curve = l.curve || 'exp';
    const send = num(l.send, era === '16bit' ? 0.12 : 0);
    const crush = l.crush ? Number(l.crush) : (era === '8bit' ? 0 : 0);
    const shape = l.shape || 'exp';          // amplitude decay shape
    // How long the layer takes to reach full, in seconds. A tone gets 3 ms by
    // default -- enough that it does not start mid-cycle with a click -- and
    // noise gets none, because a transient IS an instant onset and ramping it
    // is how you blunt the one layer whose whole job is the first 20 ms.
    //
    // Set it longer and the layer SWELLS rather than strikes, against the
    // decay shape still running underneath it, which makes a hump. That is the
    // difference between water being hit and water being moved through: a
    // splash is an onset, a swish is a swell. Nothing else in the envelope
    // vocabulary can rise, so without this a mid-sound layer can only ever
    // arrive as an impact.
    const riseN = num(l.rise, l.kind === 'tone' ? 0.003 : 0) * rate;
    const attackAt = (i) => (i < riseN ? i / riseN : 1);

    if (l.kind === 'tone') {
      const wave = WAVES[l.wave] || WAVES.square;
      const q8 = era === '8bit' && l.quantize !== 'off';
      let phase = 0;
      for (let i = 0; i < len; i++) {
        const j = start + i;
        if (j >= n) break;
        const u = i / len;
        let f = curve === 'lin' ? from + (to - from) * u : from * (to / from) ** u;
        if (q8) f = quantize(f);
        phase = (phase + f / rate) % 1;
        const env = shape === 'lin' ? (1 - u)
          : shape === 'flat' ? 1
            : shape === 'hit' ? (1 - u) ** 3.2
              : (1 - u) ** 1.8;
        let s = wave(phase, f / rate) * env * attackAt(i) * gain;
        if (crush) s = Math.round(clamp(s, -1, 1) * (2 ** crush - 1)) / (2 ** crush - 1);
        L[j] += s * gl; R[j] += s * gr; S[j] += s * send;
      }
      continue;
    }

    // noise
    const bed = noiseBed(l.bed || (era === '8bit' ? 'long' : 'white'));
    const ft = l.filter || 'lowpass';
    const q = num(l.q, 1);
    const filt = new Biquad(ft, from, q, 0, rate);
    const off = Math.floor(num(l.off, 0) * rate) || (l.line * 977) % (bed.length - len - 1);
    for (let i = 0; i < len; i++) {
      const j = start + i;
      if (j >= n) break;
      const u = i / len;
      const f = curve === 'lin' ? from + (to - from) * u : from * (to / from) ** u;
      filt.set(ft, f, q, 0, rate);
      const env = shape === 'lin' ? (1 - u)
        : shape === 'flat' ? 1
          : shape === 'hit' ? (1 - u) ** 3.2
            : (1 - u) ** 1.8;
      let s = filt.run(bed[(off + i) % bed.length]) * env * attackAt(i) * gain;
      if (crush) s = Math.round(clamp(s, -1, 1) * (2 ** crush - 1)) / (2 ** crush - 1);
      L[j] += s * gl; R[j] += s * gr; S[j] += s * send;
    }
  }

  if (echoCfg && era !== '8bit') {
    const e = new Echo(num(echoCfg.time, 0.1), num(echoCfg.fb, 0.3), num(echoCfg.damp, 4000), rate);
    const send = num(echoCfg.send, 0.25);
    for (let i = 0; i < n; i++) {
      const w = e.run(S[i] * send);
      L[i] += w * 0.9; R[i] += w;
    }
  }

  // Peak-matched, not RMS-matched: a one-shot's RMS is mostly silence, so
  // matching it would make a long tail quiet and a short tick deafening. Peak
  // is what a game's mixer balances against anyway.
  let raw = 0;
  for (let i = 0; i < n; i++) raw = Math.max(raw, Math.abs(L[i]), Math.abs(R[i]));
  let gain = 1;
  // Isolated layers are NOT re-normalised to full: hearing layer 3 at the
  // level it actually sits at in the stack is the whole point, and boosting
  // it to -3 dB would misrepresent how much it contributes.
  if (normalize && raw > 1e-6 && soloLayer === null && maxLayers === null) {
    gain = clamp((10 ** (targetPeakDb / 20)) / raw, 0.1, 20);
    for (let i = 0; i < n; i++) { L[i] *= gain; R[i] *= gain; }
  }
  const { peak } = limit(L, R, 0.92);
  return {
    L, R, rate, era,
    stats: { seconds: n / rate, peakDb: db(peak), gainDb: db(gain), layers: layers.filter((l) => l.kind !== 'echo').length },
  };
}

/** Print an effect's construction, layer by layer. Used by `sound fx explain`. */
export function explainFx(fx, era) {
  const layers = fx.eras[era] || [];
  let n = 0;
  return layers.map((l) => {
    const bits = Object.entries(l)
      .filter(([k]) => !['kind', 'line'].includes(k))
      .map(([k, v]) => `${k}=${v}`).join(' ');
    // The echo bus is configuration, not a layer, so it does not take a
    // number -- otherwise `sound fx explain` says "4 layers" above a list of
    // five numbered lines.
    const label = l.kind === 'echo' ? '  ~' : `${String(++n).padStart(3)}.`;
    return `${label} ${l.kind.padEnd(5)} ${bits}`;
  });
}
