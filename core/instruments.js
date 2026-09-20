// The instruments, as data.
//
// A voice is a list of layers, summed by the renderer. Common layer roles:
//
//   an octave down   fills in body a thin waveform lacks
//   a detune         two copies a few cents apart beat against each other
//   a delayed copy   a quieter repeat, for depth on a mono voice
//   a noise layer    10-30 ms at the front, for the attack transient
//
// `sound explain <inst>` prints any instrument's layers.
//
//   osc      pulse | nestri | tri | saw | sine | noise | fm
//   duty     pulse width, 0.125 / 0.25 / 0.5 on real hardware
//   semi     transpose, in semitones
//   detune   in cents, for beating between layers
//   gain     this layer's share of the voice
//   delay    seconds late, for a slapback layer
//   bed      noise flavour: long (hiss) | metal (short register) | white

// `trim` is a per-instrument loudness calibration, and it is not cosmetic.
//
// Measured across the library, the same `mix=` value produced a 21.5 dB spread
// in perceived level: a 50% pulse is 12.6 dB louder than a pluck for identical
// settings, because nothing ever made them agree. That meant a score's balance
// was an accident of which synthesis method each voice happened to use, and it
// changed when the era changed -- which is exactly why 16-bit renders came out
// bass-heavy while 8-bit ones did not. The chord voice was simply vanishing.
//
// Each number is the gain that brings a sustained A3 to a common K-weighted
// level, so `mix=0.15` now means the same loudness whatever is playing it.
// Regenerate them with tools/calibrate.mjs after changing any layer.

// --- FM, for the 16-bit era -------------------------------------------------
//
// Four operators. `mod` lists, per operator, which operators modulate it;
// `out` lists which operators are heard -- the YM2612's algorithm table as a
// graph. A chain is metallic; parallel carriers are organ-like; one modulator
// at a low ratio with a fast decay is a brass patch.

export const ALGOS = {
  chain: { mod: [[1], [2], [3], []], out: [0] },
  brass: { mod: [[1], [], [], []], out: [0, 2] },
  bell: { mod: [[1, 2], [], [], []], out: [0] },
  organ: { mod: [[], [], [], []], out: [0, 1, 2] },
  bass: { mod: [[1], [], [], []], out: [0] },
};

const op = (ratio, level, a, d, s, r, fb = 0) => ({ ratio, level, a, d, s, r, fb });

