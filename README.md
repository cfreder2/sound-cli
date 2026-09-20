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

Both versions are set to the same volume before you hear them. This matters
more than it sounds: louder always wins a blind comparison, even when it is the
worse take, and rendered raw the 16-bit rig lands about 5 dB above the 8-bit one
on the same score. Levelling them means the difference you hear between the two
buttons is the sound of the two machines and nothing else. The layer lanes are
deliberately *not* levelled, because there the point is which voice is louder.

**SHOW LAYERS** renders each voice on its own and stacks them as lanes with
mute and solo. Lanes are drawn at their true level in the mix and are *not*
normalised, so a quiet pad looks quiet — which is the thing worth seeing. The
window steps through the track in bars, so you can watch Canon's second violin
enter at bar 17. Effects have the same thing under *inspect layers*.

**There is no server.** The page loads the scores as text and synthesises them
in the tab, using the same `core/` modules the CLI imports — verified
byte-identical, 0 differing bytes across a 16 MB render. `sound view` only
serves files, and `sound build` writes the same thing as a static folder:

```sh
sound build                # -> site/  (293 KB, no dependencies)
```

Drop `site/` on GitHub Pages, S3 or `python3 -m http.server` and it works.
Rendering happens in a small pool of module workers, so the page never freezes
and both eras of an A/B render at once.

Progress is real, not estimated. The renderer reports how far through it is and
the bar draws that. A cost model built from note counts was tried first and came
out 45% off in the median case, because vibrato makes a held note several times
costlier per sample than a short one and counting notes cannot see that.

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

**Tracks** — five public-domain classical pieces, two imported from the games,
and two originals.

| | |
| --- | --- |
| `prelude-c` | Bach, Prelude No. 1 in C, BWV 846. Bars 1–12. One long arpeggio — the best piece in the book for hearing what a chip arp voice is *for* |
| `fur-elise` | Beethoven, WoO 59, the A section. Right hand as lead, the left hand's rising arpeggio as bass |
| `ode-to-joy` | Beethoven, Symphony 9. Almost all melody and no rhythm, so the A/B is purely timbre |
| `greensleeves` | Traditional, c. 1580. 6/8, both strains |
| `canon-in-d` | Pachelbel. The ground bass, the violin entry, and the canon at one statement's distance — the file to read for what `@section` and `@order` buy |
| `scramble-1-vectrench` | From [VECTRENCH](https://github.com/cfreder2/VECTRENCH), its training-canyon theme. A minor, 150 BPM, 74 bars, nine sections over nineteen order slots |
| `overworld-1-axi` | From [AXI](https://github.com/cfreder2/axi), overworld theme 1. Stored there as MIDI arrays with the bass built at runtime; transcribed here as a score |
| `runner` | Original stage theme, native 8-bit. Sections, fills, sweeps, an arrangement |
| `layers` | **A teaching track.** Four bars, six times, one more voice each pass |

**Effects** — 93, each defining both eras in the same file. The previewer has a
search box (`/` to focus) that filters on name, description and tags.

| | |
| --- | --- |
| water | `splash` `splash-small` `splash-big` `drip` `drips` `bubble` `bubbles` `underwater` `pour` `wave` `swim` `thud-wet` |
| impact | `thud` `thud-heavy` `metal` `wood` `glass` `land` `stomp` |
| weapons | `laser` `machinegun` `shotgun` `reload` `ricochet` `shell` `rocket` |
| explosions | `explosion` `-small` `-huge` `-distant` `-mine` `-barrel` `-plasma` `-underwater` `-chain` `-debris` `-firework` |
| fighting | `punch` `block` `slash` `ko` |
| platformer | `jump` `bounce` `dash` `coin` `checkpoint` `footstep` |
| rpg / magic | `levelup` `spell` `sparkle` `chest` `potion` `heal` `powerup` |
| horror | `heartbeat` `stinger` `creak` `thunder` |
| sci-fi | `teleport` `forcefield` `scan` `powerdown` `robot` `warp` |
| racing | `engine` `skid` `gearshift` `countdown` |
| puzzle / ui | `blip` `select` `pop` `correct` `wrong` `notify` |
| strategy | `build` |
| arcade | `gameover` `extralife` `hurt` `death` |
| ambience | `fire` `wind` `door` `fireworks` `fireworks-finale` |
| animals | `birds` `dog-bark` `cat-meow` `snake-hiss` |
| vehicles | `engine` `skid` `gearshift` `car-horn` `truck-horn` `boat-horn` |
| tabletop | `dice-roll` `wheel-spin` |

The eleven explosions differ by mechanism, not by gain. `-mine` is 79% of its
energy in the first 20 ms with a 0.05 s tail; `-distant` has no transient at
all and 91% of its energy below 200 Hz, because air absorbs high frequencies
over distance; `-underwater` has 0.5% above 2 kHz; `-plasma` is tonal where the
rest are broadband; `-huge` runs 3.65 s. `-debris` is the aftermath on its own,
meant to be fired 200 ms behind any of the others.

`fireworks` is a seven-second display of six shells at three apparent
distances. Distance is modelled, not faked: air absorbs high frequencies, so
the near shells measure 31% above 3 kHz while the far ones measure **0.0%**,
and per-layer `send=` makes the far ones mostly reflection — which is what puts
them *behind* the near ones rather than merely under them.

## Instruments

34: eleven 8-bit, twenty-three 16-bit.

```sh
sound instruments          # the list
sound explain flute        # its layers, spelled out
sound hear flute           # play a phrase on it
```

The Instruments tab plays the same phrase from the same source. The phrase
follows the instrument's role rather than being one generic run, because a
four-note arpeggio says nothing about a flute's attack and a held whole note
says nothing about a marimba's decay: sustained voices get a legato line,
struck voices get a run that exposes each decay, basses get a bass part, kits
get a beat. It lives in `core/probe.js` so the CLI and the page cannot
disagree.

8-bit is close to complete by definition — the 2A03 had two pulse channels,
a triangle and noise, and all three duty cycles are here, plus `noise-lead`
(short-mode noise resampled to track pitch, which is a real melodic voice on
that chip) and `dpcm` (five-bit quantisation, like the DMC channel).

16-bit covers brass (`brass`, `horn`), winds (`flute`, `clarinet`, `oboe`),
voice (`choir`), plucked (`harp`, `guitar`, `pluck`, `epiano`), tuned
percussion (`marimba`, `vibes`, `glock`, `timpani`, `fm-bell`), keys (`piano`,
`organ`), strings, pads and three basses.

Measured harmonic content on a sustained A3 — `clarinet` is a 50% pulse, and a
50% pulse has no even harmonics, which is why its second is 0%:

| | fundamental | 2nd | 3rd | 1–6 kHz |
| --- | --- | --- | --- | --- |
| `flute` | 97% | 3% | 0% | 0% |
| `clarinet` | 86% | **0%** | 6% | 7% |
| `oboe` | 42% | 26% | 14% | 18% |
| `horn` | 27% | **61%** | 10% | 2% |
| `brass` | 41% | 45% | 11% | 4% |
| `slap` | 56% | 4% | 15% | **25%** |

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
