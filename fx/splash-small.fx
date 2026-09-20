# A small object hitting water. Same shape as splash, an octave up and a third
# as long.

@fx splash-small
  desc  A small object hitting water
  tags  water impact
@vary pitch=0.10 gain=0.10
@era 8bit
  noise  at=0     dur=0.09 gain=0.18 from=2200 to=420 q=1.0 bed=long
  noise  at=0.03  dur=0.12 gain=0.08 from=4200 to=1400 q=1.5 bed=metal
@era 16bit
  noise  at=0     dur=0.11 gain=0.17 from=3000 to=480 q=1.1 bed=white
  noise  at=0.025 dur=0.20 gain=0.09 from=5600 to=1600 q=1.8 bed=white pan=0.25
  tone   at=0.006 dur=0.07 gain=0.05 wave=sine from=620 to=1180 shape=hit
  echo   send=0.26 time=0.07 fb=0.30