export const INSTRUMENTS = {

  // ======================================================= 8-bit: the 2A03 ==
  //
  // Pitch quantised to the eleven-bit period register and the envelope counted
  // down in fifteen steps. Both are audible and both are the point.

  pulse12: {
    era: '8bit', trim: 0.294, quantize: true, env: 'nes',
    desc: 'Pulse, 12.5% duty. Thin and nasal.',
    layers: [{ osc: 'pulse', duty: 0.125, gain: 1 }],
  },
  pulse25: {
    era: '8bit', trim: 0.218, quantize: true, env: 'nes',
    desc: 'Pulse, 25% duty.',
    layers: [{ osc: 'pulse', duty: 0.25, gain: 1 }],
  },
  pulse50: {
    era: '8bit', trim: 0.192, quantize: true, env: 'nes',
    desc: 'Pulse, 50% duty. No even harmonics.',
    layers: [{ osc: 'pulse', duty: 0.5, gain: 1 }],
  },
  // The layered lead: the reason VECTRENCH's lead sounds like an instrument.
  lead: {
    era: '8bit', trim: 0.216, quantize: true, env: 'nes', cut: 3000,
    desc: '25% pulse plus a stepped triangle an octave below.',
    layers: [
      { osc: 'pulse', duty: 0.25, gain: 1 },
      { osc: 'nestri', semi: -12, gain: 0.42 },
    ],
  },
  // The layered lead with a slapback, which is AXI's trick.
  'lead-echo': {
    era: '8bit', trim: 0.267, quantize: true, env: 'nes', cut: 3200,
    desc: '12.5% pulse, a triangle an octave below, and a repeat 170 ms later.',
    layers: [
      { osc: 'pulse', duty: 0.125, gain: 1 },
      { osc: 'nestri', semi: -12, gain: 0.35 },
      { osc: 'pulse', duty: 0.125, gain: 0.4, delay: 0.17 },
    ],
  },
  tri: {
    era: '8bit', trim: 0.322, quantize: true, env: 'nes',
    desc: 'The 2A03 triangle: a 32-level staircase.',
    layers: [{ osc: 'nestri', gain: 1 }],
  },
  bass: {
    era: '8bit', trim: 0.29, quantize: true, env: 'nes', cut: 900,
    desc: 'Hardware triangle plus a quiet 50% square.',
    layers: [
      { osc: 'nestri', gain: 1 },
      { osc: 'pulse', duty: 0.5, gain: 0.3 },
    ],
  },
  arp: {
    era: '8bit', trim: 0.235, quantize: true, env: 'nes', cut: 2600, arpRate: 1,
    desc: 'One voice cycling the notes of a chord, one per step.',
    layers: [{ osc: 'pulse', duty: 0.5, gain: 1 }],
  },
  kit: { era: '8bit', trim: 0.55, drums: '8bit', desc: '2A03 kit: noise channel and a swept sine.' },

  // ==================================================== 16-bit: SNES/Genesis ==
  //
  // True equal temperament, ADSR rather than a fifteen-step counter, stereo,
  // FM operators and an echo send. Everything the 8-bit entries deliberately
  // refuse.

  'fm-lead': {
    // The low-pass is not taste. FM built by summing sines has no band limit,
    // so a bright patch on a high note folds its upper sidebands back down as
    // an inharmonic whistle. Rolling off near 7 kHz costs nothing audible and
    // removes the folded energy.
    era: '16bit', trim: 0.404, env: { a: 0.006, d: 0.12, s: 0.72, r: 0.12 }, cut: 7000,
    desc: 'FM, two carriers and one modulator with a fast decay.',
    fm: {
      algo: 'brass',
      ops: [op(1, 1, 0.005, 0.10, 0.80, 0.10), op(2, 0.55, 0.004, 0.09, 0.22, 0.08),
        op(1.005, 0.45, 0.006, 0.12, 0.75, 0.12), op(1, 0, 0, 0, 0, 0)],
    },
    layers: [{ osc: 'fm', gain: 1 }],
  },
  'fm-bass': {
    era: '16bit', trim: 0.382, env: { a: 0.003, d: 0.14, s: 0.55, r: 0.09 }, cut: 2600,
    desc: 'FM, one modulator at 1:1 with light feedback, plus a sine an octave up.',
    fm: {
      algo: 'bass',
      ops: [op(1, 1, 0.002, 0.16, 0.60, 0.08), op(1, 0.42, 0.002, 0.07, 0.12, 0.05, 0.22),
        op(1, 0, 0, 0, 0, 0), op(1, 0, 0, 0, 0, 0)],
    },
    // NO sub-octave layer. A 1:1 FM bass with feedback already has a strong
    // fundamental, and a sine an octave under it is subsonic the moment the
    // part is written where bass parts are actually written: under Canon's D2
    // it lands on 36.7 Hz, which no laptop, phone or TV reproduces as a pitch.
    // What you get instead is cone excursion -- heard as a scratch -- and a
    // limiter pulling the whole mix down to make room for a note nobody can
    // hear. The weight goes at the octave ABOVE instead, which is where a
    // small speaker can actually render it.
    layers: [{ osc: 'fm', gain: 1 }, { osc: 'sine', semi: 12, gain: 0.14 }],
  },
  'fm-bell': {
    era: '16bit', trim: 0.248, env: { a: 0.002, d: 0.9, s: 0.06, r: 0.5 }, cut: 9000,
    desc: 'FM with inharmonic ratios (3.51, 7.02) and a long decay.',
    fm: {
      algo: 'bell',
      ops: [op(1, 1, 0.001, 0.8, 0.05, 0.5), op(3.51, 0.42, 0.001, 0.35, 0.02, 0.3),
        op(7.02, 0.18, 0.001, 0.22, 0.01, 0.2), op(1, 0, 0, 0, 0, 0)],
    },
    layers: [{ osc: 'fm', gain: 1 }],
  },
  strings: {
    era: '16bit', trim: 0.334, env: { a: 0.09, d: 0.25, s: 0.80, r: 0.30 }, cut: 4200,
    desc: 'Three saws at -7, 0 and +7 cents, plus a sine an octave below.',
    layers: [
      { osc: 'saw', detune: -7, gain: 0.55 },
      { osc: 'saw', detune: 0, gain: 0.55 },
      { osc: 'saw', detune: 7, gain: 0.55 },
      { osc: 'sine', semi: -12, gain: 0.22 },
    ],
  },
  pad: {
    era: '16bit', trim: 0.418, env: { a: 0.35, d: 0.4, s: 0.85, r: 0.6 }, cut: 2600,
    desc: 'Two detuned saws, a triangle a fifth up, and a sine an octave below.',
    layers: [
      { osc: 'saw', detune: -9, gain: 0.4 },
      { osc: 'saw', detune: 9, gain: 0.4 },
      { osc: 'tri', semi: 7, gain: 0.25 },
      { osc: 'sine', semi: -12, gain: 0.3 },
    ],
  },
  piano: {
    era: '16bit', trim: 0.658, env: { a: 0.002, d: 0.85, s: 0.14, r: 0.28 }, cut: 5200,
    desc: 'Triangle and saw, an octave-up sine, and a 12 ms noise transient.',
    layers: [
      { osc: 'tri', gain: 0.52 },
      { osc: 'saw', gain: 0.40 },
      { osc: 'sine', semi: 12, gain: 0.20 },
      { osc: 'noise', bed: 'white', gain: 0.07, hold: 0.012 },
    ],
  },
  organ: {
    era: '16bit', trim: 0.294, env: { a: 0.01, d: 0.05, s: 0.95, r: 0.06 },
    desc: 'Four sines: root, octave, fifth, two octaves.',
    layers: [
      { osc: 'sine', gain: 0.6 },
      { osc: 'sine', semi: 12, gain: 0.35 },
      { osc: 'sine', semi: 19, gain: 0.2 },
      { osc: 'sine', semi: 24, gain: 0.12 },
    ],
  },
  pluck: {
    era: '16bit', trim: 1.517, env: { a: 0.002, d: 0.22, s: 0.0, r: 0.1 }, cut: 3800,
    desc: 'A short saw, a triangle an octave up, and an 8 ms noise transient.',
    layers: [
      { osc: 'saw', gain: 0.75 },
      { osc: 'tri', semi: 12, gain: 0.2 },
      { osc: 'noise', bed: 'white', gain: 0.1, hold: 0.008 },
    ],
  },
  'kit16': { era: '16bit', trim: 0.285, drums: '16bit', desc: 'Layered kit: body, snap and air.' },
};

