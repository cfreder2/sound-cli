#!/usr/bin/env node
// The `sound` command surface. Flat verbs, because the pipeline is the mental
// model: write a score, check it, hear it, render it.

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';

import { parseScore, expand, loadScore } from '../core/score.js';
import { renderTrack } from '../core/render.js';
import { parseFx, renderFx, explainFx } from '../core/fx.js';
import { encodeWav, encodeMp3 } from '../core/wav.js';
import { INSTRUMENTS, listInstruments, instrumentFor } from '../core/instruments.js';
import { probeScore, ROLE } from '../core/probe.js';
import { serve, buildManifest } from './serve.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TRACKS = join(ROOT, 'tracks');
const FX = join(ROOT, 'fx');
const ERAS = ['8bit', '16bit'];

const argv = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? (argv[i + 1]?.startsWith('--') ? true : argv[i + 1] ?? true) : d;
};
const has = (n) => argv.includes(`--${n}`);
const positional = argv.filter((a, i) => !a.startsWith('--')
  && !(i > 0 && argv[i - 1].startsWith('--') && !['json', 'all', 'strict', 'quiet', 'vary', 'both'].includes(argv[i - 1].slice(2))));

const listTracks = () => readdirSync(TRACKS).filter((f) => f.endsWith('.snd')).map((f) => f.replace(/\.snd$/, ''));
const listFx = () => readdirSync(FX).filter((f) => f.endsWith('.fx')).map((f) => f.replace(/\.fx$/, ''));
const readTrack = (n) => loadScore(readFileSync(join(TRACKS, `${n}.snd`), 'utf8'), `${n}.snd`);
const readFxFile = (n) => {
  const { fx, errors } = parseFx(readFileSync(join(FX, `${n}.fx`), 'utf8'), `${n}.fx`);
  if (errors.length) throw new Error(errors.join('\n'));
  return fx;
};

/** A selector resolves to names: explicit ones, or everything with --all. */
function select(given, all) {
  if (has('all') || !given.length) return all;
  const bad = given.filter((n) => !all.includes(n));
  if (bad.length) die(`unknown: ${bad.join(', ')}\navailable: ${all.join(', ')}`);
  return given;
}

const die = (m) => { console.error(`sound: ${m}`); process.exit(1); };
const outDir = () => {
  const d = resolve(flag('out', join(ROOT, 'audio')));
  mkdirSync(d, { recursive: true });
  return d;
};

async function write(L, R, rate, path, format, depth) {
  const buf = format === 'mp3'
    ? await encodeMp3(L, R, rate, Number(flag('kbps', 192)))
    : encodeWav(L, R, rate, depth);
  writeFileSync(path, buf);
  return buf.length;
}

/** Hand the file to whatever the OS uses. macOS has afplay; Linux may not. */
function playFile(path) {
  const cmd = process.platform === 'darwin' ? 'afplay'
    : process.platform === 'win32' ? 'powershell' : 'aplay';
  const args = process.platform === 'win32'
    ? ['-c', `(New-Object Media.SoundPlayer '${path}').PlaySync()`] : [path];
  return new Promise((ok) => {
    const p = spawn(cmd, args, { stdio: 'ignore' });
    p.on('error', () => { console.error(`  (no '${cmd}' on this machine -- wrote ${path})`); ok(); });
    p.on('exit', ok);
  });
}

// ------------------------------------------------------------------- verbs --

