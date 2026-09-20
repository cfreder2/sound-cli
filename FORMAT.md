# The score format

A track is one plain text file, `tracks/<name>.snd`. An effect is one plain
text file, `fx/<name>.fx`. Nothing is generated, nothing is binary, and
nothing is stored anywhere else.

That is a deliberate constraint, not a default. Music has to be reviewable the
way code is: one track is one file, one bar is one line, one step is a column.
A diff shows which bar moved and which note changed; `git blame` says who wrote
the chorus; a merge conflict is confined to the bars two people both edited.
A JSON array of `{pitch, start, duration}` objects carries exactly the same
information and is useless in every one of those situations.

```
# Comments run to end of line, and a block of them at the top of a file is
# where the piece explains itself.

@track runner
  name   RUNNER
  bpm    150
  beats  16          steps per bar -- the width of the matrix
  era    8bit        8bit | 16bit
  swing  0           0 is a grid, 0.2 is a shuffle
  loop   1           where a repeat returns to, counted in @order slots
  tags   game action

@voice lead inst=lead mix=0.20 pan=-0.1 oct=0 echo=0
  d5  .   a4  .   d5  f5  e5  d5  a4  .   .   .   d5  .   .   .
  c5  .   g4  .   c5  e5  d5  c5  g4  .   .   .   bb4 .   .   .
```

Every line under a `@voice` is one bar. Tokens are separated by whitespace and
extra spaces are free, so group them into beats and the grid becomes visible.

## Tokens

| Token | Means |
| --- | --- |
| `a4` `c#5` `eb3` `bb2` | a note. `#` sharp, `b` flat; `b4` is B natural and `bb4` is B flat |
| `.` | hold the previous note one more step |
| `-` | rest, and cut anything holding |
| `a4/` | sweep up from this note, stepped the way the hardware's sweep unit stepped |
| `a4\` | sweep down |
| `a4~` | vibrato, arriving late the way a player would |
| `a4!` | accent, ~35% louder |

Suffixes stack: `a4~!` is an accented note with vibrato.

**Drum voices** (`inst=kit` or `kit16`) use one letter per hit instead of a
pitch: `k` kick, `s` snare, `h` hat, `x` open/hard, `m` metallic, `c` crash,
`t` tom.

**Chord voices** (`inst=arp`) take a chord name per step: `am`, `f`, `g7`,
`bm`, `f#m`, `c#7`. One voice cycles the chord tones fast enough that the ear
hears a chord — the technique the NES was built around, and the reason a
four-voice chip could play harmony at all.

## Voice options

| Key | Default | What it does |
| --- | --- | --- |
| `inst` | `pulse25` | the instrument. `sound instruments` lists them |
| `mix` | `0.15` | this voice's level before the master |
| `pan` | `0` | −1 hard left to 1 hard right. 8-bit ignores it; the 2A03 was mono |
| `oct` | `0` | transpose by whole octaves, so a part can be written where it reads best |
| `echo` | era default | send to the echo bus. 8-bit has no bus |

## Sections and @order

```
@section intro
@voice lead inst=lead mix=0.2
  ...
@section A
@voice lead inst=lead mix=0.2
  ...
@order intro A A B A
```

A track written as one list of bars is a **loop**, and a loop short enough to
write by hand is short enough to wear out inside one playthrough. Twenty
written bars arranged over seventy is how the stage themes worth stealing from
were actually built.

`@order` names sections in the order they play. `loop N` says which order slot
a repeat returns to — counted in slots because "after the intro" is something
an author knows and "after bar four" is something they have to work out again
every time the intro changes length.

A section that leaves a voice out gets **silence** for it, not the previous
section's part, so dropping the counter-melody for eight bars is something a
score can simply do.

`tracks/canon-in-d.snd` is the file to read for this: the eight-bar ground
appears once and is ordered three times. Written out longhand it would be 24
bars of duplicated text that drift apart under editing.

## Effects

```
@fx laser
  desc  A single energy shot
  tags  weapon scifi

@vary pitch=0.08 gain=0.06

@era 8bit
  tone   at=0      dur=0.16  gain=0.15  wave=pulse25  from=1800 to=240 shape=hit
  tone   at=0.004  dur=0.16  gain=0.07  wave=pulse12  from=900  to=120 shape=hit
  noise  at=0      dur=0.05  gain=0.07  from=6000 to=1400 q=1.2 bed=metal

@era 16bit
  ...
  echo   send=0.30 time=0.11 fb=0.34
```

One line is one layer, and reading top to bottom tells you how the sound is
built. Three layer types:

- **`tone`** — `wave` (`sine` `tri` `nestri` `saw` `square` `pulse12` `pulse25`
  `pulse50`), `from`/`to` for a pitch sweep, `dur`, `gain`, `at`, `pan`,
  `shape` (`exp` `lin` `flat` `hit`), `curve` (`exp` `lin`), `crush` (bit depth).
- **`noise`** — `bed` (`long` the shift register, `metal` its short mode,
  `white`), `from`/`to` sweeping the filter rather than the pitch, `filter`
  (`lowpass` `highpass` `bandpass`), `q`, and the same timing keys.
- **`echo`** — not a layer; configures the send bus. `send`, `time`, `fb`, `damp`.
  Ignored on 8-bit, which is dry.

`@vary` randomises pitch and gain per fire, which every effect triggered more
than twice a second needs or it sounds like a machine.

Both `@era` blocks live in the same file on purpose. The alternative is two
files that drift, and the whole point is being able to switch.

## What is NOT in the file

Rendered audio. The renderer is deterministic — the same score produces the
same samples every time — so a WAV is build output and `audio/` is gitignored.
`sound render` reproduces any of it on demand.

## Rendering it

```sh
sound check --all                 # the gate, before anything else
sound play runner --era 16bit     # hear it here
sound render runner --both        # 8-bit and 16-bit, side by side, to ./audio
sound render --all --format mp3 --depth 24
sound view                        # the browser previewer
```

`--depth 16|24|32` is PCM word length and is the *only* sense in which this
library has a bit depth. `--era 8bit|16bit` is a console generation. They are
unrelated axes and the CLI keeps them on separate flags so they cannot be
confused.
