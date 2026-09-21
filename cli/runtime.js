// `sound runtime` -- write the engine a game imports.
//
// Vended rather than published, for the same reason `art runtime` is: the game
// keeps a committed copy it can read in a diff, and the copy cannot drift from
// the tool that made it because the tool writes it.
//
// What goes out is the core VERBATIM. Not a port, not a bundle, not a second
// synth written against the Web Audio API -- the same files that render the
// WAVs, copied, plus the scores and effects as text and a thin browser wrapper
// that turns what they render into AudioBuffers. One synth is the whole point
// of this package, and a runtime that reimplemented it would be the third.
//
// It renders rather than schedules. Web Audio can build an oscillator graph
// per note, and that is how both games did it before, and it is why their
// sounds drifted apart from each other and from anything anyone could listen
// to offline. Here a sound is PCM, computed by the same code on every platform,
// and Web Audio's only job is to play a buffer.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

// Copied in dependency order so the emitted directory reads top to bottom.
const CORE = ['dsp', 'instruments', 'voice', 'score', 'render', 'fx'];

const HEADER = (what) => `// ${what}
//
// EMITTED by \`sound runtime\`. Do not edit: the next emit overwrites it.
// The source of truth is tools/sound-cli. If a sound is wrong, fix the .fx or
// the .snd it came from and emit again.
`;

/** The text of every score and effect the game asked for, as a module.
 *
 * Text, not pre-parsed JSON. The parser is being shipped anyway, a score is
 * smaller as the thing a human wrote than as the object it becomes, and the
 * emitted file stays something you can read and diff -- which is the same
 * argument that made the format plain text in the first place.
 */
function dataModule(root, tracks, fx) {
  const q = (s) => JSON.stringify(s);
  const lines = [HEADER('The scores and effects this game uses.'), ''];
  lines.push('export const TRACKS = {');
  for (const n of tracks) {
    lines.push(`  ${q(n)}: ${q(readFileSync(join(root, 'tracks', `${n}.snd`), 'utf8'))},`);
  }
  lines.push('};', '', 'export const FX = {');
  for (const n of fx) {
    lines.push(`  ${q(n)}: ${q(readFileSync(join(root, 'fx', `${n}.fx`), 'utf8'))},`);
  }
  lines.push('};', '');
  return lines.join('\n');
}

