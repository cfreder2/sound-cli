# Layering, and how to make these sounds better

Everything in this library is a stack of layers summed together. Nothing uses
reverb to sound big or compression to sound loud. It sounds like an instrument
because three or four cheap things play at once, and each one does a job the
others cannot.

Run `sound play layers` first. It is four bars, six times, with one more voice
each pass. Nothing gets louder. By the last pass it sounds like a band.

## The four jobs

Every layer in `core/instruments.js` and every line in a `.fx` file is doing
one of these.

**Pitch.** The layer carrying the note. On its own it is a test tone — which is
exactly what section one of `layers.snd` sounds like, and the reason that
section exists.

**Body.** The same note an octave down, usually on a rounder wave. A 25% pulse
has almost no energy below its fundamental, so it reads as thin no matter how
loud you make it. A triangle underneath puts it back:

```js
lead: layers: [
  { osc: 'pulse', duty: 0.25, gain: 1 },
  { osc: 'nestri', semi: -12, gain: 0.42 },   // <- this line
]
```

That one line is the single largest improvement in the file and it costs one
voice. It is also what VECTRENCH's lead has done since its first version.

**Transient.** Ten to thirty milliseconds of filtered noise at the very front.
The ear locates an event by its first 20 ms, so this layer does far more work
than its gain suggests. It is the pick on a string, the stick on a drum, the
slap of water, the click of a switch. `piano` carries one at `gain: 0.07` and
sounds wrong without it.

**Width.** A detuned copy, or a delayed one. `strings` is three saws at −7, 0
and +7 cents; the beating between them is the entire meaning of the word
"ensemble". At 0 cents it is one saw and no amount of anything else fixes that.
`lead-echo` uses the other kind — a quieter repeat a dotted eighth later, which
is the only depth a single mono pulse channel can have.

## Reading a stack

```sh
sound explain lead          # an instrument's layers, spelled out
sound explain strings
sound fx explain splash     # an effect's layers, line by line
```

In `sound view`, **SHOW LAYERS** on a track puts every voice on its own lane
with a waveform, mute and solo, at its real level in the mix. That is the
fastest way to answer "what is this voice actually contributing" — solo it, then
mute it and listen to the hole it leaves. The second question is usually the
more informative one.

The numbered strip under each effect is the stack. Click **3**
to hear layers 1 through 3; shift-click **3** to hear layer 3 alone, at the
level it actually sits at in the mix — not boosted, because how much a layer
contributes is the thing you are trying to find out.

`splash`, `metal` and `laser` are the instructive ones.

## Diagnosing a sound that is not working

| It sounds | The missing layer is | Try |
| --- | --- | --- |
| thin, buzzy, small | body | an octave down on a rounder wave at 30–45% gain |
| soft, vague, late | transient | 10–30 ms of band-passed noise at `at=0` |
| flat, synthetic, static | width | a second copy at ±5–9 cents, or a delayed one |
| harsh, fatiguing | nothing — too much | a `cut` low-pass, or drop a high layer's gain |
| muddy in a full mix | nothing — collision | move a layer an octave, or pan the two apart |
| scratchy, farty, rattling on small speakers | nothing — **subsonic** | see below |
| like a machine gun of clones | variation | `@vary pitch=0.06 gain=0.06` |

## The sub-bass trap

A sine an octave under the fundamental is a good way to add weight, and a
terrible one the moment the part is already written low. `fm-bass` shipped with
a `semi: -12` layer; under Canon in D's D2 bass that lands on **36.7 Hz**, and
45% of the bass voice's energy ended up below 45 Hz.

Nothing reproduces that. Laptop, phone, tablet and TV speakers all roll off
somewhere above it, so what you hear is not a low note — it is cone excursion,
which reads as a scratch or a rattle. It is expensive too: the limiter pulls the
whole audible mix down to make room for a note nobody can hear.

Two defences, both now in place:

- **A master high-pass at 40 Hz, 24 dB/oct**, in `renderTrack`. Standard game-audio
  practice. It makes the mix louder and cleaner at once.
- **Don't write one.** `oct=-1` on a voice already in octave 2 is the usual way
  it happens. `greensleeves` and `prelude-c` both had it, and both dropped notes
  to 36–41 Hz.

To check a track: render it and measure the energy below 45 Hz relative to the
whole mix. Under about −25 dB is fine.

## Material: what actually distinguishes metal from wood

The two effects named for them exist to make this concrete, because it is the
most useful single fact in sound design.

**Metal is inharmonic and long.** A bar, a pipe, a bell and a sword ring at
ratios that are not whole numbers — roughly 1 : 2.76 : 5.40 for a struck bar,
which is what `metal.fx` uses. Stack harmonic partials (1 : 2 : 3) instead and
you get an organ, every time.

**Wood is harmonic and almost entirely transient.** A woodblock is 20 ms of
band-passed noise and a tone that is gone in a tenth of a second. If it rings,
it reads as metal. If the tone is too low, it reads as a drum.

Water (`splash`) is neither: it is broadband noise whose filter *moves*, and
it is two events — the body going in, and the spray coming back down. One
event sounds like a snare.

## What changes between the eras

The eras are console generations, not audio word length. `8bit` is the NES
2A03; `16bit` is the SNES/Genesis class. A score names instruments from one
era and rendering it in the other substitutes them through the table in
`core/instruments.js`, which is why one file plays on both.

| | 8bit | 16bit |
| --- | --- | --- |
| pitch | quantised to the 11-bit period register — sharp near the top, and that sourness is kept on purpose | equal temperament |
| envelope | counted down in 15 steps; on a short note you hear the stairs | ADSR |
| voices | pulse, pulse, triangle, noise | 4-operator FM, detuned saw stacks, additive drawbars |
| space | mono, bone dry | stereo, with an echo send |
| kick | crushed to 4 bits, because it was a tiny sample ROM | full range, with a 52 Hz sub layer |
| snare | noise alone | noise **plus a tuned tone** — that tone is the crack, and without it a snare is a hiss |

Neither is better. Run `runner` both ways: the FM lead is fatter and the kit is
wider, but the 12.5% pulse has a nasal bite nothing in the 16-bit set
reproduces, and the dry mix lets the sixteenths articulate in a way the echo
send blurs.

## Why both versions are set to the same volume

Louder always wins. Play anyone two versions of anything and they pick the
louder one, even when it is worse, and even when they know the effect exists.

Rendered raw, the two eras are not equally loud: 16-bit lands about 5 dB above
8-bit on the same score, averaged across the ten tracks here. Left alone, you
would pick 16-bit every time regardless of what it sounded like. So both are
levelled before playback — tracks to the same average level, effects to the same
peak — and nothing else about them is touched.

The layer lanes are deliberately **not** levelled. There the whole question is
which voice is carrying the mix, so a pad at `mix=0.04` has to look and sound
like a pad at `mix=0.04`.

## Adding an instrument

`core/instruments.js` is data. Add an entry, declare its layers, and it is
immediately available to every score, both renderers and the previewer:

```js
'fm-organ': {
  era: '16bit',
  env: { a: 0.01, d: 0.05, s: 0.95, r: 0.06 },
  desc: 'What it is, in one line -- this shows up in `sound instruments`.',
  layers: [
    { osc: 'sine', gain: 0.6 },
    { osc: 'sine', semi: 12, gain: 0.35 },
  ],
},
```

Then add it to `SUBSTITUTE` in both directions, or `sound check` will let a
score name something that has no equivalent on the other rig.
