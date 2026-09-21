import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseScore, expand, loadScore, midi, noteName } from '../core/score.js';
import { renderTrack } from '../core/render.js';
import { parseFx, renderFx } from '../core/fx.js';
import { encodeWav } from '../core/wav.js';
import { quantize, quantizeError, lfsr, Biquad, panGains } from '../core/dsp.js';
import { instrumentFor, INSTRUMENTS } from '../core/instruments.js';
import { quantise, toScore } from '../core/record.js';
import * as E from '../core/edit.js';
import { fold, toSectionedText, verify } from '../core/fold.js';
import { Voice } from '../core/voice.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tracks = readdirSync(join(ROOT, 'tracks')).filter((f) => f.endsWith('.snd'));
const fx = readdirSync(join(ROOT, 'fx')).filter((f) => f.endsWith('.fx'));

test('note names round-trip', () => {
  for (const n of ['c-1', 'a4', 'c#5', 'eb3', 'b4', 'bb4', 'g#2']) {
    assert.equal(typeof midi(n), 'number', n);
  }
  assert.equal(midi('a4'), 69);
  assert.equal(midi('c4'), 60);
  assert.equal(midi('bb4'), 70);       // B flat, not B natural
  assert.equal(midi('b4'), 71);
  assert.equal(midi('eb3'), 51);
  for (let n = 21; n < 108; n++) assert.equal(midi(noteName(n)), n);
  assert.equal(midi('h4'), null);
  assert.equal(midi('a'), null);
});

test('a bar of the wrong width is an error, not a silent truncation', () => {
  const src = '@track t\n  bpm 120\n  beats 8\n@voice v inst=pulse25\n  c4 d4 e4\n';
  const { errors } = parseScore(src, 't');
  assert.ok(errors.some((e) => /3 steps, expected 8/.test(e)), errors.join('|'));
});

test('a bad note is reported with its step, and does not throw', () => {
  const src = '@track t\n  bpm 120\n  beats 4\n@voice v inst=pulse25\n  c4 h9 e4 -\n';
  const { errors } = parseScore(src, 't');
  assert.ok(errors.some((e) => /step 2: bad note 'h9'/.test(e)), errors.join('|'));
});

test('a dot holds and a dash rests', () => {
  const t = loadScore('@track t\n bpm 120\n beats 8\n@voice v inst=pulse25\n  c4 . . . - - e4 .\n', 't');
  const row = t.voices[0].bars[0];
  assert.equal(row[0].note, 60);
  assert.equal(row[0].steps, 4, 'three dots extend the note to four steps');
  assert.equal(row[4], null);
  assert.equal(row[6].steps, 2);
});

test('sections expand through @order into absolute timelines', () => {
  const src = `@track t
  bpm 120
  beats 4
@section a
@voice v inst=pulse25
  c4 - - -
@section b
@voice v inst=pulse25
  g4 - - -
@order a b a
`;
  const t = loadScore(src, 't');
  assert.equal(t.totalBars, 3);
  assert.deepEqual(t.voices[0].bars.map((b) => b[0].note), [60, 67, 60]);
});

test('a section that omits a voice gets silence, not the previous section', () => {
  const src = `@track t
  bpm 120
  beats 4
@section a
@voice lead inst=pulse25
  c4 - - -
@voice pad inst=pulse50
  e4 - - -
@section b
@voice lead inst=pulse25
  g4 - - -
@order a b
`;
  const t = loadScore(src, 't');
  const pad = t.voices.find((v) => v.id === 'pad');
  assert.equal(pad.bars[0][0].note, 64);
  assert.equal(pad.bars[1][0], null, 'bar 2 must be silent, not a repeat of bar 1');
});

test('loop is counted in order slots, not bars', () => {
  const src = `@track t
  bpm 120
  beats 4
  loop 1
@section intro
@voice v inst=pulse25
  c4 - - -
  c4 - - -
  c4 - - -
@section main
@voice v inst=pulse25
  g4 - - -
@order intro main
`;
  assert.equal(loadScore(src, 't').loopBar, 3, 'slot 1 begins after the 3-bar intro');
});

