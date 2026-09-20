// Fold a flat timeline back into sections and an order.
//
// The editor unrolls a song to work on it -- SCRAMBLE's 34 written bars become
// the 74 it plays -- and this puts the structure back. It is the same trade
// the format was built around: write a section once, name it in an order, and
// one edit to the hook changes all seven times it is heard.
//
// Not a general compressor. Music repeats at musical lengths, so it looks for
// blocks of 8, 4, 2 and 1 bars in that order and takes the longest repeat it
// can at each position. A suffix-automaton approach would find more, and would
// find musically meaningless boundaries -- a four-bar phrase split as three
// plus one because the split happened to save a bar.
//
// Folding must be exactly reversible or it is data loss with extra steps, so
// `verify` expands the result and compares it to what went in. Nothing here is
// trusted without that.

import { toModel, toText } from './edit.js';
import { noteName } from './score.js';

const BLOCKS = [8, 4, 2, 1];

/** One bar of every voice, as a string. Two bars are the same iff these match. */
function barKeys(m) {
  const keys = [];
  for (let b = 0; b < m.bars; b++) {
    const parts = [];
    for (const v of m.voices) {
      const here = v.notes
        .filter((n) => n.step >= b * m.beats && n.step < (b + 1) * m.beats)
        .map((n) => `${n.step - b * m.beats}:${n.midi ?? n.hit ?? n.chord}:${n.len}`
          + `${n.vib ? 'v' : ''}${n.sweep ? `s${n.sweep}` : ''}${n.accent ? '!' : ''}`);
      // A note held INTO this bar from the one before makes the bar different
      // even when nothing starts in it, so it has to be part of the key.
      const carried = v.notes
        .filter((n) => n.step < b * m.beats && n.step + n.len > b * m.beats)
        .map((n) => `c${n.step - b * m.beats}:${n.midi ?? n.hit ?? n.chord}:${n.len}`);
      parts.push(`${v.id}[${carried.join(',')}|${here.join(',')}]`);
    }
    keys.push(parts.join('||'));
  }
  return keys;
}

const NAMES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Fold a flat timeline into sections and an order.
 *
 * Chunks the song at a FIXED phrase length and merges identical chunks, rather
 * than greedily taking the longest repeat at each position. Greedy was tried
 * first and does badly on exactly the music this is for: on RUNNER it grabbed
 * bars 4-11 as one eight-bar block (A followed by A), then 12-19 (B then A),
 * then 20-27 (A then B) -- three blocks that each contain the hook and none of
 * which match each other. Zero reuse on a song that is four bars repeated.
 *
 * Phrases are the unit music actually repeats in, so it tries 8, 4, 2 and 1
 * bars with every offset and keeps whichever writes the fewest bars.
 */
export function fold(m) {
  const keys = barKeys(m);
  const n = keys.length;

  const chunkAt = (L, offset) => {
    const spans = [];
    if (offset > 0) spans.push([0, offset]);
    for (let p = offset; p < n; p += L) spans.push([p, Math.min(n, p + L)]);
    return spans;
  };

  let best = null;
  for (const L of [8, 4, 2, 1]) {
    for (let offset = 0; offset < Math.min(L, n); offset++) {
      const spans = chunkAt(L, offset);
      const seen = new Set();
      let written = 0;
      for (const [from, to] of spans) {
        const key = keys.slice(from, to).join('\u0001');
        if (!seen.has(key)) { seen.add(key); written += to - from; }
      }
      // Written bars are not the only cost. Chunking at one bar compresses
      // hardest and produces a seventy-four slot order of single bars, which
      // is optimal and unreadable -- and unreadable is a real cost in a format
      // whose whole argument is that you can read it. Each order slot is
      // charged a third of a bar, which is enough to prefer four-bar phrases
      // unless single bars save a great deal.
      const score = written + spans.length * 0.35;
      if (!best || score < best.score || (score === best.score && L > best.L)) {
        best = { L, offset, spans, written, score };
      }
    }
  }

  const byBlock = new Map();
  const sections = {};
  const order = [];
  let named = 0;
  for (const [from, to] of best.spans) {
    const key = keys.slice(from, to).join('\u0001');
    let name = byBlock.get(key);
    if (!name) {
      name = NAMES[named] || `S${named + 1}`;
      named += 1;
      byBlock.set(key, name);
      sections[name] = Array.from({ length: to - from }, (_, i) => from + i);
    }
    order.push(name);
  }
  return { sections, order, written: best.written, played: n, phrase: best.L };
}