/** The instrument an era falls back to when a score names one from the other. */
export const SUBSTITUTE = {
  '8bit': {
    'fm-lead': 'lead', 'fm-bass': 'bass', 'fm-bell': 'pulse12', strings: 'pulse50',
    pad: 'tri', piano: 'pulse25', organ: 'pulse50', pluck: 'pulse12', kit16: 'kit',
  },
  '16bit': {
    pulse12: 'fm-lead', pulse25: 'fm-lead', pulse50: 'organ', lead: 'fm-lead',
    'lead-echo': 'fm-lead', tri: 'fm-bass', bass: 'fm-bass', arp: 'pluck', kit: 'kit16',
  },
};

/**
 * The instrument a voice actually gets, for the era being rendered.
 *
 * This is what makes side-by-side A/B possible from ONE score: the same file
 * plays on the 2A03 or on a 16-bit rig, and the mapping is declared above
 * rather than decided per track. A score may still name an instrument from the
 * other era on purpose -- an FM bass under 8-bit leads is a real choice -- so
 * substitution only happens when the eras disagree.
 */
export function instrumentFor(name, era) {
  const want = INSTRUMENTS[name];
  if (!want) return { name: era === '16bit' ? 'fm-lead' : 'pulse25', inst: INSTRUMENTS[era === '16bit' ? 'fm-lead' : 'pulse25'], substituted: true };
  if (want.era === era) return { name, inst: want, substituted: false };
  const alt = SUBSTITUTE[era]?.[name];
  if (alt && INSTRUMENTS[alt]) return { name: alt, inst: INSTRUMENTS[alt], substituted: true, from: name };
  return { name, inst: want, substituted: false };
}

export const listInstruments = (era) => Object.entries(INSTRUMENTS)
  .filter(([, v]) => !era || v.era === era)
  .map(([k, v]) => ({ name: k, era: v.era, desc: v.desc, layers: v.layers?.length ?? 0 }));