test('a track key written after @order is still a track key', () => {
  const src = '@track t\n bpm 120\n beats 4\n@voice v inst=pulse25\n  c4 - - -\n@order main\n  loop 0\n';
  const { errors } = parseScore(src, 't');
  assert.deepEqual(errors, []);
});

test('drum voices are found from the instrument table', () => {
  for (const kit of ['kit', 'kit16']) {
    const t = loadScore(`@track t\n bpm 120\n beats 4\n@voice d inst=${kit}\n  k . h .\n`, 't');
    assert.equal(t.voices[0].kind, 'drum', kit);
    assert.equal(t.voices[0].bars[0][0].hit, 'k');
  }
});

test('every shipped track parses and expands', () => {
  for (const f of tracks) {
    const t = loadScore(readFileSync(join(ROOT, 'tracks', f), 'utf8'), f);
    assert.ok(t.totalBars > 0, f);
    assert.ok(t.seconds > 0, f);
    assert.deepEqual(t.missing, [], f);
    const lens = new Set(t.voices.map((v) => v.bars.length));
    assert.equal(lens.size, 1, `${f}: voices disagree on length (${[...lens]})`);
    for (const v of t.voices) assert.ok(INSTRUMENTS[v.inst], `${f}: unknown instrument ${v.inst}`);
  }
});

test('every shipped effect parses and names a layer type', () => {
  for (const f of fx) {
    const { fx: e, errors } = parseFx(readFileSync(join(ROOT, 'fx', f), 'utf8'), f);
    assert.deepEqual(errors, [], f);
    assert.ok(e.eras['8bit'] && e.eras['16bit'], `${f} must define both eras`);
    for (const era of ['8bit', '16bit']) {
      assert.ok(e.eras[era].length > 0, `${f}:${era} has no layers`);
    }
  }
});

test('both eras render, and are loudness matched to each other', () => {
  for (const f of tracks) {
    const t = loadScore(readFileSync(join(ROOT, 'tracks', f), 'utf8'), f);
    const a = renderTrack(t, { era: '8bit', bars: 4 });
    const b = renderTrack(t, { era: '16bit', bars: 4 });
    assert.equal(a.L.length, b.L.length, f);
    for (const r of [a, b]) {
      assert.ok(r.stats.peakDb > -40, `${f} ${r.era} is near-silent (${r.stats.peakDb.toFixed(1)} dBFS)`);
      assert.ok(r.stats.peakDb <= 0.01, `${f} ${r.era} clips (${r.stats.peakDb.toFixed(1)} dBFS)`);
      assert.ok(r.L.every(Number.isFinite), `${f} ${r.era} produced NaN`);
    }
    // The A/B is only honest if the two are within a hair of each other.
    assert.ok(Math.abs(a.stats.rmsDb - b.stats.rmsDb) < 1.5,
      `${f}: eras differ by ${Math.abs(a.stats.rmsDb - b.stats.rmsDb).toFixed(1)} dB RMS`);
  }
});

test('rendering is deterministic', () => {
  const t = loadScore(readFileSync(join(ROOT, 'tracks', 'runner.snd'), 'utf8'), 'runner');
  const a = renderTrack(t, { era: '8bit', bars: 4 });
  const b = renderTrack(t, { era: '8bit', bars: 4 });
  for (let i = 0; i < a.L.length; i += 997) assert.equal(a.L[i], b.L[i], `sample ${i} differs`);
});

test('effects render in both eras without NaN or clipping', () => {
  for (const f of fx) {
    const { fx: e } = parseFx(readFileSync(join(ROOT, 'fx', f), 'utf8'), f);
    for (const era of ['8bit', '16bit']) {
      const r = renderFx(e, era);
      assert.ok(r.L.every(Number.isFinite), `${f} ${era} NaN`);
      assert.ok(r.stats.peakDb > -30 && r.stats.peakDb <= 0.01, `${f} ${era} at ${r.stats.peakDb.toFixed(1)} dBFS`);
    }
  }
});