const VERBS = {

  async ls() {
    const era = flag('era');
    const rows = listTracks().map((n) => {
      const t = readTrack(n);
      return { name: n, title: t.name, bpm: t.bpm, beats: t.beats, era: t.era,
        bars: t.totalBars, seconds: +t.seconds.toFixed(1), voices: t.voices.length,
        tags: t.tags };
    }).filter((r) => !era || r.era === era);
    if (has('json')) return console.log(JSON.stringify(rows, null, 2));
    console.log('TRACKS');
    for (const r of rows) {
      console.log(`  ${r.name.padEnd(16)} ${String(r.title).padEnd(16)} ${String(r.bpm).padStart(3)}bpm `
        + `${String(r.beats).padStart(2)}/bar ${r.era.padEnd(6)} ${String(r.bars).padStart(3)}bars `
        + `${String(r.seconds).padStart(6)}s ${r.voices}v  ${r.tags.join(' ')}`);
    }
    const fx = listFx();
    console.log(`\nEFFECTS (${fx.length})`);
    for (const n of fx) {
      const f = readFxFile(n);
      console.log(`  ${n.padEnd(16)} ${Object.keys(f.eras).map((e) => `${e}:${f.eras[e].filter((l) => l.kind !== 'echo').length}L`).join(' ').padEnd(20)} ${f.desc}`);
    }
  },

  check() {
    const names = select(positional.slice(1), listTracks());
    const problems = [];
    const minSeconds = Number(flag('min-seconds', 0));
    for (const n of names) {
      const text = readFileSync(join(TRACKS, `${n}.snd`), 'utf8');
      const { track, errors } = parseScore(text, `${n}.snd`);
      problems.push(...errors);
      if (errors.length) continue;
      const t = expand(track);
      for (const s of t.missing) problems.push(`${n}: @order names unknown section '${s}'`);
      if (minSeconds && t.seconds < minSeconds) {
        problems.push(`${n}: ${t.seconds.toFixed(1)}s, under the ${minSeconds}s floor`);
      }
      for (const v of t.voices) {
        if (!INSTRUMENTS[v.inst]) problems.push(`${n}.${v.id}: unknown instrument '${v.inst}'`);
      }
      // A voice whose bars disagree in length is the most common authoring
      // slip and the one that is inaudible until the arrangement drifts.
      const lens = new Set(t.voices.map((v) => v.bars.length));
      if (lens.size > 1) problems.push(`${n}: voices have different bar counts: ${[...lens].join(', ')}`);
      if (!has('quiet')) {
        console.log(`  ${n.padEnd(16)} ${String(t.totalBars).padStart(3)} bars  ${t.seconds.toFixed(1).padStart(6)}s  ${t.voices.length} voices`);
      }
    }
    // Effects are only checked when the call was not aimed at named tracks --
    // `sound check scramble` should not fail because 'scramble' is not an
    // effect, which is what the previous version did.
    const fxNames = (!positional[1] || has('all')) ? listFx() : [];
    for (const n of fxNames) {
      const { errors } = parseFx(readFileSync(join(FX, `${n}.fx`), 'utf8'), `${n}.fx`);
      problems.push(...errors);
    }
    if (problems.length) {
      console.error(`\n${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
      process.exit(1);
    }
    console.log(`\n${names.length} track(s)${fxNames.length ? ` and ${fxNames.length} effect(s)` : ''} pass.`);
  },

  async render() {
    const names = select(positional.slice(1), listTracks());
    const eras = has('both') ? ERAS : [flag('era') || null];
    const format = flag('format', 'wav');
    const depth = Number(flag('depth', 16));
    const dir = outDir();
    const report = [];
    for (const n of names) {
      const t = readTrack(n);
      for (const e of eras) {
        const era = e || t.era;
        const out = renderTrack(t, {
          era, bars: flag('bars') ? Number(flag('bars')) : null,
          bpm: flag('bpm') ? Number(flag('bpm')) : null,
        });
        const file = `${n}${eras.length > 1 || flag('era') ? `-${era}` : ''}.${format}`;
        const bytes = await write(out.L, out.R, out.rate, join(dir, file), format, depth);
        const subs = out.stats.voices.filter((v) => v.substituted);
        console.log(`  ${file.padEnd(28)} ${out.stats.seconds.toFixed(1).padStart(6)}s  `
          + `peak ${out.stats.peakDb.toFixed(1).padStart(6)} dBFS  RMS ${out.stats.rmsDb.toFixed(1).padStart(6)} dBFS  `
          + `${(bytes / 1024 / 1024).toFixed(1)}MB`
          + `${out.stats.limitDb < -0.1 ? `  limited ${out.stats.limitDb.toFixed(1)}dB` : ''}`
          + `${subs.length ? `  [${subs.map((s) => `${s.from}->${s.inst}`).join(' ')}]` : ''}`);
        report.push({ track: n, era, file, ...out.stats });
      }
    }
    if (has('json')) writeFileSync(join(dir, 'render.json'), `${JSON.stringify(report, null, 2)}\n`);
    console.log(`\nWrote ${report.length} file(s) to ${dir}`);
  },

  async play() {
    const n = positional[1] || die('play needs a track name');
    const t = readTrack(n);
    const era = flag('era') || t.era;
    const out = renderTrack(t, {
      era, bars: flag('bars') ? Number(flag('bars')) : null,
      bpm: flag('bpm') ? Number(flag('bpm')) : null,
    });
    const path = join(tmpdir(), `sound-${n}-${era}.wav`);
    await write(out.L, out.R, out.rate, path, 'wav', 16);
    console.log(`${t.name}  ${era}  ${out.stats.seconds.toFixed(1)}s  ${out.stats.bpm}bpm`
      + `${out.stats.bpm !== t.bpm ? ` (score says ${t.bpm})` : ''}  ${t.totalBars} bars`);
    console.log(`  ${out.stats.voices.map((v) => `${v.voice}:${v.inst}`).join('  ')}`);
    await playFile(path);
  },

  async fx() {
    const sub = positional[1] || 'list';
    if (sub === 'list') {
      for (const n of listFx()) {
        const f = readFxFile(n);
        console.log(`  ${n.padEnd(14)} ${f.desc}`);
      }
      return;
    }
    if (sub === 'explain') {
      const n = positional[2] || die('fx explain needs a name');
      const f = readFxFile(n);
      console.log(`${f.id} -- ${f.desc}\n`);
      for (const era of Object.keys(f.eras)) {
        console.log(`  ${era}   (${f.eras[era].filter((l) => l.kind !== 'echo').length} layers)`);
        for (const l of explainFx(f, era)) console.log(`    ${l}`);
        console.log('');
      }
      if (f.vary) console.log(`  vary: ${Object.entries(f.vary).map(([k, v]) => `${k} +-${v * 100}%`).join(', ')}`);
      return;
    }
    if (sub === 'play') {
      const n = positional[2] || die('fx play needs a name');
      const f = readFxFile(n);
      const eras = has('both') ? ERAS : [flag('era', '8bit')];
      for (const era of eras) {
        const out = renderFx(f, era, { vary: has('vary'), seed: Number(flag('seed', 1)) });
        const path = join(tmpdir(), `sound-fx-${n}-${era}.wav`);
        await write(out.L, out.R, out.rate, path, 'wav', 16);
        console.log(`  ${n} ${era}  ${out.stats.seconds.toFixed(2)}s  ${out.stats.layers} layers  peak ${out.stats.peakDb.toFixed(1)} dBFS`);
        await playFile(path);
      }
      return;
    }
    if (sub === 'render') {
      const names = select(positional.slice(2), listFx());
      const dir = outDir();
      const format = flag('format', 'wav');
      for (const n of names) {
        const f = readFxFile(n);
        for (const era of has('era') ? [flag('era')] : ERAS) {
          const out = renderFx(f, era, { vary: has('vary') });
          const file = `fx-${n}-${era}.${format}`;
          await write(out.L, out.R, out.rate, join(dir, file), format, Number(flag('depth', 16)));
          console.log(`  ${file.padEnd(30)} ${out.stats.seconds.toFixed(2)}s  ${out.stats.layers} layers`);
        }
      }
      console.log(`\nWrote to ${dir}`);
      return;
    }
    die(`unknown fx verb '${sub}' (list, play, render, explain)`);
  },

  /** Play one instrument on its own, using the shared probe phrase. */
  async hear() {
    const n = positional[1] || die(`hear needs an instrument. Try: ${Object.keys(INSTRUMENTS).join(', ')}`);
    const inst = INSTRUMENTS[n] || die(`unknown instrument '${n}'`);
    const era = flag('era') || inst.era;
    const t = loadScore(probeScore(n, inst), `probe-${n}`);
    const out = renderTrack(t, { era });
    const path = join(tmpdir(), `sound-hear-${n}-${era}.wav`);
    await write(out.L, out.R, out.rate, path, 'wav', 16);
    const got = instrumentFor(n, era);
    console.log(`${n}  ${era}  ${ROLE[n] || 'lead'} phrase  ${t.bpm}bpm  ${out.stats.seconds.toFixed(1)}s`
      + `${got.substituted ? `  [substituted by ${got.name}]` : ''}`);
    console.log(`  ${inst.desc || ''}`);
    await playFile(path);
  },

  instruments() {
    const era = flag('era');
    for (const e of era ? [era] : ERAS) {
      console.log(`\n${e}`);
      for (const i of listInstruments(e)) {
        console.log(`  ${i.name.padEnd(12)} ${String(i.layers ? `${i.layers} layer${i.layers > 1 ? 's' : ''}` : 'kit').padEnd(9)} ${i.desc}`);
      }
    }
  },

  explain() {
    const n = positional[1] || die('explain needs an instrument name');
    const inst = INSTRUMENTS[n] || die(`unknown instrument '${n}'`);
    console.log(`${n}  (${inst.era})\n  ${inst.desc}\n`);
    if (inst.fm) {
      console.log(`  FM algorithm: ${inst.fm.algo}`);
      inst.fm.ops.forEach((o, i) => {
        if (!o.level) return;
        console.log(`    op${i + 1}  ratio ${String(o.ratio).padEnd(6)} level ${o.level}  a${o.a} d${o.d} s${o.s} r${o.r}${o.fb ? `  feedback ${o.fb}` : ''}`);
      });
      console.log('');
    }
    if (inst.layers) {
      console.log(`  ${inst.layers.length} layer(s), summed:`);
      inst.layers.forEach((l, i) => {
        const bits = Object.entries(l).filter(([k]) => k !== 'osc').map(([k, v]) => `${k}=${v}`).join(' ');
        console.log(`    ${i + 1}. ${String(l.osc).padEnd(7)} ${bits}`);
      });
    }
    if (inst.cut) console.log(`\n  low-pass at ${inst.cut} Hz`);
    console.log(`  envelope: ${inst.env === 'nes' ? '15-step hardware counter' : JSON.stringify(inst.env)}`);
    console.log(`  pitch:    ${inst.quantize ? 'quantised to the 11-bit period register' : 'equal temperament'}`);
    for (const e of ERAS) {
      const s = instrumentFor(n, e);
      if (s.substituted) console.log(`  on ${e}: substituted by '${s.name}'`);
    }
  },

  view() {
    serve({ root: ROOT, port: Number(flag('port', 7171)), open: !has('no-open') });
  },

  /**
   * Write the previewer as a self-contained static site.
   *
   * No server, no build tooling, no dependencies: index.html, the worker, the
   * same core/ modules the CLI imports, and one JSON of every score and effect
   * as text. Drop the folder on GitHub Pages and it works, because the tab
   * does the synthesis.
   */
  async build() {
    const dir = resolve(positional[1] || flag('out', join(ROOT, 'site')));
    mkdirSync(join(dir, 'core'), { recursive: true });
    const files = ['index.html', 'render-worker.js', 'live-worklet.js'];
    for (const f of files) writeFileSync(join(dir, f), readFileSync(join(ROOT, 'ui', f)));
    for (const f of readdirSync(join(ROOT, 'core')).filter((x) => x.endsWith('.js'))) {
      writeFileSync(join(dir, 'core', f), readFileSync(join(ROOT, 'core', f)));
    }
    const manifest = JSON.stringify(await buildManifest(ROOT));
    writeFileSync(join(dir, 'data.json'), manifest);
    let bytes = 0;
    for (const f of [...files.map((x) => join(dir, x)), join(dir, 'data.json')]) {
      bytes += readFileSync(f).length;
    }
    for (const f of readdirSync(join(dir, 'core'))) bytes += readFileSync(join(dir, 'core', f)).length;
    console.log(`  index.html, render-worker.js, core/ (${readdirSync(join(dir, 'core')).length} modules), data.json`);
    console.log(`  ${(bytes / 1024).toFixed(0)} KB total, no dependencies, no server.`);
    console.log(`\nWrote ${dir}`);
    console.log('Serve that folder anywhere -- GitHub Pages, S3, `python3 -m http.server`.');
  },

  help() {
    console.log(`sound -- music and sound effects for games

  sound ls                          every track and effect
  sound check [names|--all]         the gate: bars, tokens, instruments
  sound play <track> [--era 8bit]   render and play it here
  sound render [names|--all]        WAV/MP3 to ./audio
      --both            render 8bit AND 16bit side by side
      --era 8bit|16bit  force an era, overriding the score
      --format wav|mp3  --depth 16|24|32  --bars N  --out DIR
      --bpm N           re-sequence at another tempo, pitch unchanged
  sound fx list | play <n> | render [names] | explain <n>
      --both  --era  --vary
  sound instruments [--era 16bit]   what is available
  sound explain <instrument>        its layers, spelled out
  sound hear <instrument>           play a phrase on it
  sound view [--port 7171]          the side-by-side preview in a browser
  sound build [dir]                 write that preview as a static site

A track is tracks/<name>.snd -- plain text, one bar per line, one column per
step. An effect is fx/<name>.fx -- one layer per line. Both are meant to be
read in a diff.`);
  },
};

const verb = positional[0] || 'help';
const fn = VERBS[verb] || (verb === 'status' ? VERBS.ls : null);
if (!fn) die(`unknown command '${verb}'. Try \`sound help\`.`);
try { await fn(); } catch (e) { die(e.message); }
