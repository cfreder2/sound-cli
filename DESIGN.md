# sound — the command surface

Music and sound effects for games: write a score, generate one, record one,
play it, render it, check it, ship it.

Built against [`art-cli`](../art-cli/DESIGN.md), which settled the shape of a
tool in this suite: a profile that holds the project's character, one rule that
decides how a thing is made, `--json` on every reader, `--dry-run` on every
writer, and a `runtime` verb that emits the module the game imports.

The engine already exists. It is `VECTRENCH/src/music.js` — 480 lines of
lookahead scheduler over a five-voice chip synth — sitting on
`VECTRENCH/src/nes.js`, which is 133 lines of hardware character that has
**already been copy-pasted into AXI unmodified**. This document is about
turning that into something two games depend on instead of two games contain.

## The job, in one line

Get from "the boss fight needs a theme" to a track the game plays, whether the
theme was written by a person at a keyboard, arranged by an agent from a lead
sheet, or dragged in as a MIDI file — and never render it twice from two
different synths again.

## What already exists, and what it costs

| File | Lines | What it is |
| --- | --- | --- |
| `VECTRENCH/src/nes.js` | 133 | LFSR noise, 32-step triangle, 11-bit pitch grid, sweep unit, 15-step envelope |
| `AXI/web/nes.js` | 137 | **the same file**, plus a four-line comment saying so |
| `VECTRENCH/src/music.js` | 480 | the sequencer: five voices, lookahead scheduling, vibrato, arps, fills, per-voice intensity, `seek`, `beatNow` |
| `VECTRENCH/src/songs.js` | 3,134 | the score book and the format — sections, `order`, chord table, mix and duty defaults |
| `VECTRENCH/src/studio.js` | 782 | a phone-first composer that edits the format directly |
| `VECTRENCH/src/tracks.js` | 100 | user tracks in localStorage, registered into the same lookup as shipped songs |
| `VECTRENCH/src/audio.js` | 654 | the bus, the engine drone, and 30 fire-and-forget sound effects |
| `AXI/web/sound.js` | 390 | ~28 more effects, plus **a second, cruder `Music` class** with notes in hardcoded arrays |
| `VECTRENCH/tools/render-music.mjs` | 415 | **a third synth**, re-implementing music.js offline to write WAV/MP3 |
| `VECTRENCH/tools/music-audit.mjs` | 75 | the structural gate: bar lengths, note tokens, drum charsets, minimum duration |

Three synths and one score format. `render-music.mjs` says it "mirrors
src/music.js closely enough" in its first line, which is an accurate
description of a file that is guaranteed to drift and has no test that would
notice. That is the bug this library exists to delete.

## Status against this spec

Built and tested: `ls`/`status`, `check`, `play`, `render`, `fx`
(`list`/`play`/`render`/`explain`), `instruments`, `explain`, `view`, `build`.
See [README.md](README.md).

Not built: `init`, `new`, `import`, `prompt`, `compose`, `record`, `audit`.

**`runtime` turned out to be unnecessary.** The spec assumed the games would
need a generated, vendored copy of the player. They do not: `core/` has no Node
dependencies at all -- `dsp`, `score`, `instruments`, `render` and `fx` never
had any, and `wav` was made isomorphic by writing through a DataView instead of
a Buffer. A game imports `core/` directly as vanilla ESM, which is what the
`runtime` verb was going to produce anyway. `sound build` emits the previewer
as a static site by copying those same files.

Two decisions changed in the building, and this document now reflects them.
**Tracks are `.snd`, not YAML** -- a bar has to be one line with the steps in
columns, and YAML block scalars gave nothing that plain text did not while
adding a layer of quoting between the author and the grid. **Eras substitute
rather than restrict**: any score plays on either rig through the table in
`core/instruments.js`, which is what makes side-by-side A/B possible from one
file. See [FORMAT.md](FORMAT.md).

## The surface

```
sound init                    write sound.yaml for this project
sound status                  the board: every track and effect, its state, what is stale

sound new    <name>           an empty score in the project's era and key
sound import <file>           MIDI, MusicXML or ABC in; a score out
sound prompt [selector]       the exact text an agent is sent to compose
sound compose <name>          generate a score from a description or a lead sheet
sound record [name]           the virtual keyboard; play it in, quantised to the grid

sound play   [selector]       play it here, in the terminal, with a moving playhead
sound view   [selector]       the track editor in a browser: grid, keyboard, playhead
sound render [selector]       WAV/MP3/OGG to disk
sound check  [selector]       verify the rules; nonzero exit on a violation
sound audit                   what ships: length, peak, RMS, loop points, per-voice headroom

sound fx new  <name>          design a sound effect from a description
sound fx play <name>          fire it
sound fx list

sound runtime                 emit the player the game imports
```

