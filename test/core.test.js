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