test('a looping render is exactly its bars long, with no dead air at the seam', () => {
  // The renderer leaves 1.2 s past the last note for it to ring out, which is
  // right for a file and is a second of silence every time round inside a
  // looping player. `loop` folds that ring-out over bar one and cuts to the
  // bars, so the buffer a game loops is music end to end.
  const track = loadScore(readFileSync(join(ROOT, 'tracks', 'overworld-1-axi.snd'), 'utf8'), 'overworld');
  const plain = renderTrack(track, {});
  const looped = renderTrack(track, { loop: true });
  const stepTime = 60 / track.bpm / 4;
  const bars = looped.L.length / looped.rate / stepTime / track.beats;
  assert.ok(Math.abs(bars - track.totalBars) < 0.001, `expected ${track.totalBars} bars, got ${bars.toFixed(3)}`);
  assert.ok(looped.L.length < plain.L.length, 'the tail is gone from the loop');

  const rms = (a, from, to) => {
    let s = 0;
    for (let i = from; i < to; i++) s += a[i] * a[i];
    return Math.sqrt(s / (to - from));
  };
  const last = (r) => rms(r.L, r.L.length - Math.round(0.2 * r.rate), r.L.length);
  // The plain render ends in silence; the looped one ends in music, within a
  // few dB of where it began, so the join does not read as a stop and a start.
  assert.ok(last(plain) < 1e-4, `plain render should end silent, got ${last(plain)}`);
  const head = rms(looped.L, 0, Math.round(0.2 * looped.rate));
  const ratioDb = Math.abs(20 * Math.log10(last(looped) / head));
  assert.ok(ratioDb < 12, `seam should be level within 12 dB, got ${ratioDb.toFixed(1)}`);
});

test('rise makes a noise layer swell instead of strike', () => {
  // Without `rise` a noise layer is at full amplitude on its first sample. The
  // test is that the peak MOVES: an effect that swells peaks well after it
  // starts, and that is the difference between a splash and a swish.
  const src = (rise) => `@fx t\n@era 16bit\n  noise at=0 dur=0.3 gain=0.2 ${rise} from=800 to=300 q=0.9 bed=white\n`;
  const peakAt = (text) => {
    const { fx: e } = parseFx(text, 't.fx');
    const { L, rate } = renderFx(e, '16bit', { normalize: false });
    let best = 0, at = 0;
    for (let i = 0; i < L.length; i++) if (Math.abs(L[i]) > best) { best = Math.abs(L[i]); at = i / rate; }
    return at;
  };
  assert.ok(peakAt(src('')) < 0.01, 'with no rise the loudest sample is at the very front');
  const swelled = peakAt(src('rise=0.08'));
  assert.ok(swelled > 0.04 && swelled < 0.12, `rise=0.08 should peak around 80 ms, got ${swelled.toFixed(3)}s`);
});

test('rise is inert at its defaults, sample for sample', () => {
  // A tone gets 3 ms and noise gets none, which is exactly what the renderer
  // did before the key existed. Writing the default out by hand must produce
  // the same samples as leaving it off: a new envelope key that quietly
  // restyled a hundred finished sounds would be a worse bug than the one it
  // was added to fix.
  const cases = [
    ['  tone at=0 dur=0.2 gain=0.2 wave=tri from=600 to=200\n', 'rise=0.003'],
    ['  noise at=0 dur=0.2 gain=0.2 from=900 to=300 q=1 bed=white\n', 'rise=0'],
  ];
  for (const [layer, dflt] of cases) {
    const render = (text) => {
      const { fx: e } = parseFx(`@fx t\n@era 16bit\n${text}`, 't.fx');
      return renderFx(e, '16bit', { normalize: false }).L;
    };
    const bare = render(layer);
    const spelled = render(layer.trimEnd() + ` ${dflt}\n`);
    assert.deepStrictEqual([...bare], [...spelled], `${dflt} must be what the default already was`);
  }
});

test('layer isolation actually removes layers', () => {
  const { fx: e } = parseFx(readFileSync(join(ROOT, 'fx', 'splash.fx'), 'utf8'), 'splash');
  const one = renderFx(e, '16bit', { maxLayers: 1 });
  const all = renderFx(e, '16bit', { maxLayers: 99 });
  const energy = (r) => r.L.reduce((s, v) => s + v * v, 0);
  assert.ok(energy(one) < energy(all), 'one layer must be quieter than all of them');
});