A **selector** is `<name>… | --all | --stale | --tag <t>`, on every verb, for
the same reason `art` has one: VECTRENCH ships nineteen arrangement slots
across its score book, and a surface that addresses one at a time is a surface
you drive with a shell loop.

Flat, because the pipeline is the mental model. `fx` is a group because a sound
effect is not a score — it is never sequenced, never arranged, and never
checked against a bar length.

### Global

`--project/-p <dir>` the directory holding `sound.yaml`; defaults to the
nearest one above `$PWD`. `--json` on every reader. `--dry-run` on every
writer. `--era 8bit|16bit` to override the profile for one run, which is how
you hear what a track sounds like on the other hardware.

### The stages

| Command | Reads | Writes | Key options |
| --- | --- | --- | --- |
| `import` | `.mid`, `.musicxml`, `.abc` | `tracks/<id>.yaml` | `--quantise 16`, `--voices 5`, `--key` |
| `prompt` | sound.yaml | nothing | `--note`, `--reference/-i <track>` |
| `compose` | sound.yaml | `tracks/<id>.yaml` | `--from <file>`, `--bars 32`, `--dry-run` |
| `record` | sound.yaml | `tracks/<id>.yaml` | `--voice lead`, `--bpm`, `--count-in 2`, `--overdub` |
| `render` | a track | `audio/<id>.mp3` | `--format wav\|mp3\|ogg`, `--depth 16\|24\|32f`, `--rate 44100` |
| `check` | tracks + sound.yaml | nothing | `--strict` |
| `runtime` | sound.yaml | `<dir>/sound/*.js` | `--era`, `--minify`, `--fx-only` |

`--from` on `compose` is the same escape hatch `art draw --from` is: a score
written in ChatGPT, or a MIDI exported from anything, drops into the pipeline
without a generator being configured, and the tool is still useful.

## The score format: already right, do not replace it

A bar is a string, one token per sixteenth, `.` holds and `-` rests:

```
lead: ['a4 c5 e5 a5 g5 e5 c5 e5 d5 .  .  .  e5 .  .  . ']
```

This is the single best decision in the existing engine and it survives intact.
Column position **is** time, so rhythm is visible in a diff, in a terminal, and
in a model's context window. A JSON array of `{pitch, start, duration}` objects
carries the same information and no one — human or agent — can see the groove
in it. Every alternative surveyed loses that property, so there is no
alternative.

What the format already has, all of it kept: sections plus an `order` list, so
two minutes of arrangement comes from twenty written bars; `loopFrom` and
`drumsFrom` counted in order slots rather than bars; `k h x m` drum charts;
a chord table for the arpeggio voice; `/` and `\` for hardware sweeps; per-song
`vibrato`, `mix`, `duty`, `eq`, and per-voice `intensity` ranges.

Two changes, both additive:

**Tracks move to `tracks/<id>.yaml`, one file each.** `songs.js` is 3,134 lines
of data in a source file. YAML keeps the bar strings exactly as they are
written today (they are quoted scalars, and a block scalar keeps the alignment),
makes a single track diffable and reviewable on its own, and lets an agent write
one without rewriting a module. The loader accepts the current JS object shape
unchanged, so migration is mechanical and reversible.

**Voices become a list.** The engine hardcodes six roles — `lead`, `lead2`,
`arp`, `bassLine`, `bass`, `drums` — with a fixed instrument each. That is the
NES's channel count wearing a costume, and it is exactly what blocks 16-bit.
The general form:

```yaml
voices:
  - id: lead
    instrument: pulse-25
    mix: 0.20
    bars: [...]
  - id: horns
    instrument: fm/brass-4op
    pan: -0.3
    mix: 0.14
    bars: [...]
