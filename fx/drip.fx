# A single water drop.
#
# The most counter-intuitive sound in the library: a drip is a RISING pitch,
# not a falling one. The cavity left behind by the drop shrinks as it closes,
# and a shrinking resonator goes UP. Sweep it down and it stops sounding like
# water at all -- it sounds like a bubble popping the wrong way round.
@fx drip
  desc  One drop of water landing
  tags  water ambience cave
@vary pitch=0.14 gain=0.12
@era 8bit
  noise  at=0     dur=0.012 gain=0.10 from=3000 to=1800 q=2.0 bed=long
  tone   at=0.004 dur=0.09  gain=0.13 wave=sine from=760 to=1500 shape=hit
@era 16bit
  noise  at=0     dur=0.010 gain=0.08 from=4000 to=2200 q=2.4 bed=white filter=bandpass
  tone   at=0.003 dur=0.11  gain=0.12 wave=sine from=720 to=1620 shape=hit
  tone   at=0.003 dur=0.07  gain=0.03 wave=sine from=1440 to=3240 shape=hit pan=0.2
  echo   send=0.35 time=0.12 fb=0.34