test('instrument substitution is total across eras', () => {
  for (const name of Object.keys(INSTRUMENTS)) {
    for (const era of ['8bit', '16bit']) {
      const got = instrumentFor(name, era);
      assert.ok(got.inst, `${name} -> ${era}`);
      assert.ok(INSTRUMENTS[got.name], `${name} -> ${era} named a missing instrument`);
    }
  }
});

test('2A03 pitch quantisation is coarse high and fine low', () => {
  assert.ok(Math.abs(quantizeError(110)) < 2, 'A2 should land almost exactly');
  assert.ok(Math.abs(quantizeError(2093)) > 5, 'C7 should be audibly off the grid');
  assert.equal(quantize(0), 0);
});

test('the noise channel is a shift register, not random', () => {
  const a = lfsr(0.05, { short: true, period: 64 });
  const b = lfsr(0.05, { short: true, period: 64 });
  assert.deepEqual([...a.slice(0, 200)], [...b.slice(0, 200)], 'must be reproducible');
  const long = lfsr(0.05, { short: false, period: 8 });
  assert.notDeepEqual([...a.slice(0, 200)], [...long.slice(0, 200)], 'short and long modes differ');
  assert.ok(a.every((v) => v === 1 || v === -1), 'output is one bit');
});

test('a biquad is stable on a step', () => {
  const f = new Biquad('lowpass', 800, 0.707);
  let y = 0;
  for (let i = 0; i < 5000; i++) y = f.run(1);
  assert.ok(Math.abs(y - 1) < 0.01, `settled at ${y}`);
});

test('pan is equal power', () => {
  for (const p of [-1, -0.3, 0, 0.5, 1]) {
    const [l, r] = panGains(p);
    assert.ok(Math.abs(l * l + r * r - 1) < 1e-6, `power at ${p}`);
  }
});

const ascii = (u8, a, b) => String.fromCharCode(...u8.subarray(a, b));
const view = (u8) => new DataView(u8.buffer, u8.byteOffset, u8.byteLength);

test('encodeWav returns a plain Uint8Array, not a Node Buffer', () => {
  // The whole point: the same renderer has to write a file from the CLI and
  // fill an AudioBuffer in a browser tab, so nothing here may be Node-only.
  const b = encodeWav(new Float32Array(4), new Float32Array(4), 44100, 16);
  assert.ok(b instanceof Uint8Array);
  assert.equal(typeof globalThis.Buffer === 'undefined' || !(b instanceof globalThis.Buffer), true,
    'must not depend on Buffer');
});

test('wav headers are right for every depth', () => {
  const L = new Float32Array(100).fill(0.5), R = new Float32Array(100).fill(-0.5);
  for (const [depth, fmt, bytes] of [[16, 1, 2], [24, 1, 3], [32, 3, 4]]) {
    const b = encodeWav(L, R, 44100, depth);
    const dv = view(b);
    assert.equal(ascii(b, 0, 4), 'RIFF');
    assert.equal(ascii(b, 8, 12), 'WAVE');
    assert.equal(dv.getUint16(20, true), fmt, `format tag at ${depth}`);
    assert.equal(dv.getUint16(34, true), depth);
    assert.equal(dv.getUint32(40, true), 100 * 2 * bytes, `data size at ${depth}`);
    assert.equal(b.length, 44 + 100 * 2 * bytes);
  }
});

test('samples are clamped, not wrapped', () => {
  const b = encodeWav(new Float32Array([4]), new Float32Array([-4]), 44100, 16);
  const dv = view(b);
  assert.equal(dv.getInt16(44, true), 32767);
  assert.equal(dv.getInt16(46, true), -32767);
});

test('24-bit samples are little-endian three-byte words', () => {
  const b = encodeWav(new Float32Array([0.5]), new Float32Array([-0.5]), 44100, 24);
  const val = b[44] | (b[45] << 8) | (b[46] << 16);
  assert.equal(val, Math.round(0.5 * 8388607));
});