```

The six current roles are a **preset** named `nes5`, so every existing track
loads into the general form without being edited, and `sound check` proves it
by rendering both paths and comparing samples.

## The eras: one rule, one place

`art` has `kind_for(subject)` deciding sizing, layout and checks from one
function. The equivalent here is `era`, and it decides the voice set, the pitch
grid, the envelope shape and which checks run.

| era | voices | pitch | envelope | what it adds |
| --- | --- | --- | --- | --- |
| `8bit` | 5 fixed: 2 pulse, triangle, noise, DPCM-ish kick | quantised to the 11-bit period register | 15 steps down, audible on short notes | what ships today |
| `16bit` | up to 16, arbitrary roles | true equal temperament | ADSR per voice | FM operators, sampled instruments, stereo pan, a hardware-style echo send |
| `32bit` | unbounded | — | — | multi-sampled instruments, real reverb, streamed beds |

`8bit` is `authentic: true` in the current code and it must stay
bit-for-bit what it is. The quantisation is not a limitation the library is
working around — the coarse pitch grid near C7 is *why* NES leads sound sour up
there, and losing it loses the character the file was written to preserve.

**`16bit` is where the work is.** Concretely it is four things:

1. **FM.** Four operators, eight algorithms, per-operator ADSR and a feedback
   path — the YM2612, which is what a Genesis bass and every brass stab is. A
   feedback loop cannot be built from plain `OscillatorNode`s without a
   `DelayNode` in the path, so this needs an `AudioWorklet` in the browser and
   a plain sample loop offline. **It is the one part that is genuinely new
   code**, and it is the reason the backend split below is not optional.
2. **Samples.** BRR-style looped instruments with ADSR, pitch and pan — the
   SNES. `AudioBufferSourceNode` does this natively; offline it is
   interpolation and an envelope. Cheap.
3. **Echo.** A delay with feedback through a short FIR, which is the SNES's
   signature wash and the reason its soundtracks sound wet. One send bus.
4. **Stereo.** Per-voice pan. The current bus is mono.

`32bit` is listed because the format allows it once voices are a list and
instruments are named — but an instrument *library* is the entire job there,
and there is no game in this repo asking for one. It is scoped, not started.

## The backend split, which is the point of the rewrite

There are three synths today because the browser has Web Audio and Node does
not. The fix is to write the musical part once and the sounding part twice:

```
core/       scheduler, score parsing, arrangement expansion, voice logic
            — pure, no AudioContext, no I/O, fully testable
backends/
  webaudio.js   core's note events → nodes on a real clock
  offline.js    core's note events → a Float32Array
runtime/    what a game imports: core + webaudio, dependency-free ESM
cli/        node CLI: core + offline, plus WAV/MP3/OGG
ui/         the previewer and the virtual keyboard, served as a page
fx/         the effect catalog and its designer
```

`core` emits note events — pitch, time, duration, gain, instrument, envelope,
modulation — and nothing else. A backend is the only thing that knows what an
oscillator is. Everything currently duplicated between `music.js` and
`render-music.mjs` (the token parser, `expandSong`, the arpeggio index, the
drum pattern tiling, the intensity curve, the bass root-and-fifth fallback)
lives in `core` once.

**The test that makes this stick:** `sound check --strict` renders every
shipped track through `offline.js` and compares it to a committed golden WAV.
Every track in the current score book gets one at extraction time. After that,
a change that alters what a song sounds like cannot land silently, and the two
backends cannot drift without a red build. That test is the deliverable, not a
nicety — without it this is the same problem in a new directory.

## What a game imports

```js
import { Sound, Music } from './sound/runtime.js';

const sound = new Sound();          // context, compressor, master, resume path
const music = new Music(sound, { era: '8bit' });

music.load(TRACKS.scramble);
music.start();
music.setIntensity(throttle);       // arrangement density, not volume
music.setRate(1.3);                 // tempo follows the throttle
music.beatNow();                    // the step the player is HEARING, not the
                                    // one the scheduler queued a quarter second ago
