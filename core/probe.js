// A short phrase per instrument, for auditioning one on its own.
//
// One generic run does not show an instrument. A four-note arpeggio tells you
// nothing about a flute's attack or a marimba's decay, and a held whole note
// tells you nothing about a pluck. So the phrase follows the instrument's
// role: sustained voices get a legato line with long notes, struck voices get
// a run that lets each note decay, basses get a bass part, kits get a beat.
//
// Lives in core/ so the CLI's `sound hear` and the previewer's Instruments tab
// play exactly the same thing.

/** What kind of part an instrument is for. Drives the probe phrase. */
export const ROLE = {
  pulse12: 'lead', pulse25: 'lead', pulse50: 'lead', lead: 'lead',
  'lead-echo': 'lead', 'fm-lead': 'lead', 'noise-lead': 'lead', dpcm: 'lead',

  tri: 'bass', bass: 'bass', 'fm-bass': 'bass', slap: 'bass', timpani: 'bass',

  arp: 'chord',

  pluck: 'pluck', harp: 'pluck', guitar: 'pluck', marimba: 'pluck',
  glock: 'pluck', vibes: 'pluck', epiano: 'pluck', piano: 'pluck',
  'fm-bell': 'pluck', wurli: 'pluck', clav: 'pluck', harpsichord: 'pluck',
  banjo: 'pluck', 'guitar-nylon': 'pluck', 'guitar-clean': 'pluck',
  'guitar-dist': 'pluck',

  'bass-pick': 'bass',

  strings: 'sustain', pad: 'sustain', choir: 'sustain', organ: 'sustain',
  brass: 'sustain', horn: 'sustain', flute: 'sustain', clarinet: 'sustain',
  oboe: 'sustain', accordion: 'sustain',

  kit: 'kit', kit16: 'kit',
};

const PHRASE = {
  // A hook. Movement on eighths, a held note to land on.
  lead: [
    'a4  .   c5  .   e5  .   d5  .   c5  .   a4  .   b4  .   .   . ',
    'c5  .   e5  .   a5  .   g5  .   e5  .   c5  .   a4~ .   .   . ',
  ],
  // Long notes, so attack and sustain are audible. Bar two holds four beats.
  sustain: [
    'a4  .   .   .   .   .   c5  .   .   .   e5  .   .   .   .   . ',
    'd5  .   .   .   .   .   .   .   c5~ .   .   .   .   .   .   . ',
  ],
  // A run up and back, one note per sixteenth, so each decay is exposed.
  pluck: [
    'a3  c4  e4  a4  c5  e5  a5  e5  c5  a4  e4  c4  a3  .   .   . ',
    'f3  a3  c4  f4  a4  c5  f5  c5  a4  f4  c4  a3  f3  .   .   . ',
  ],
  // Root and octave on eighths, which is what a bass part actually does.
  bass: [
    'a2  .   a3  .   a2  .   a3  .   e2  .   e3  .   e2  .   .   . ',
    'f2  .   f3  .   f2  .   f3  .   g2  .   g3  .   g2  .   .   . ',
  ],
  // Four chords, one per half bar.
  chord: [
    'am  .   .   .   .   .   .   .   f   .   .   .   .   .   .   . ',
    'c   .   .   .   .   .   .   .   e7  .   .   .   .   .   .   . ',
  ],
  kit: [
    'k   .   h   .   s   .   h   .   k   .   h   .   s   .   h   . ',
    'k   .   h   .   s   .   h   .   k   .   h   .   s   s   x   x ',
  ],
};

const BPM = { lead: 104, sustain: 84, pluck: 104, bass: 104, chord: 76, kit: 104 };

/** A complete score for auditioning one instrument. */
export function probeScore(name, inst) {
  const role = ROLE[name] || (inst?.drums ? 'kit' : 'lead');
  const bars = PHRASE[role];
  return `@track probe-${name}\n`
    + `  name   ${name.toUpperCase()}\n`
    + `  bpm    ${BPM[role]}\n`
    + '  beats  16\n'
    + `  era    ${inst?.era || '8bit'}\n\n`
    + `@voice v inst=${name} mix=0.22\n`
    + bars.map((b) => `  ${b}`).join('\n') + '\n';
}