// --- recording ---------------------------------------------------------------

const ST = 60 / 104 / 4;

test('quantising rounds to the nearest step, not down', () => {
  // Played 4 ms LATE and 4 ms EARLY. Both belong on the same step; rounding
  // down would drag the late one a whole step behind.
  const q = quantise([
    { note: 60, start: 0.004, end: ST * 2 },
    { note: 62, start: ST * 4 - 0.004, end: ST * 6 },
  ], { bpm: 104, beats: 16, grid: 1 });
  assert.equal(q.voices[0][0], 'c4');
  assert.equal(q.voices[0][4], 'd4');
});

test('a chord becomes one voice per note', () => {
  const q = quantise([
    { note: 60, start: 0, end: ST * 4 },
    { note: 64, start: 0.003, end: ST * 4 },
    { note: 67, start: 0.007, end: ST * 4 },
  ], { bpm: 104, beats: 16, grid: 1 });
  assert.equal(q.voices.length, 3);
  assert.deepEqual(q.voices.map((v) => v[0]), ['c4', 'e4', 'g4']);
});

test('a melody after a chord reuses the freed voice', () => {
  const q = quantise([
    { note: 60, start: 0, end: ST * 2 },
    { note: 64, start: 0, end: ST * 2 },
    { note: 72, start: ST * 4, end: ST * 6 },
  ], { bpm: 104, beats: 16, grid: 1 });
  assert.equal(q.voices.length, 2, 'three notes, never three at once');
  assert.equal(q.voices[0][4], 'c5', 'the later note goes back in lane one');
});

test('held notes become dots, not repeats', () => {
  const q = quantise([{ note: 60, start: 0, end: ST * 4 }], { bpm: 104, beats: 16, grid: 1 });
  assert.deepEqual(q.voices[0].slice(0, 5), ['c4', '.', '.', '.', '-']);
});

test('more than four at once is reported, not silently dropped', () => {
  const ev = [60, 62, 64, 65, 67, 69].map((note) => ({ note, start: 0, end: ST * 2 }));
  const q = quantise(ev, { bpm: 104, beats: 16, grid: 1, maxVoices: 4 });
  assert.equal(q.voices.length, 4);
  assert.equal(q.dropped, 2);
});

test('a recorded take parses back as a score', () => {
  const q = quantise([
    { note: 60, start: 0, end: ST * 4 },
    { note: 64, start: ST * 4, end: ST * 8 },
    { note: 67, start: ST * 8, end: ST * 16 },
  ], { bpm: 104, beats: 16, grid: 1 });
  const t = loadScore(toScore(q, { id: 'take', inst: 'lead', era: '8bit' }), 'take.snd');
  assert.equal(t.bpm, 104);
  assert.equal(t.totalBars, 1);
  assert.ok(t.voices.length >= 1);
  assert.equal(t.voices[0].bars[0][0].note, 60);
});

test('snapping to eighths halves the resolution', () => {
  const q = quantise([{ note: 60, start: ST * 1.4, end: ST * 3 }], { bpm: 104, beats: 16, grid: 2 });
  const at = q.voices[0].findIndex((c) => c !== '-');
  assert.equal(at % 2, 0, 'an eighth-note grid can only land on even sixteenths');
});

// --- the live gate -----------------------------------------------------------

test('a held Voice sustains, and release starts the tail', () => {
  const inst = INSTRUMENTS.strings;
  const v = new Voice(inst, 69, { gain: 0.3, dur: Infinity });
  const L = new Float32Array(44100), R = new Float32Array(44100);
  v.fill(L, R, null, 0, 44100);
  const energy = (a, b) => {
    let s = 0;
    for (let i = a; i < b; i++) s += L[i] * L[i];
    return s / (b - a);
  };
  assert.ok(energy(30000, 40000) > 1e-7, 'still sounding a second in');
  v.release();
  const L2 = new Float32Array(44100), R2 = new Float32Array(44100);
  v.fill(L2, R2, null, 0, 44100);
  let tail = 0;
  for (let i = 0; i < L2.length; i++) if (Math.abs(L2[i]) > 1e-4) tail = i;
  assert.ok(tail > 0 && tail < 44100 * 0.6, `release should fade out, ended at ${(tail / 44100).toFixed(2)}s`);
});