sound.fx('gun');
```

`beatNow()` stays exactly as it is and stays public. The lookahead scheduler
runs up to 250 ms ahead of the clock, so `step` is the future; the wall EQ bars
and the composer playhead both need the audible step, and deriving the beat
back out of amplitude is always a frame late. It is the most useful thing in
the engine and the least obvious.

**`sound runtime` emits this as dependency-free vanilla ESM, to be committed.**
That is not a style preference — AXI's Pages workflow is `setup-python` and
`python3 tools/build_web.py` with no install step, and VECTRENCH's own
package.json says npm exists there only to wrap the bundle for iOS. Neither
game can take an npm dependency in its build. So the library is installed by
the person, the runtime is generated into `web/sound/` or `src/sound/`, and the
file header records the version it came from. `art runtime` exists for the
identical reason.

`--fx-only` emits the effect catalog without the sequencer, for a game that
wants sounds and no music.

## Composition by agent

The contract is `prompt` → generate → `check`, the same loop `art` uses, and
for the same reason: the tool owns the rules, so a generation that breaks them
fails a gate instead of shipping.

`sound prompt boss-theme` prints the full text an agent is sent: the format
spec, the project's era and key, the chord table, the available instruments,
the bar count, the minimum duration, and any reference track quoted in full.
`--reference scramble` is how "like the canyon theme, but heavier" becomes
something concrete — the model gets the actual bars.

Input comes in four shapes and they all become the same score:

- **the native format**, which a model writes well because it is aligned text
- **ABC notation** — compact, text, in the training data, good for melody-only
- **MusicXML** — what a notation program exports, and what "sheet music" means
  when it came from Finale, MuseScore or Sibelius
- **MIDI** — what everything else exports, and what a hardware keyboard emits

`import` quantises to the sixteenth grid, folds N MIDI tracks down to the era's
voice count by range and density, and reports every decision it made. A dropped
voice is printed, never silent.

`check` is `music-audit.mjs` generalised and is the whole safety net: bar
lengths match `beats`, tokens parse, drum charts use only `k h x m .`, every
voice has the same bar count after expansion, arp chords resolve, `order`
names sections that exist, no two campaign levels share a theme, and no track
is shorter than the profile's minimum — 105 seconds today, chosen because a
first run must end before the music repeats itself. Those are mechanical
failures that ears should never have to discover. Composition is still judged
by ear.

## The editor, the keyboard, and recording

`sound view` serves a page with the grid the STUDIO already is — rows are the
pitches of the chosen key and scale, so a tap is always in key, and the
constraint is the toy's whole trick. Bars strip along the top, playhead driven
by `beatNow()`, edits land in the running loop without dropping the beat.
That behaviour is 782 working lines in `studio.js` and it is ported, not
reinvented.

What gets added:

**A virtual keyboard**, two octaves, computer-keyboard-mapped and touchable,
with a record arm. Recording is: count-in, metronome, capture note-on/note-off
against the audio clock, quantise to the sixteenth grid, write into the
selected voice. Overdub goes to the next voice. Undo is one bar deep at
minimum, because the whole point is playing a part four times.

**MIDI input is deliberately absent from v1.** Web MIDI is `navigator.requestMIDIAccess`
and it is perhaps thirty lines against a keyboard that is already built — the
recorder is written so that a MIDI note-on and a virtual key press enter at the
same function, and that is the only preparation v1 owes it.

`sound play` is the CLI previewer: it renders through `offline.js`, pipes to
the system player, and prints the bar/beat and the drum chart as it goes. It is
for confirming a generated track is not silent or broken without opening a
browser. It is not for judging the music.

## Sound effects

The name is `sound-cli` and not `music-cli` because 58 effects across the two
games are the same duplication problem one layer down. An effect is a small
declarative graph:

```yaml
gun:
  layers:
    - tone:  {wave: square, from: 720, to: 180, dur: 0.08, gain: 0.12}
    - noise: {dur: 0.06, gain: 0.08, filter: [3000, 800], q: 1.4}
  vary: {pitch: 0.1, gain: 0.05}
```

`vary` is the thing worth having: the existing `gun()` multiplies its pitch by
`0.9 + Math.random() * 0.2` by hand, and every effect fired more than twice a
second needs that or it sounds like a machine. Declaring it means it is never
forgotten.

`sound fx new` takes a description, emits the YAML, renders a preview and
plays it. The catalogue ports from both games as data, and the two `_tone` /
`_noise` implementations collapse into one.

## Extraction, in order

1. **`core` + `offline` + golden renders.** Lift `nes.js` verbatim. Lift the
   parser, `expandSong` and the voice logic out of `music.js` into `core`.
   Render every VECTRENCH track through `offline.js`; commit the WAVs as
   goldens. Nothing in either game changes yet. **This step is the one that
   pays for the project** — after it, `render-music.mjs` is deleted and the
   third synth is gone.
2. **`webaudio` backend + `runtime`.** Prove the two backends agree.
   `sound runtime` into VECTRENCH; delete `src/music.js` and `src/nes.js`;
   the game plays from the generated module. Score book moves to `tracks/`.
3. **AXI.** Delete the vendored `nes.js` and the second `Music` class. AXI's
   hardcoded `LEAD` / `CHORDS` / `ROOTS` arrays become one `tracks/overworld.yaml`.
   This is the first real proof the library serves a second game.
4. **`view`, `record`, the keyboard.** Port STUDIO. VECTRENCH keeps its
   in-game composer by importing the same UI module.
5. **`fx`.** Port both catalogues.
6. **`16bit`.** The FM worklet, samples, echo, pan — behind `era: 16bit`, with
   `8bit` untouched and its goldens still passing.
7. **MIDI in.** Thirty lines and a device picker.

## Deliberately not in scope

- **A DAW.** No automation lanes, no audio tracks, no plugins, no mixdown
  bouncing. The editor exists to make a chiptune score and to hear it. When a
  track needs more than this, it needs Reaper, and the answer is `import`.
- **Shipping rendered audio.** Both games synthesise at runtime and are a small
  download because of it; VECTRENCH survives being opened offline for the same
  reason. `render` exists for review files, for devlogs and for storefront
  trailers — not to become the delivery path.
- **A general MIDI soundfont.** `32bit` would need one and that is a content
  project, not a tool project.
- **Running in either game's CI.** Same conclusion `art` reached: AXI's build
  installs nothing, so the generated runtime is committed and the tool is run
  by a person. `sound check` runs in *this* repo's CI, against the tracks it
  owns.
