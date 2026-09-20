// Editing a score.
//
// The parser gives a grid: one cell per step, a note at its start and nulls
// where it is held. That is the right shape to RENDER and the wrong shape to
// EDIT -- dragging a note means rewriting a run of cells and hoping the run
// ends where you think it does. So an editable track holds a list of notes
// with a step and a length, and the grid is regenerated from it on the way
// out. Every operation here is a plain function on that list.
//
// Flat tracks only. A score with @section and @order plays a short written
// piece over a long arrangement, which is worth having and impossible to edit
// as a single timeline -- editing bar 40 of an order that visits section A
// four times would mean editing A, and changing all four. Opening a sectioned
// track flattens it, and the caller is expected to say so.

import { expand, noteName } from './score.js';

/** A parsed track into something you can move notes around in. */
export function toModel(t) {
  const flat = t.voices ? t : expand(t);
  const beats = flat.beats;
  const voices = flat.voices.map((v) => {
    const notes = [];
    v.bars.forEach((bar, b) => {
      bar.forEach((cell, i) => {
        if (!cell) return;
        const step = b * beats + i;
        if (cell.hit) notes.push({ step, hit: cell.hit, len: 1 });
        else if (cell.chord) notes.push({ step, chord: cell.name, len: cell.steps });
        else notes.push({ step, midi: cell.note, len: cell.steps, vib: cell.vib, sweep: cell.sweep, accent: cell.accent });
      });
    });
    return {
      id: v.id, inst: v.inst, mix: v.mix, pan: v.pan, oct: v.oct,
      lp: v.lp, hp: v.hp, tilt: v.tilt, kind: v.kind, notes,
    };
  });
  return {
    id: flat.id, name: flat.name, bpm: flat.bpm, beats, era: flat.era,
    swing: flat.swing, tags: flat.tags, bars: flat.totalBars, voices,
    wasSectioned: !!t.sections && Object.keys(t.sections).length > 0,
  };
}

const sortNotes = (v) => v.notes.sort((a, b) => a.step - b.step || (a.midi ?? 0) - (b.midi ?? 0));
const overlaps = (n, step, len) => n.step < step + len && step < n.step + n.len;

/** Put a note down, clearing whatever it lands on top of. */
export function setNote(m, voiceId, step, value, len = 1) {
  const v = m.voices.find((x) => x.id === voiceId);
  if (!v || step < 0) return m;
  v.notes = v.notes.filter((n) => !overlaps(n, step, len));
  const note = { step, len: Math.max(1, len) };
  if (v.kind === 'drum') note.hit = value;
  else if (v.kind === 'chord') note.chord = CHORDS[value] ? value : value;
  else note.midi = value;
  v.notes.push(note);
  sortNotes(v);
  m.bars = Math.max(m.bars, Math.ceil((step + note.len) / m.beats));
  return m;
}

/** Remove whatever note covers this step. */
export function delNote(m, voiceId, step) {
  const v = m.voices.find((x) => x.id === voiceId);
  if (!v) return m;
  v.notes = v.notes.filter((n) => !(n.step <= step && step < n.step + n.len));
  return m;
}

/** Clear a span of steps in one voice, or in all of them. */
export function clearRange(m, voiceId, from, to) {
  const list = voiceId ? m.voices.filter((v) => v.id === voiceId) : m.voices;
  for (const v of list) v.notes = v.notes.filter((n) => !overlaps(n, from, to - from));
  return m;
}

/** Slide a span of notes earlier or later. Notes pushed before zero are kept at zero. */
export function shiftRange(m, voiceId, from, to, delta) {
  const list = voiceId ? m.voices.filter((v) => v.id === voiceId) : m.voices;
  for (const v of list) {
    for (const n of v.notes) {
      if (n.step >= from && n.step < to) n.step = Math.max(0, n.step + delta);
    }
    sortNotes(v);
  }
  m.bars = Math.max(1, ...m.voices.flatMap((v) => v.notes.map((n) => Math.ceil((n.step + n.len) / m.beats))));
  return m;
}

/** Change how long a note sounds. */
export function setLen(m, voiceId, step, len) {
  const v = m.voices.find((x) => x.id === voiceId);
  const n = v?.notes.find((x) => x.step === step);
  if (!n) return m;
  n.len = Math.max(1, len);
  v.notes = v.notes.filter((x) => x === n || !overlaps(x, n.step, n.len));
  m.bars = Math.max(m.bars, Math.ceil((n.step + n.len) / m.beats));
  return m;
}

/** Open up empty bars, pushing everything after them later. */
export function insertBars(m, at, count = 1) {
  const delta = count * m.beats;
  const cut = at * m.beats;
  for (const v of m.voices) {
    for (const n of v.notes) if (n.step >= cut) n.step += delta;
    sortNotes(v);
  }
  m.bars += count;
  return m;
}

/** Take bars out, pulling everything after them earlier. */
export function deleteBars(m, at, count = 1) {
  const from = at * m.beats;
  const to = (at + count) * m.beats;
  for (const v of m.voices) {
    v.notes = v.notes.filter((n) => !(n.step >= from && n.step < to));
    for (const n of v.notes) if (n.step >= to) n.step -= (to - from);
    sortNotes(v);
  }
  m.bars = Math.max(1, m.bars - count);
  return m;
}

export function addVoice(m, { id, inst = 'lead', mix = 0.2, kind = 'note' } = {}) {
  let name = id || `v${m.voices.length + 1}`;
  let n = 1;
  while (m.voices.some((v) => v.id === name)) { n += 1; name = `${id || 'v'}${n}`; }
  m.voices.push({ id: name, inst, mix, pan: 0, oct: 0, kind, notes: [] });
  return m;
}

export const delVoice = (m, voiceId) => {
  m.voices = m.voices.filter((v) => v.id !== voiceId);
  return m;
};

/** Write the model back out as a .snd file. */
export function toText(m, { note = null } = {}) {
  const width = 4;
  const cellFor = (v, step) => {
    const n = v.notes.find((x) => x.step === step);
    if (n) {
      if (n.hit) return n.hit;
      if (n.chord) return n.chord;
      let tok = noteName(n.midi);
      if (n.sweep > 0) tok += '/'; else if (n.sweep < 0) tok += '\\';
      if (n.vib) tok += '~';
      if (n.accent) tok += '!';
      return tok;
    }
    const held = v.notes.find((x) => x.step < step && step < x.step + x.len);
    return held ? '.' : '-';
  };
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

  const body = m.voices.map((v) => {
    const opts = [`inst=${v.inst}`, `mix=${v.mix}`];
    if (v.pan) opts.push(`pan=${v.pan}`);
    if (v.oct) opts.push(`oct=${v.oct}`);
    if (v.lp) opts.push(`lp=${v.lp}`);
    if (v.hp) opts.push(`hp=${v.hp}`);
    if (v.tilt) opts.push(`tilt=${v.tilt}`);
    const rows = [];
    for (let b = 0; b < m.bars; b++) {
      const row = [];
      for (let i = 0; i < m.beats; i++) row.push(cellFor(v, b * m.beats + i).padEnd(width));
      rows.push(`  ${row.join(' ').trimEnd()}`);
    }
    return `@voice ${v.id} ${opts.join(' ')}\n${rows.join('\n')}`;
  }).join('\n\n');

  return `${head}${body}\n`;
}