test('Voice reports when it is finished', () => {
  const v = new Voice(INSTRUMENTS.pulse25, 69, { gain: 0.3, dur: 0.05 });
  const L = new Float32Array(44100), R = new Float32Array(44100);
  const alive = v.fill(L, R, null, 0, 44100);
  assert.equal(alive, false);
  assert.equal(v.done, true);
});


// --- editing -----------------------------------------------------------------

const model = (src) => E.toModel(loadScore(src, 'x'));
const TWO = `@track x
  name X
  bpm 120
  beats 8
  era 8bit

@voice lead inst=lead mix=0.2
  c4  .   e4  -   g4  .   .   -
  a4  -   -   -   c5  .   .   -
`;

test('every shipped track survives model -> text -> model unchanged', () => {
  for (const f of tracks) {
    const t = loadScore(readFileSync(join(ROOT, 'tracks', f), 'utf8'), f);
    const a = E.toModel(t);
    const b = E.toModel(loadScore(E.toText(a), f));
    assert.deepEqual(b.voices.map((v) => v.notes), a.voices.map((v) => v.notes), f);
    assert.equal(b.bars, a.bars, f);
  }
});

test('a chord voice keeps its chord NAMES, not just its pitches', () => {
  // [57,60,64] could be written several ways; the file should say what the
  // author typed, which means the parser has to keep it.
  const m = model('@track x\n bpm 120\n beats 4\n era 8bit\n@voice a inst=arp mix=0.1\n  am  .   f   .\n');
  assert.deepEqual(m.voices[0].notes.map((n) => n.chord), ['am', 'f']);
  assert.match(E.toText(m), /am/);
  assert.match(E.toText(m), /\bf\b/);
});

test('deleting a note removes it wherever inside it you click', () => {
  const m = model(TWO);
  assert.equal(m.voices[0].notes.length, 5);
  E.delNote(m, 'lead', 5);          // the middle of g4, which runs 4..6
  assert.equal(m.voices[0].notes.length, 4);
  assert.ok(!m.voices[0].notes.some((n) => n.midi === 67));
});

test('placing a note clears whatever it lands on', () => {
  const m = model(TWO);
  E.setNote(m, 'lead', 0, 72, 4);   // covers c4 and e4
  const ns = m.voices[0].notes;
  assert.equal(ns[0].midi, 72);
  assert.ok(!ns.some((n) => n.midi === 60 || n.midi === 64));
});

test('changing a length trims what it now overlaps', () => {
  const m = model(TWO);
  E.setLen(m, 'lead', 0, 3);        // c4 grows over e4 at step 2
  assert.equal(m.voices[0].notes.find((n) => n.step === 0).len, 3);
  assert.ok(!m.voices[0].notes.some((n) => n.step === 2));
});

test('clearing a range leaves notes outside it alone', () => {
  const m = model(TWO);
  E.clearRange(m, 'lead', 2, 8);
  assert.deepEqual(m.voices[0].notes.map((n) => n.step), [0, 8, 12]);
});

test('shifting a range moves only that range', () => {
  const m = model(TWO);
  E.shiftRange(m, 'lead', 8, 16, 2);
  assert.deepEqual(m.voices[0].notes.map((n) => n.step), [0, 2, 4, 10, 14]);
});

test('shifting cannot push notes before the start', () => {
  const m = model(TWO);
  E.shiftRange(m, 'lead', 0, 16, -4);
  assert.ok(m.voices[0].notes.every((n) => n.step >= 0));
});

test('inserting bars in the middle pushes later notes later', () => {
  const m = model(TWO);
  E.insertBars(m, 1, 2);
  assert.equal(m.bars, 4);
  // bar one is untouched, bar two has moved two bars later
  assert.deepEqual(m.voices[0].notes.map((n) => n.step), [0, 2, 4, 24, 28]);
});

