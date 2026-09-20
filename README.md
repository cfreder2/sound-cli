# sound-cli

Music and sound effects for games. Plain-text scores, one synth, two console
eras, and a previewer that lets you hear them against each other.

**Status:** the core works. `ls`, `check`, `play`, `render`, `fx`,
`instruments`, `explain` and `view` are built and tested — 22 tests, `npm test`.
Not yet built: `import` (MIDI/MusicXML/ABC), `record` (virtual keyboard),
`compose`, and `runtime` (emitting the module VECTRENCH and AXI would import).
[DESIGN.md](DESIGN.md) is the spec; [FORMAT.md](FORMAT.md) is the file format;
[LAYERING.md](LAYERING.md) is how to make these sounds better.

```sh
npm install        # only needed for MP3 output; WAV has no dependencies
node cli/index.js view
```

```sh
sound ls                          # 7 tracks, 20 effects
sound check --all                 # the gate: bar widths, tokens, instruments
sound play runner --era 16bit     # hear it in the terminal
sound render --all --both         # 8-bit and 16-bit side by side, to ./audio
sound render runner --format mp3 --depth 24
sound fx play splash --both
sound fx explain metal            # the layer stack, line by line
sound explain lead                # an instrument's layers
sound view                        # the browser previewer
```

## The previewer

`sound view` serves a page that **decodes both eras of a track and starts them
together, sample-aligned.** Switching 8-BIT / 16-BIT mid-playback only moves
gain between them, so you land in the same bar instead of restarting and
comparing a timbre to your memory of one four seconds ago.

Every render is loudness-matched first — tracks to −18 dBFS RMS, effects to
−3 dBFS peak — because the 16-bit rig renders several dB quieter on the same
score, and the louder of two takes always wins a blind comparison. What you
hear between the buttons is timbre and nothing else.

**SHOW LAYERS** renders each voice on its own and stacks them as lanes with
mute and solo. Lanes are drawn at their true level in the mix and are *not*
normalised, so a quiet pad looks quiet — which is the thing worth seeing. The
window steps through the track in bars, so you can watch Canon's second violin
enter at bar 17. Effects have the same thing under *inspect layers*.

The page contains no synth. It asks the server for audio, which calls the same
`core/render.js` the CLI calls, so what you A/B in the browser is byte-identical
to what `sound render` writes to disk.

## The format

One track is one file, one bar is one line, one step is a column.

```
@track runner
  name   RUNNER
  bpm    150
  beats  16
  era    8bit

@voice lead inst=lead mix=0.20
  d5  .   a4  .   d5  f5  e5  d5  a4  .   .   .   d5  .   .   .
  c5  .   g4  .   c5  e5  d5  c5  g4  .   .   .   bb4 .   .   .

@voice drums inst=kit mix=0.11
  k   .   h   .   s   .   h   .   k   .   h   .   s   s   x   x
```

