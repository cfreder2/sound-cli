// The score format, and the only thing that reads it.
//
// A score is a plain text file and that is a load-bearing decision, not a
// convenience. Music has to be reviewable in a pull request: one track is one
// file, one bar is one line, and a step is a column -- so a diff shows which
// bar moved and which note changed, and `git blame` answers who wrote the
// chorus. A JSON array of {pitch, start, duration} carries identical
// information and is unreadable in every one of those situations.
//
//   # comments run to end of line
//   @track  prelude-c
//     name   PRELUDE IN C
//     bpm    72
//     beats  16          steps per bar -- the matrix width
//     era    8bit
//
//   @voice arp inst=pulse25 mix=0.20
//     c3 e3 g3 c4 e4 g3 c4 e4  c3 e3 g3 c4 e4 g3 c4 e4
//     c3 d3 a3 d4 f4 a3 d4 f4  c3 d3 a3 d4 f4 a3 d4 f4
//
// Every line under a @voice is one bar. Tokens are whitespace-separated, and
// extra spaces are free -- group them into beats so the grid is visible.

import { INSTRUMENTS } from './instruments.js';

const LETTER = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

/** 'c#5', 'eb3', 'a4' -> MIDI number. Suffix flags are stripped by the caller. */
export function midi(tok) {
  const m = /^([a-g])([#b]?)(-?\d)$/.exec(tok);
  if (!m) return null;
  return LETTER[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (+m[3] + 1) * 12;
}

const NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
/** MIDI number -> 'c#5'. The inverse, used by `import` when it writes a score. */
export const noteName = (n) => NAMES[((n % 12) + 12) % 12] + (Math.floor(n / 12) - 1);

/** Drum voices use one letter per hit rather than a pitch. */
export const DRUM_HITS = {
  k: 'kick', s: 'snare', h: 'hat', x: 'open', m: 'metal', c: 'crash', t: 'tom',
};

export const CHORDS = {
  c: 'c3 e3 g3', cm: 'c3 eb3 g3', c7: 'c3 e3 bb3', cmaj7: 'c3 e3 b3',
  d: 'd3 f#3 a3', dm: 'd3 f3 a3', d7: 'd3 f#3 c4', dm7: 'd3 f3 c4',
  e: 'e3 g#3 b3', em: 'e3 g3 b3', e7: 'e3 g#3 d4', em7: 'e3 g3 d4',
  f: 'f3 a3 c4', fm: 'f3 ab3 c4', f7: 'f3 a3 eb4', fmaj7: 'f3 a3 e4',
  g: 'g3 b3 d4', gm: 'g3 bb3 d4', g7: 'g3 b3 f4',
  a: 'a3 c#4 e4', am: 'a3 c4 e4', a7: 'a3 c#4 g4', am7: 'a3 c4 g4',
  b: 'b2 d#3 f#3', bm: 'b2 d3 f#3', b7: 'b2 d#3 f#3 a3', bdim: 'b2 d3 f3',
  bb: 'bb2 d3 f3', eb: 'eb3 g3 bb3', ab: 'ab2 c3 eb3', db: 'db3 f3 ab3',
  'f#m': 'f#3 a3 c#4', 'c#m': 'c#3 e3 g#3', 'g#m': 'g#2 b2 d#3',
  'f#7': 'f#3 a#3 c#4 e4', 'c#7': 'c#3 f3 g#3 b3', 'd#dim': 'd#3 f#3 a3',
};

/**
 * One bar line into one cell per step.
 *
 * `.` holds the note before it and `-` rests, so a phrase's shape is legible
 * in the source: `e5 .  .  .  a5 .  .  . ` is two half notes, not eight
 * sixteenths with six missing. Holding is also what gives a note length enough
 * to put vibrato on.
 *
 * Suffixes on a note: `/` sweep up, `\` sweep down, `~` vibrato, `!` accent.
 */
function parseBar(line, beats, kind, where) {
  const toks = line.trim().split(/\s+/);
  const row = new Array(beats).fill(null);
  const errs = [];
  if (toks.length !== beats) {
    errs.push(`${where}: ${toks.length} steps, expected ${beats}`);
  }
  let last = null;
  for (let i = 0; i < beats; i++) {
    const raw = toks[i] ?? '-';
    if (raw === '.') { if (last) last.steps++; continue; }
    if (raw === '-') { last = null; continue; }

    if (kind === 'drum') {
      if (!DRUM_HITS[raw]) { errs.push(`${where} step ${i + 1}: unknown hit '${raw}'`); continue; }
      row[i] = { hit: raw, steps: 1 };
      last = null;
      continue;
    }
    if (kind === 'chord') {
      const spec = CHORDS[raw] || (/^[a-g]/.test(raw) && raw.includes(' ') ? raw : null);
      if (!spec) { errs.push(`${where} step ${i + 1}: unknown chord '${raw}'`); continue; }
      last = { chord: spec.split(/\s+/).map(midi), steps: 1 };
      row[i] = last;
      continue;
    }

    const flags = { sweep: 0, vib: false, accent: false };
    let tok = raw;
    while (tok.length > 1 && '/\\~!'.includes(tok.at(-1))) {
      const c = tok.at(-1);
      if (c === '/') flags.sweep = 1;
      else if (c === '\\') flags.sweep = -1;
      else if (c === '~') flags.vib = true;
      else if (c === '!') flags.accent = true;
      tok = tok.slice(0, -1);
    }
    const n = midi(tok);
    if (n === null) { errs.push(`${where} step ${i + 1}: bad note '${raw}'`); last = null; continue; }
    last = { note: n, steps: 1, ...flags };
    row[i] = last;
  }
  return { row, errs };
}

const num = (v, d) => (v === undefined || v === '' ? d : Number(v));

const TRACK_KEYS = new Set(['name', 'bpm', 'beats', 'era', 'swing', 'loop', 'tags']);

/**
 * Parse a whole score file.
 *
 * Returns `{ track, errors }` rather than throwing, because `sound check`
 * wants every problem in a file at once, not the first one.
 */
export function parseScore(text, filename = '<score>') {
  const track = {
    id: null, name: null, bpm: 120, beats: 16, era: '8bit', swing: 0,
    loop: 0, tags: [], notes: [],
    sections: {}, order: null, source: filename,
  };
  const errors = [];
  let section = null;            // current section name
  let voice = null;              // current voice object
  let inHeader = false;

  const lines = text.split(/\r?\n/);
  for (let ln = 0; ln < lines.length; ln++) {
    const at = `${filename}:${ln + 1}`;
    const raw = lines[ln].replace(/\s+#.*$/, '').replace(/^#.*$/, '');
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith('@')) {
      const [word, ...rest] = line.slice(1).split(/\s+/);
      const arg = rest.join(' ');

      if (word === 'track') {
        track.id = rest[0] || null; inHeader = true; voice = null;
      } else if (word === 'section') {
        section = rest[0] || 'main'; voice = null; inHeader = false;
        track.sections[section] ??= { voices: [] };
      } else if (word === 'order') {
        track.order = rest.filter(Boolean); inHeader = false; voice = null;
      } else if (word === 'voice') {
        inHeader = false;
        section ??= 'main';
        track.sections[section] ??= { voices: [] };
        const id = rest[0];
        if (!id) { errors.push(`${at}: @voice needs a name`); continue; }
        const opts = {};
        for (const kv of rest.slice(1)) {
          const i = kv.indexOf('=');
          if (i < 0) { errors.push(`${at}: '${kv}' is not key=value`); continue; }
          opts[kv.slice(0, i)] = kv.slice(i + 1);
        }
        voice = {
          id,
          inst: opts.inst || 'pulse25',
          mix: num(opts.mix, 0.15),
          pan: num(opts.pan, 0),
          oct: num(opts.oct, 0),
          echo: num(opts.echo, 0),
          cut: opts.cut ? Number(opts.cut) : 0,
          bars: [],
          line: ln + 1,
        };
        // What a voice IS comes from the instrument table, so adding a second
        // kit does not need a second place to say it is a kit.
        voice.kind = INSTRUMENTS[voice.inst]?.drums ? 'drum'
          : voice.inst === 'arp' ? 'chord' : 'note';
        track.sections[section].voices.push(voice);
      } else if (word === 'note') {
        track.notes.push(arg);
      } else {
        errors.push(`${at}: unknown directive @${word}`);
      }
      continue;
    }

    if (inHeader) {
      const [key, ...vals] = line.split(/\s+/);
      const v = vals.join(' ');
      if (key === 'name') track.name = v;
      else if (key === 'bpm') track.bpm = Number(v);
      else if (key === 'beats') track.beats = parseInt(v, 10);
      else if (key === 'era') track.era = v;
      else if (key === 'swing') track.swing = Number(v);
      else if (key === 'loop') track.loop = parseInt(v, 10) || 0;
      else if (key === 'tags') track.tags = vals;
      else errors.push(`${at}: unknown track key '${key}'`);
      continue;
    }

    // A track key that turns up after @order or a @voice is still a track
    // key. Recognising it by name is friendlier than a parse error, and there
    // is no note token that collides with one of these words.
    if (TRACK_KEYS.has(line.split(/\s+/)[0])) { inHeader = true; ln -= 1; continue; }
    if (!voice) { errors.push(`${at}: bar line before any @voice`); continue; }
    const { row, errs } = parseBar(
      line, track.beats, voice.kind,
      `${filename}:${ln + 1} ${voice.id} bar ${voice.bars.length + 1}`,
    );
    errors.push(...errs);
    voice.bars.push(row);
  }

  if (!track.id) errors.push(`${filename}: no @track`);
  if (!(track.bpm > 0)) errors.push(`${filename}: bpm must be positive`);
  if (!(track.beats > 0)) errors.push(`${filename}: beats must be positive`);
  if (!Object.keys(track.sections).length) errors.push(`${filename}: no voices`);
  track.name ??= track.id;
  return { track, errors };
}

/**
 * Sections and an order, flattened into one timeline per voice.
 *
 * A song written as one list of bars is a LOOP, and a loop short enough to
 * write by hand is short enough to wear out inside one playthrough. Twenty
 * written bars arranged over seventy is how the stage themes worth stealing
 * from were actually built. This expands `order` into absolute timelines so
 * the renderer never has to think about sections at all.
 *
 * A section that leaves a voice out gets silence for it, not the previous
 * section's part -- so dropping the counter-melody for eight bars is something
 * a score can simply do.
 */
export function expand(track) {
  const order = track.order?.length ? track.order : Object.keys(track.sections);
  const missing = order.filter((s) => !track.sections[s]);
  const lenOf = (s) => Math.max(0, ...(track.sections[s]?.voices || []).map((v) => v.bars.length));

  const ids = new Map();
  for (const s of order) {
    for (const v of track.sections[s]?.voices || []) if (!ids.has(v.id)) ids.set(v.id, v);
  }

  const voices = [];
  for (const [id, proto] of ids) {
    const bars = [];
    for (const s of order) {
      const n = lenOf(s);
      const v = (track.sections[s]?.voices || []).find((x) => x.id === id);
      for (let i = 0; i < n; i++) {
        bars.push(v ? v.bars[i % v.bars.length] : new Array(track.beats).fill(null));
      }
    }
    voices.push({ ...proto, bars });
  }

  // `loop` is counted in ORDER SLOTS, because "after the intro" is something
  // an author knows and "after bar four" is something they have to work out
  // again every time the intro changes length.
  let loopBar = 0;
  for (let i = 0; i < Math.min(track.loop, order.length); i++) loopBar += lenOf(order[i]);

  const totalBars = order.reduce((a, s) => a + lenOf(s), 0);
  const stepTime = 60 / track.bpm / 4;
  return {
    ...track, voices, order, loopBar, totalBars,
    steps: totalBars * track.beats,
    stepTime,
    seconds: totalBars * track.beats * stepTime,
    missing,
  };
}

/** Parse and expand in one call. Throws on a malformed score. */
export function loadScore(text, filename) {
  const { track, errors } = parseScore(text, filename);
  if (errors.length) {
    const e = new Error(`${errors.length} problem(s) in ${filename}:\n  ${errors.join('\n  ')}`);
    e.errors = errors;
    throw e;
  }
  const t = expand(track);
  if (t.missing.length) throw new Error(`${filename}: @order names unknown section(s): ${t.missing.join(', ')}`);
  return t;
}