/** The folded song as a .snd file. */
export function toSectionedText(m, f, { note = null } = {}) {
  const head = [
    note ? `# ${note}\n` : null,
    `@track ${m.id}`,
    `  name   ${m.name}`,
    `  bpm    ${m.bpm}`,
    `  beats  ${m.beats}`,
    `  era    ${m.era}`,
    m.swing ? `  swing  ${m.swing}` : null,
    m.tags?.length ? `  tags   ${m.tags.join(' ')}` : null,
    '',
  ].filter((x) => x !== null).join('\n');

  const width = 4;
  const blocks = [];
  for (const [name, bars] of Object.entries(f.sections)) {
    const lines = [`@section ${name}`];
    for (const v of m.voices) {
      // A section that leaves a voice out gets silence for it, so a voice with
      // nothing in these bars is simply not written -- which is most of where
      // the saving comes from on a sparse arrangement.
      const sounds = v.notes.some((nt) => bars.some((b) => nt.step < (b + 1) * m.beats
        && nt.step + nt.len > b * m.beats));
      if (!sounds) continue;
      const opts = [`inst=${v.inst}`, `mix=${v.mix}`];
      if (v.pan) opts.push(`pan=${v.pan}`);
      if (v.oct) opts.push(`oct=${v.oct}`);
      if (v.lp) opts.push(`lp=${v.lp}`);
      if (v.hp) opts.push(`hp=${v.hp}`);
      if (v.tilt) opts.push(`tilt=${v.tilt}`);
      lines.push(`@voice ${v.id} ${opts.join(' ')}`);
      for (const b of bars) {
        const row = [];
        for (let i = 0; i < m.beats; i++) {
          const step = b * m.beats + i;
          const start = v.notes.find((nt) => nt.step === step);
          if (start) {
            if (start.hit) row.push(start.hit.padEnd(width));
            else if (start.chord) row.push(String(start.chord).padEnd(width));
            else {
              let tok = noteName(start.midi);
              if (start.sweep > 0) tok += '/'; else if (start.sweep < 0) tok += '\\';
              if (start.vib) tok += '~';
              if (start.accent) tok += '!';
              row.push(tok.padEnd(width));
            }
          } else {
            const held = v.notes.find((nt) => nt.step < step && step < nt.step + nt.len);
            row.push((held ? '.' : '-').padEnd(width));
          }
        }
        lines.push(`  ${row.join(' ').trimEnd()}`);
      }
    }
    blocks.push(lines.join('\n'));
  }
  return `${head}${blocks.join('\n\n')}\n\n@order ${f.order.join(' ')}\n`;
}

/**
 * Fold, write, read back, and compare. Returns null when it matches, or a
 * description of the first difference when it does not.
 */
export function verify(m, text, loadScore) {
  const back = toModel(loadScore(text, `${m.id}.snd`));
  if (back.bars !== m.bars) return `bar count ${m.bars} -> ${back.bars}`;
  if (back.voices.length !== m.voices.length) {
    return `voice count ${m.voices.length} -> ${back.voices.length}`;
  }
  for (const v of m.voices) {
    const w = back.voices.find((x) => x.id === v.id);
    if (!w) return `voice ${v.id} is missing`;
    const a = JSON.stringify(v.notes);
    const b = JSON.stringify(w.notes);
    if (a !== b) return `voice ${v.id}: ${v.notes.length} notes -> ${w.notes.length}`;
  }
  return null;
}

export { toText };