`.` holds, `-` rests, `/` and `\` sweep, `~` adds vibrato, `!` accents. Effects
use the same discipline — one layer per line — in `fx/*.fx`.

This is chosen so music is reviewable the way code is: a diff shows which bar
moved, `git blame` says who wrote the chorus, and a merge conflict is confined
to the bars two people both edited. Rendered audio is derived and gitignored;
the renderer is deterministic, so `sound render` reproduces any of it.

See [FORMAT.md](FORMAT.md).

## What ships

**Tracks** — five public-domain classical pieces, three imported from the games,
and two originals.

| | |
| --- | --- |
| `prelude-c` | Bach, Prelude No. 1 in C, BWV 846. Bars 1–12. One long arpeggio — the best piece in the book for hearing what a chip arp voice is *for* |
| `fur-elise` | Beethoven, WoO 59, the A section. Right hand as lead, the left hand's rising arpeggio as bass |
| `ode-to-joy` | Beethoven, Symphony 9. Almost all melody and no rhythm, so the A/B is purely timbre |
| `greensleeves` | Traditional, c. 1580. 6/8, both strains |
| `canon-in-d` | Pachelbel. The ground bass, the violin entry, and the canon at one statement's distance — the file to read for what `@section` and `@order` buy |
| `scramble` | **From [VECTRENCH](https://github.com/cfreder2/VECTRENCH)** — its training-canyon theme. Nineteen order slots over nine sections: two minutes from seventy bars, and no four bars repeat unchanged |
| `void` | **From [VECTRENCH](https://github.com/cfreder2/VECTRENCH)** — deep space. Its opposite: 96 BPM, no arpeggio at all, harmony from held tritone dyads, a pedal bass that shudders rather than walks |
| `overworld` | **From [AXI](https://github.com/cfreder2/axi)** — its field theme. Did not exist as a score; AXI keeps it as raw MIDI arrays and builds the bass at runtime, so this is that music written out |
| `runner` | Original stage theme, native 8-bit. Sections, fills, sweeps, an arrangement |
| `layers` | **A teaching track.** Four bars, six times, one more voice each pass |

**Effects** — 72, each defined in both eras in the same file.

| | |
| --- | --- |
| water | `splash` `splash-small` `splash-big` `drip` `drips` `bubble` `bubbles` `underwater` `pour` `wave` `swim` `thud-wet` |
| impact | `thud` `thud-heavy` `metal` `wood` `glass` `land` `stomp` |
| weapons | `laser` `machinegun` `shotgun` `reload` `ricochet` `shell` `rocket` `explosion` |
| fighting | `punch` `block` `slash` `ko` |
| platformer | `jump` `bounce` `dash` `coin` `checkpoint` `footstep` |
| rpg / magic | `levelup` `spell` `sparkle` `chest` `potion` `heal` `powerup` |
| horror | `heartbeat` `stinger` `creak` `thunder` |
| sci-fi | `teleport` `forcefield` `scan` `powerdown` `robot` `warp` |
| racing | `engine` `skid` `gearshift` `countdown` |
| puzzle / ui | `blip` `select` `pop` `correct` `wrong` `notify` |
| strategy | `build` |
| arcade | `gameover` `extralife` `hurt` `death` |
| ambience | `fire` `wind` `door` |

## Levels, and why `mix=` means something

Every instrument carries a `trim`: a calibration that brings it to a common
K-weighted loudness. Without it the library had a **21.5 dB spread** — a 50%
pulse was twelve decibels louder than a pluck for identical settings — so a
score's balance was an accident of which synthesis method each voice happened
to use, and it *changed when the era changed*. That is why 16-bit renders came
out bass-heavy while 8-bit ones did not: the chord voice was simply vanishing.

```sh
node tools/calibrate.mjs --check    # nonzero exit if any instrument drifted
```

Run it after changing any instrument's layers.

Scores get tone controls of their own — `lp=`, `hp=` and `tilt=` per voice —
for the case where a part is right but sits wrong. Dropping `mix` there just
makes the part quiet instead of making it fit. `sound render --tilt N` does the
same to a whole mix, and the previewer has BASS and TREBLE for auditioning
without changing anything on disk.

## Eras are not bit depth

`--era 8bit|16bit` is a console generation: the NES 2A03 versus the
SNES/Genesis class. `--depth 16|24|32` is PCM word length in the output file.
They are unrelated axes and live on separate flags so they cannot be confused.

| | 8bit | 16bit |
| --- | --- | --- |
| pitch | quantised to the 11-bit period register | equal temperament |
| envelope | 15 hardware steps | ADSR |
| voices | pulse, pulse, triangle, noise | 4-op FM, detuned saw stacks, drawbars |
| space | mono, dry | stereo, echo send |

A score names instruments from one era; rendering it in the other substitutes
through a table in `core/instruments.js`. That is why one file plays on both.

## Layout

```
core/       dsp, score parser, instruments, renderer, wav   (no I/O, testable)
cli/        the `sound` command, and the preview server
ui/         the previewer page
tracks/     *.snd
fx/         *.fx
test/       22 tests
```

There is exactly one synth. VECTRENCH has three today — the browser player,
the copy vendored into AXI, and an offline mirror whose own first line admits
it "mirrors src/music.js closely enough" — and nothing tests that they agree.
Deleting that arrangement is what this package is for.
