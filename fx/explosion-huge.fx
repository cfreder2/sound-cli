# A very large detonation. Same three stages as `explosion` but stretched: the
# body takes 1.5 s to fall through the filter and the rumble runs to three
# seconds. Scale in sound design is mostly duration, not level.
@fx explosion-huge
  desc  A very large detonation
  tags  weapon impact explosion
@era 8bit
  noise  at=0     dur=0.018 gain=0.22 from=9000 to=2600 q=0.9 bed=metal
  noise  at=0     dur=1.50  gain=0.22 from=2600 to=60  q=0.6 bed=long
  tone   at=0     dur=0.90  gain=0.14 wave=pulse50 from=140 to=28 shape=hit
  noise  at=0.40  dur=2.20  gain=0.10 from=300  to=50  q=0.8 bed=long
@era 16bit
  noise  at=0     dur=0.020 gain=0.20 from=12000 to=3000 q=0.9 bed=white
  noise  at=0     dur=1.90  gain=0.21 from=3000  to=48  q=0.6 bed=white
  tone   at=0     dur=1.20  gain=0.15 wave=sine from=145 to=24 shape=hit
  noise  at=0.35  dur=2.80  gain=0.11 from=340   to=42  q=0.8 bed=white pan=0.4
  noise  at=0.60  dur=2.50  gain=0.09 from=260   to=38  q=0.8 bed=white pan=-0.4
  tone   at=0.10  dur=2.60  gain=0.05 wave=sine from=44 to=22 shape=exp
  echo   send=0.46 time=0.34 fb=0.52