test('deleting a bar pulls later notes earlier and drops what was in it', () => {
  const m = model(TWO);
  E.deleteBars(m, 0, 1);
  assert.equal(m.bars, 1);
  assert.deepEqual(m.voices[0].notes.map((n) => n.step), [0, 4]);
  assert.equal(m.voices[0].notes[0].midi, 69);
});

test('adding a voice never collides with an existing name', () => {
  const m = model(TWO);
  E.addVoice(m, { id: 'lead' });
  assert.equal(m.voices.length, 2);
  assert.notEqual(m.voices[1].id, m.voices[0].id);
});

test('an edited model still parses, and still renders', () => {
  const m = model(TWO);
  E.insertBars(m, 1, 1);
  E.setNote(m, 'lead', 8, 71, 4);
  E.addVoice(m, { id: 'bass', inst: 'bass', mix: 0.17 });
  E.setNote(m, 'bass', 0, 45, 8);
  const t = loadScore(E.toText(m), 'edited.snd');
  assert.equal(t.totalBars, 3);
  assert.equal(t.voices.length, 2);
  const out = renderTrack(t, { era: '8bit', bars: 3 });
  assert.ok(out.stats.peakDb > -40 && out.stats.peakDb <= 0.01);
});


// --- folding -----------------------------------------------------------------

test('folding is exactly reversible for every shipped track', () => {
  for (const f of tracks) {
    const m = E.toModel(loadScore(readFileSync(join(ROOT, 'tracks', f), 'utf8'), f));
    const text = toSectionedText(m, fold(m));
    assert.equal(verify(m, text, loadScore), null, f);
  }
});

test('a folded track renders to the same samples as the flat one', () => {
  for (const f of ['runner.snd', 'greensleeves.snd', 'ode-to-joy.snd']) {
    const m = E.toModel(loadScore(readFileSync(join(ROOT, 'tracks', f), 'utf8'), f));
    const flat = loadScore(E.toText(m), f);
    const folded = loadScore(toSectionedText(m, fold(m)), f);
    const a = renderTrack(flat, { era: '8bit', bars: 8 });
    const b = renderTrack(folded, { era: '8bit', bars: 8 });
    let worst = 0;
    for (let i = 0; i < a.L.length; i++) worst = Math.max(worst, Math.abs(a.L[i] - b.L[i]));
    assert.equal(worst, 0, `${f} differs by ${worst}`);
  }
});

test('folding finds the repeats a person wrote by hand', () => {
  // RUNNER is three sections over eight order slots. Rediscovering that from
  // the played-out form is the whole job.
  const m = E.toModel(loadScore(readFileSync(join(ROOT, 'tracks', 'runner.snd'), 'utf8'), 'runner'));
  const f = fold(m);
  assert.equal(f.played, 32);
  assert.equal(f.written, 12, 'the hand-written original is also 12 bars');
  assert.equal(Object.keys(f.sections).length, 3);
  assert.equal(f.order.length, 8);
});

test('folding prefers a readable phrase over the smallest possible file', () => {
  // Chunking at one bar compresses hardest and produces an order of single
  // bars. The scoring charges each order slot, so phrases win unless single
  // bars save a lot.
  const m = E.toModel(loadScore(readFileSync(join(ROOT, 'tracks', 'runner.snd'), 'utf8'), 'runner'));
  assert.equal(fold(m).phrase, 4);
});

test('a flat song with no repeats folds to itself, losing nothing', () => {
  const src = '@track x\n bpm 120\n beats 4\n era 8bit\n@voice v inst=lead mix=0.2\n'
    + '  c4  -   -   - \n  d4  -   -   - \n  e4  -   -   - \n';
  const m = E.toModel(loadScore(src, 'x'));
  const f = fold(m);
  assert.equal(f.played, 3);
  assert.equal(verify(m, toSectionedText(m, f), loadScore), null);
});

