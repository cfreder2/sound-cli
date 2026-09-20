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
    era: '8bit', trim: 0.276, quantize: true, env: 'nes',
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
  // --- 8-bit: two techniques the duty cycles do not cover -------------------

  'noise-lead': {
    era: '8bit', trim: 0.166, quantize: true, env: 'nes',
    desc: 'Short-mode noise, resampled to track pitch. A melodic voice on the 2A03.',
    layers: [{ osc: 'noise', bed: 'metal', gain: 1, pitched: true }],
  },
  dpcm: {
    era: '8bit', trim: 0.463, quantize: true, env: 'nes', cut: 2400,
    desc: 'A crushed sampled voice: five-bit quantisation, like the DMC channel.',
    layers: [
      { osc: 'nestri', gain: 0.8, crush: 5 },
      { osc: 'pulse', duty: 0.25, gain: 0.3, crush: 5 },
    ],
  },

  // --- 16-bit: brass --------------------------------------------------------

  brass: {
    era: '16bit', trim: 0.325, env: { a: 0.035, d: 0.10, s: 0.82, r: 0.12 }, cut: 6000,
    desc: 'FM brass section. The modulator decays fast, so the attack is brighter than the body.',
    fm: {
      algo: 'brass',
      ops: [op(1, 1, 0.02, 0.09, 0.85, 0.12), op(1, 0.62, 0.005, 0.07, 0.28, 0.08),
        op(2.01, 0.35, 0.03, 0.12, 0.70, 0.12), op(1, 0, 0, 0, 0, 0)],
    },
    layers: [{ osc: 'fm', gain: 1 }],
  },
  horn: {
    era: '16bit', trim: 0.41, env: { a: 0.07, d: 0.15, s: 0.85, r: 0.20 }, cut: 3000,
    desc: 'A mellow horn: the same algorithm as brass with half the modulation.',
    fm: {
      algo: 'brass',
      ops: [op(1, 1, 0.05, 0.12, 0.88, 0.20), op(1, 0.30, 0.02, 0.10, 0.35, 0.10),
        op(1.004, 0.40, 0.06, 0.15, 0.80, 0.20), op(1, 0, 0, 0, 0, 0)],
    },
    layers: [{ osc: 'fm', gain: 1 }],
  },

  // --- 16-bit: winds. A reed is a waveform and a formant ---------------------

  flute: {
    era: '16bit', trim: 0.261, env: { a: 0.055, d: 0.12, s: 0.88, r: 0.12 },
    cut: 5000, eq: { f: 1200, q: 1.0, gain: 4 },
    desc: 'Sine, an octave above it, and continuous breath noise.',
    layers: [
      { osc: 'sine', gain: 0.85 },
      { osc: 'sine', semi: 12, gain: 0.14 },
      { osc: 'noise', bed: 'white', gain: 0.035 },
    ],
  },
  clarinet: {
    era: '16bit', trim: 0.161, env: { a: 0.030, d: 0.08, s: 0.90, r: 0.10 },
    cut: 3200, eq: { f: 1500, q: 1.4, gain: 5 },
    desc: 'A 50% pulse, which has only odd harmonics -- the hollow reed.',
    layers: [
      { osc: 'pulse', duty: 0.5, gain: 0.8 },
      { osc: 'sine', gain: 0.2 },
      { osc: 'noise', bed: 'white', gain: 0.02 },
    ],
  },
  oboe: {
    era: '16bit', trim: 0.308, env: { a: 0.028, d: 0.09, s: 0.86, r: 0.10 },
    cut: 5200, eq: { f: 1400, q: 2.2, gain: 8 },
    desc: 'A narrow 18% pulse under a sharp formant. Same reed as clarinet, different peak.',
    layers: [
      { osc: 'pulse', duty: 0.18, gain: 0.7 },
      { osc: 'saw', gain: 0.18 },
      { osc: 'noise', bed: 'white', gain: 0.022 },
    ],
  },

  // --- 16-bit: voices and plucked ------------------------------------------

  choir: {
    era: '16bit', trim: 0.369, env: { a: 0.16, d: 0.30, s: 0.90, r: 0.35 },
    cut: 3400, eq: { f: 800, q: 1.1, gain: 6 },
    desc: 'Three saws at -11, +6 and +14 cents under a vowel formant, slow attack.',
    layers: [
      { osc: 'saw', detune: -11, gain: 0.40 },
      { osc: 'saw', detune: 6, gain: 0.40 },
      { osc: 'saw', detune: 14, gain: 0.30 },
      { osc: 'sine', semi: -12, gain: 0.15 },
    ],
  },
  harp: {
    era: '16bit', trim: 0.658, env: { a: 0.002, d: 0.90, s: 0.05, r: 0.50 }, cut: 5200,
    desc: 'Plucked, with a long decay and an 8 ms noise transient.',
    layers: [
      { osc: 'tri', gain: 0.6 },
      { osc: 'saw', gain: 0.3 },
      { osc: 'sine', semi: 12, gain: 0.15 },
      { osc: 'noise', bed: 'white', gain: 0.05, hold: 0.008 },
    ],
  },
  guitar: {
    era: '16bit', trim: 0.768, env: { a: 0.003, d: 0.55, s: 0.12, r: 0.25 },
    cut: 4000, eq: { f: 900, q: 1.0, gain: 4 },
    desc: 'Saw and triangle with a body resonance at 900 Hz and a pick transient.',
    layers: [
      { osc: 'saw', gain: 0.6 },
      { osc: 'tri', gain: 0.3 },
      { osc: 'sine', semi: 12, gain: 0.12 },
      { osc: 'noise', bed: 'white', gain: 0.055, hold: 0.009 },
    ],
  },
  epiano: {
    era: '16bit', trim: 0.304, env: { a: 0.002, d: 0.80, s: 0.20, r: 0.35 }, cut: 6500,
    desc: 'Two-operator FM at 1:1 with a fast-decaying modulator. The DX electric piano.',
    fm: {
      algo: 'bass',
      ops: [op(1, 1, 0.002, 0.70, 0.25, 0.30), op(1, 0.45, 0.002, 0.18, 0.06, 0.10, 0.10),
        op(1, 0, 0, 0, 0, 0), op(1, 0, 0, 0, 0, 0)],
    },
    layers: [{ osc: 'fm', gain: 1 }, { osc: 'sine', semi: 12, gain: 0.10 }],
  },

  // --- 16-bit: tuned percussion --------------------------------------------

  marimba: {
    era: '16bit', trim: 0.879, env: { a: 0.002, d: 0.28, s: 0.0, r: 0.12 }, cut: 5000,
    desc: 'Sine with a fast decay, an octave-and-a-fifth overtone, and a wood transient.',
    layers: [
      { osc: 'sine', gain: 0.9 },
      { osc: 'sine', semi: 19, gain: 0.18 },
      { osc: 'noise', bed: 'white', gain: 0.05, hold: 0.010 },
    ],
  },
  vibes: {
    era: '16bit', trim: 0.36, env: { a: 0.004, d: 1.10, s: 0.08, r: 0.60 }, cut: 6000,
    desc: 'Sine with a one-second decay and two octave partials. No transient.',
    layers: [
      { osc: 'sine', gain: 0.85 },
      { osc: 'sine', semi: 12, gain: 0.22 },
      { osc: 'sine', semi: 24, gain: 0.06 },
    ],
  },
  glock: {
    era: '16bit', trim: 0.706, env: { a: 0.001, d: 0.50, s: 0.03, r: 0.30 }, cut: 11000,
    desc: 'Struck metal an octave up, with partials at +24 and +31 semitones.',
    layers: [
      { osc: 'sine', semi: 12, gain: 0.7 },
      { osc: 'sine', semi: 24, gain: 0.25 },
      { osc: 'sine', semi: 31, gain: 0.10 },
      { osc: 'noise', bed: 'white', gain: 0.04, hold: 0.006 },
    ],
  },
  timpani: {
    era: '16bit', trim: 0.397, env: { a: 0.002, d: 0.90, s: 0.0, r: 0.40 }, cut: 900,
    desc: 'A pitched drum: low sine, a fifth above it, and a 20 ms head transient.',
    layers: [
      { osc: 'sine', gain: 0.9 },
      { osc: 'sine', semi: 7, gain: 0.20 },
      { osc: 'noise', bed: 'white', gain: 0.10, hold: 0.020 },
    ],
  },

  // --- 16-bit: a second bass ------------------------------------------------

  slap: {
    era: '16bit', trim: 1.457, env: { a: 0.002, d: 0.22, s: 0.25, r: 0.12 },
    cut: 3600, eq: { f: 1800, q: 1.6, gain: 7 },
    desc: 'Percussive bass: saw and narrow pulse with a resonant peak and a pick transient.',
    layers: [
      { osc: 'saw', gain: 0.55 },
      { osc: 'pulse', duty: 0.3, gain: 0.30 },
      { osc: 'sine', semi: -12, gain: 0.25 },
      { osc: 'noise', bed: 'white', gain: 0.07, hold: 0.012 },
    ],
  },

  // --- 16-bit: keys ---------------------------------------------------------

  wurli: {
    era: '16bit', trim: 0.402, env: { a: 0.002, d: 0.55, s: 0.18, r: 0.25 },
    cut: 5000, eq: { f: 1900, q: 1.3, gain: 6 },
    desc: 'Reedy electric piano. More modulation than epiano, so it barks rather than bells.',
    fm: {
      algo: 'bass',
      ops: [op(1, 1, 0.002, 0.45, 0.20, 0.22), op(1, 0.85, 0.002, 0.10, 0.05, 0.08, 0.28),
        op(1, 0, 0, 0, 0, 0), op(1, 0, 0, 0, 0, 0)],
    },
    layers: [{ osc: 'fm', gain: 1 }],
  },
  clav: {
    era: '16bit', trim: 1.138, env: { a: 0.001, d: 0.22, s: 0.06, r: 0.10 },
    cut: 4800, eq: { f: 2400, q: 2.0, gain: 8 },
    desc: 'Clavinet: a narrow pulse, a resonant peak at 2.4 kHz, and a very fast decay.',
    layers: [
      { osc: 'pulse', duty: 0.22, gain: 0.7 },
      { osc: 'saw', gain: 0.25 },
      { osc: 'noise', bed: 'white', gain: 0.06, hold: 0.007 },
    ],
  },
  harpsichord: {
    era: '16bit', trim: 1.108, env: { a: 0.001, d: 0.40, s: 0.0, r: 0.16 }, cut: 7000,
    desc: 'Plucked and bright, with two courses 8 cents apart. No dynamics -- a plucked key.',
    layers: [
      { osc: 'saw', detune: -8, gain: 0.45 },
      { osc: 'saw', detune: 8, gain: 0.45 },
      { osc: 'pulse', duty: 0.15, semi: 12, gain: 0.16 },
      { osc: 'noise', bed: 'white', gain: 0.055, hold: 0.006 },
    ],
  },
  accordion: {
    era: '16bit', trim: 0.23, env: { a: 0.045, d: 0.10, s: 0.92, r: 0.10 },
    cut: 4200, eq: { f: 1100, q: 1.2, gain: 5 },
    desc: 'Free reeds: two pulses 12 cents apart plus an octave. Beats like a real bellows.',
    layers: [
      { osc: 'pulse', duty: 0.3, detune: -12, gain: 0.45 },
      { osc: 'pulse', duty: 0.3, detune: 12, gain: 0.45 },
      { osc: 'pulse', duty: 0.2, semi: 12, gain: 0.18 },
      { osc: 'sine', semi: -12, gain: 0.10 },
    ],
  },

  // --- 16-bit: guitars ------------------------------------------------------

  'guitar-nylon': {
    era: '16bit', trim: 0.565, env: { a: 0.004, d: 0.70, s: 0.10, r: 0.30 },
    cut: 2600, eq: { f: 500, q: 0.9, gain: 5 },
    desc: 'Classical guitar: triangle-led, body resonance at 500 Hz, soft finger transient.',
    layers: [
      { osc: 'tri', gain: 0.7 },
      { osc: 'saw', gain: 0.22 },
      { osc: 'sine', semi: 12, gain: 0.12 },
      { osc: 'noise', bed: 'white', gain: 0.030, hold: 0.012 },
    ],
  },
  'guitar-clean': {
    era: '16bit', trim: 1.028, env: { a: 0.002, d: 0.95, s: 0.28, r: 0.35 },
    cut: 5200, eq: { f: 2100, q: 1.4, gain: 5 },
    desc: 'Clean electric: brighter than the acoustic, longer sustain, and no body -- a pickup has none.',
    layers: [
      { osc: 'saw', gain: 0.55 },
      { osc: 'pulse', duty: 0.35, gain: 0.28 },
      { osc: 'sine', semi: 12, gain: 0.10 },
      { osc: 'noise', bed: 'white', gain: 0.05, hold: 0.007 },
    ],
  },
  'guitar-dist': {
    era: '16bit', trim: 0.085, env: { a: 0.002, d: 1.30, s: 0.72, r: 0.30 },
    cut: 3400, eq: { f: 2000, q: 1.6, gain: 7 },
    desc: 'Driven electric. Two detuned saws clipped together: the grind is their intermodulation, '
      + 'and the long sustain is the compression a shaper gives for free.',
    layers: [
      { osc: 'saw', detune: -9, gain: 0.5, drive: 14 },
      { osc: 'saw', detune: 9, gain: 0.5, drive: 14 },
      { osc: 'pulse', duty: 0.42, semi: 12, gain: 0.16, drive: 9 },
      { osc: 'sine', semi: -12, gain: 0.12 },
    ],
  },
  'bass-pick': {
    era: '16bit', trim: 0.314, env: { a: 0.002, d: 0.45, s: 0.35, r: 0.18 },
    cut: 2800, eq: { f: 1200, q: 1.3, gain: 5 },
    desc: 'Picked electric bass: saw and pulse over a sine sub, with a hard pick transient.',
    layers: [
      { osc: 'saw', gain: 0.5, drive: 4 },
      { osc: 'pulse', duty: 0.28, gain: 0.22 },
      { osc: 'sine', semi: -12, gain: 0.28 },
      { osc: 'noise', bed: 'white', gain: 0.075, hold: 0.010 },
    ],
  },
  banjo: {
    era: '16bit', trim: 1.268, env: { a: 0.001, d: 0.30, s: 0.0, r: 0.12 },
    cut: 7500, eq: { f: 3000, q: 1.8, gain: 7 },
    desc: 'Very bright and very short: a narrow pulse, a peak at 3 kHz, and almost no sustain.',
    layers: [
      { osc: 'pulse', duty: 0.14, gain: 0.6 },
      { osc: 'saw', gain: 0.3 },
      { osc: 'sine', semi: 19, gain: 0.12 },
      { osc: 'noise', bed: 'white', gain: 0.07, hold: 0.006 },
    ],
  },

  'kit16': { era: '16bit', trim: 0.285, drums: '16bit', desc: 'Layered kit: body, snap and air.' },
};