const INDEX = `${HEADER('The engine: scores and effects, rendered, through Web Audio.')}
import { loadScore } from './score.js';
import { renderTrack } from './render.js';
import { parseFx, renderFx } from './fx.js';
import { TRACKS, FX } from './data.js';

/** Two Float32Arrays into a buffer this context can play. */
function toBuffer(ctx, { L, R, rate }) {
  const buf = ctx.createBuffer(2, L.length, rate);
  buf.copyToChannel(L, 0);
  buf.copyToChannel(R.length === L.length ? R : L, 1);
  return buf;
}

/**
 * Every sound a game needs, from the files the tool checks.
 *
 * Effects are rendered on demand and kept: they are short, they repeat, and
 * rendering one costs a couple of milliseconds. Tracks are rendered on demand
 * too, but a track is twenty seconds of stereo and takes a couple of hundred,
 * so \`warm()\` exists to get that out of the way before it is wanted -- during
 * a title screen, or a level card.
 *
 * Nothing here decides WHEN a sound plays or how loud it is against the rest.
 * That is the game's business and it stays in the game.
 */
export class Engine {
  constructor(ctx, { era = '16bit', out = null, gain = 1, normalize = false } = {}) {
    this.ctx = ctx;
    this.era = era;
    // OFF by default here, and on by default in the tool, and the difference
    // is what the sound is for. The tool peak-matches every effect so that an
    // A/B compares timbre instead of gain staging. A game wants the opposite:
    // a footstep and a boss landing are not the same size, and the .fx files
    // already say so in their layer gains. Normalising would throw that away
    // and hand the mixing back to whoever is calling play().
    this.normalize = normalize;
    this.master = ctx.createGain();
    this.master.gain.value = gain;
    this.master.connect(out || ctx.destination);
    this.fxBuf = new Map();
    this.trackBuf = new Map();
    this.playing = null;
  }

  /** The names this build knows about. */
  static effects() { return Object.keys(FX); }
  static tracks() { return Object.keys(TRACKS); }

  buffer(name) {
    let b = this.fxBuf.get(name);
    if (b !== undefined) return b;
    const text = FX[name];
    b = null;
    if (text) {
      const { fx, errors } = parseFx(text, name + '.fx');
      if (!errors.length) {
        b = toBuffer(this.ctx, renderFx(fx, this.era, { normalize: this.normalize }));
      }
    }
    this.fxBuf.set(name, b);
    return b;
  }

  /**
   * Play an effect.
   *
   * \`rate\` retunes it by playing the same samples faster, which is how one
   * splat serves three different bugs and one step serves a left foot and a
   * right. \`gain\` is the game's mix, not the effect's: the effect already
   * carries its own level, normalised against every other effect.
   */
  play(name, { gain = 1, rate = 1, pan = 0, when = 0 } = {}) {
    const buf = this.buffer(name);
    if (!buf || !this.ctx) return null;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    let node = src;
    if (pan && this.ctx.createStereoPanner) {
      const p = this.ctx.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      node.connect(p); node = p;
    }
    const g = this.ctx.createGain();
    g.gain.value = gain;
    node.connect(g); g.connect(this.master);
    src.start(when ? this.ctx.currentTime + when : 0);
    return src;
  }

  /** Render a track ahead of needing it. Returns a promise so a caller can
   *  wait, but nothing has to. */
  async warm(name) {
    if (this.trackBuf.has(name) || !TRACKS[name]) return;
    // A yield first: rendering is a couple of hundred milliseconds of straight
    // arithmetic and it will hold the frame it runs on either way, so it runs
    // on one nobody is looking at rather than the one starting the level.
    await new Promise((r) => setTimeout(r, 0));
    const track = loadScore(TRACKS[name], name + '.snd');
    // \`loop\`: game music repeats, so it is rendered to repeat. Without it the
    // buffer carries the renderer's 1.2 s tail, and a looping source plays that
    // second of silence every time round -- which is heard as the track ending
    // and starting again rather than as music that has not stopped.
    this.trackBuf.set(name, toBuffer(this.ctx, renderTrack(track, { era: this.era, loop: true })));
  }

  /**
   * Start a track, looping, crossfading out of whatever was playing.
   *
   * Crossfaded rather than cut because the tracks are different keys: cutting
   * from the overworld into the King's theme lands a D minor chord on top of a
   * C major one for as long as the old note has left to ring.
   */
  async music(name, { fade = 0.6, loop = true, gain = 1 } = {}) {
    await this.warm(name);
    const buf = this.trackBuf.get(name);
    if (!buf) return null;
    const t = this.ctx.currentTime;
    this.stopMusic(fade);
    const src = this.ctx.createBufferSource();
    src.buffer = buf; src.loop = loop;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), t + fade);
    src.connect(g); g.connect(this.master);
    src.start(t);
    this.playing = { src, gain: g, name };
    return this.playing;
  }

  stopMusic(fade = 0.6) {
    const p = this.playing;
    if (!p) return;
    const t = this.ctx.currentTime;
    p.gain.gain.cancelScheduledValues(t);
    p.gain.gain.setValueAtTime(Math.max(0.0001, p.gain.gain.value), t);
    p.gain.gain.exponentialRampToValueAtTime(0.0001, t + fade);
    p.src.stop(t + fade + 0.02);
    this.playing = null;
  }

  /** The music's level, for ducking under dialogue or fading out a stage. */
  setMusicGain(v, ramp = 0.25) {
    if (!this.playing) return;
    const t = this.ctx.currentTime;
    this.playing.gain.gain.cancelScheduledValues(t);
    this.playing.gain.gain.setValueAtTime(Math.max(0.0001, this.playing.gain.gain.value), t);
    this.playing.gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, v), t + ramp);
  }

  setGain(v) { this.master.gain.value = v; }
}
`;

/**
 * Write the engine into a game.
 *
 * Several files rather than one, because the core goes out verbatim and one
 * of its names (`num`) is declared in two of them. Flattening would mean
 * renaming somebody's local helper, and a runtime whose source differs from
 * the tool's -- however slightly -- is the thing this command exists to
 * prevent.
 */
export function emitRuntime(root, { dir, tracks, fx, quiet = false }) {
  mkdirSync(dir, { recursive: true });
  const written = [];
  for (const m of CORE) {
    const src = readFileSync(join(root, 'core', `${m}.js`), 'utf8');
    const out = join(dir, `${m}.js`);
    writeFileSync(out, `${HEADER(`core/${m}.js, copied verbatim.`)}\n${src}`);
    written.push(out);
  }
  const data = join(dir, 'data.js');
  writeFileSync(data, dataModule(root, tracks, fx));
  written.push(data);
  const index = join(dir, 'index.js');
  writeFileSync(index, INDEX);
  written.push(index);
  if (!quiet) {
    for (const f of written) console.log(`  ${basename(dir)}/${basename(f)}`);
    console.log(`\n${tracks.length} track(s), ${fx.length} effect(s) -> ${dir}`);
    console.log('import { Engine } from \'./audio/index.js\'');
  }
  return written;
}