test('a voice silent through a section is left out of it', () => {
  // A section that omits a voice gets silence for it, so not writing an empty
  // voice is smaller and exactly equivalent. Tested against a hand-made split
  // rather than through fold(), because fold picks the phrase length and on a
  // short song it picks one section for everything.
  const src = `@track x
  bpm 120
  beats 4
  era 8bit

@voice lead inst=lead mix=0.2
  c4  -   -   -
  d4  -   -   -
  -   -   -   -
  -   -   -   -
@voice bass inst=bass mix=0.17
  -   -   -   -
  -   -   -   -
  a2  -   -   -
  g2  -   -   -
`;
  const m = E.toModel(loadScore(src, 'x'));
  const split = { sections: { A: [0, 1], B: [2, 3] }, order: ['A', 'B'], written: 4, played: 4, phrase: 2 };
  const text = toSectionedText(m, split);
  const secA = text.slice(text.indexOf('@section A'), text.indexOf('@section B'));
  const secB = text.slice(text.indexOf('@section B'), text.indexOf('@order'));
  assert.ok(!secA.includes('bass'), 'bass is silent in bars 1-2 and should not be written there');
  assert.ok(!secB.includes('lead'), 'lead is silent in bars 3-4 and should not be written there');
  assert.equal(verify(m, text, loadScore), null, 'and it still round-trips');
});

test('the runtime ships the core verbatim, not a port of it', async () => {
  const { emitRuntime } = await import('../cli/runtime.js');
  const { mkdtempSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const dir = mkdtempSync(join(tmpdir(), 'sndrt-'));
  emitRuntime(ROOT, { dir, tracks: ['overworld-1-axi'], fx: ['jump', 'stomp'], quiet: true });

  // The whole argument for this package is that there is ONE synth. A runtime
  // that rewrote it against Web Audio would be the third, after AXI's and
  // VECTRENCH's, and the drift between those two is why this exists. So the
  // emitted core has to be the core, to the byte -- only a header on top.
  for (const m of ['dsp', 'instruments', 'voice', 'score', 'render', 'fx']) {
    const src = readFileSync(join(ROOT, 'core', `${m}.js`), 'utf8');
    const out = readFileSync(join(dir, `${m}.js`), 'utf8');
    assert.ok(out.endsWith(src), `${m}.js was changed on the way out`);
  }

  // And the data is the files, so a score stays something you can read.
  const data = readFileSync(join(dir, 'data.js'), 'utf8');
  assert.match(data, /@track overworld-1-axi/);
  assert.match(data, /@fx jump/);
  rmSync(dir, { recursive: true, force: true });
});

test('the emitted engine renders every effect it was given', async () => {
  const { emitRuntime } = await import('../cli/runtime.js');
  const { mkdtempSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const dir = mkdtempSync(join(tmpdir(), 'sndrt2-'));
  const names = ['jump', 'stomp', 'footstep', 'thud-heavy'];
  emitRuntime(ROOT, { dir, tracks: [], fx: names, quiet: true });

  const { Engine } = await import(`file://${join(dir, 'index.js')}`);
  // Enough of a context to prove the render path, and no more: what is being
  // tested is that PCM comes out, not that a browser can play it.
  const ctx = {
    currentTime: 0,
    createBuffer: (ch, len, rate) => ({ len, rate, data: [],
      copyToChannel(a, i) { this.data[i] = a; } }),
    createGain: () => ({ gain: { value: 1 }, connect() {} }),
    destination: {},
  };
  const e = new Engine(ctx, { era: '16bit' });
  const peaks = {};
  for (const n of names) {
    const b = e.buffer(n);
    assert.ok(b, `${n} did not render`);
    let m = 0;
    for (const v of b.data[0]) m = Math.max(m, Math.abs(v));
    assert.ok(m > 0.001 && Number.isFinite(m), `${n} rendered silence or NaN`);
    peaks[n] = m;
  }
  // Not normalised, on purpose: a game wants a footstep quieter than a boss
  // landing, and the .fx files already say so. The tool peak-matches for A/B;
  // the runtime must not, or the mix is handed back to the caller.
  assert.ok(peaks.footstep < peaks['thud-heavy'],
    `footstep ${peaks.footstep} should be quieter than thud-heavy ${peaks['thud-heavy']}`);
  rmSync(dir, { recursive: true, force: true });
});
