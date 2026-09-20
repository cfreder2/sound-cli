// Turn a performance into a score.
//
// A recording is a list of (note, start, end) in seconds. A score is a grid of
// steps. Getting from one to the other is two decisions, and both are the sort
// of thing a person notices immediately if you get them wrong:
//
//   quantising   a played note lands near a step, not on it. Rounding to the
//                nearest is right; rounding DOWN drags everything late, which
//                is what makes a quantised take feel behind the beat.
//   polyphony    a voice in a score holds one note per step, so a chord needs
//                as many voices as it has notes. Splitting by which voice is
//                free -- rather than by pitch -- keeps a held note in one lane
//                instead of moving it every time a chord changes shape.
//
// Lives in core/ so it can be tested without a browser, and so the CLI could
// import a MIDI file through the same path later.

import { noteName } from './score.js';

/**
 * @param events [{ note, start, end }] in seconds, start relative to bar one
 * @returns { voices, bars, steps } on a grid of `beats` steps per bar
 */
export function quantise(events, { bpm = 104, beats = 16, grid = 4, maxVoices = 4 } = {}) {
  const stepTime = 60 / bpm / 4;
  // `grid` is in sixteenths: 1 = every sixteenth, 4 = every quarter.
  const snap = Math.max(1, Math.round(grid));
  const toStep = (t) => Math.round(t / stepTime / snap) * snap;

  const notes = events
    .filter((e) => e.end > e.start)
    .map((e) => {
      const s = Math.max(0, toStep(e.start));
      const len = Math.max(snap, toStep(e.end) - s || snap);
      return { note: e.note, start: s, len };
    })
    .sort((a, b) => a.start - b.start || a.note - b.note);

  // Assign each note to the lowest-numbered voice that is free at its start.
  const lanes = [];
  for (const n of notes) {
    let lane = lanes.findIndex((l) => l.free <= n.start);
    if (lane < 0) {
      if (lanes.length >= maxVoices) {
        // Out of lanes: drop it rather than overwrite something audible, and
        // say so, because silently losing notes is the worst failure here.
        lanes.dropped = (lanes.dropped || 0) + 1;
        continue;
      }
      lanes.push({ notes: [], free: 0 });
      lane = lanes.length - 1;
    }
    lanes[lane].notes.push(n);
    lanes[lane].free = n.start + n.len;
  }

  const lastStep = Math.max(0, ...notes.map((n) => n.start + n.len));
  const bars = Math.max(1, Math.ceil(lastStep / beats));
  const steps = bars * beats;

  const voices = lanes.map((l) => {
    const cells = new Array(steps).fill('-');
    for (const n of l.notes) {
      if (n.start >= steps) continue;
      cells[n.start] = noteName(n.note);
      for (let k = 1; k < n.len && n.start + k < steps; k++) cells[n.start + k] = '.';
    }
    return cells;
  });

  return { voices, bars, steps, beats, bpm, dropped: lanes.dropped || 0 };
}

/** Render a quantised performance as a .snd file. */
export function toScore(q, {
  id = 'take', name = null, era = '8bit', inst = 'lead', mix = 0.2, note = null,
} = {}) {
  const width = Math.max(3, ...q.voices.flat().map((c) => c.length));
  const rows = (cells) => {
    const out = [];
    for (let b = 0; b < q.bars; b++) {
      const bar = cells.slice(b * q.beats, (b + 1) * q.beats);
      out.push(`  ${bar.map((c) => c.padEnd(width)).join(' ').trimEnd()}`);
    }
    return out.join('\n');
  };
  const head = [
    note ? `# ${note}` : null,
    '',
    `@track ${id}`,
    `  name   ${name || id.toUpperCase()}`,
    `  bpm    ${q.bpm}`,
    `  beats  ${q.beats}`,
    `  era    ${era}`,
    '  tags   recorded',
    '',
  ].filter((l) => l !== null).join('\n');

  const body = q.voices.map((cells, i) => `@voice v${i + 1} inst=${inst} mix=${mix}\n${rows(cells)}`)
    .join('\n\n');
  return `${head}${body}\n`;
}