/** The instrument an era falls back to when a score names one from the other. */
export const SUBSTITUTE = {
  '8bit': {
    'fm-lead': 'lead', 'fm-bass': 'bass', 'fm-bell': 'pulse12', strings: 'pulse50',
    pad: 'tri', piano: 'pulse25', organ: 'pulse50', pluck: 'pulse12', kit16: 'kit',
    brass: 'pulse25', horn: 'pulse50', flute: 'pulse12', clarinet: 'pulse50',
    oboe: 'pulse12', choir: 'pulse50', harp: 'pulse12', guitar: 'pulse25',
    epiano: 'pulse25', marimba: 'tri', vibes: 'tri', glock: 'pulse12',
    timpani: 'bass', slap: 'bass',
    wurli: 'pulse25', clav: 'pulse12', harpsichord: 'pulse12', accordion: 'pulse50',
    'guitar-nylon': 'tri', 'guitar-clean': 'pulse25', 'guitar-dist': 'pulse25',
    'bass-pick': 'bass', banjo: 'pulse12',
  },
  '16bit': {
    pulse12: 'fm-lead', pulse25: 'fm-lead', pulse50: 'organ', lead: 'fm-lead',
    'lead-echo': 'fm-lead', tri: 'fm-bass', bass: 'fm-bass', arp: 'pluck', kit: 'kit16',
    'noise-lead': 'glock', dpcm: 'epiano',
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
