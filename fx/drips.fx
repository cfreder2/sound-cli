# Four drops at uneven spacing, each at a different pitch.

@fx drips
  desc  Water dripping in a cave, irregular
  tags  water ambience cave loop
@era 8bit
  noise  at=0     dur=0.012 gain=0.09 from=3000 to=1800 q=2.0 bed=long
  tone   at=0.004 dur=0.09  gain=0.12 wave=sine from=760 to=1500 shape=hit
  noise  at=0.71  dur=0.012 gain=0.07 from=2600 to=1500 q=2.0 bed=long
  tone   at=0.714 dur=0.10  gain=0.10 wave=sine from=640 to=1280 shape=hit
  noise  at=1.24  dur=0.012 gain=0.08 from=3400 to=2000 q=2.0 bed=long
  tone   at=1.244 dur=0.08  gain=0.11 wave=sine from=880 to=1700 shape=hit
  noise  at=2.05  dur=0.012 gain=0.06 from=2800 to=1600 q=2.0 bed=long
  tone   at=2.054 dur=0.11  gain=0.09 wave=sine from=700 to=1400 shape=hit
@era 16bit
  tone   at=0.004 dur=0.11 gain=0.11 wave=sine from=720 to=1620 shape=hit pan=-0.3
  noise  at=0     dur=0.010 gain=0.07 from=4000 to=2200 q=2.4 bed=white
  tone   at=0.714 dur=0.12 gain=0.09 wave=sine from=610 to=1370 shape=hit pan=0.35
  noise  at=0.71  dur=0.010 gain=0.05 from=3600 to=2000 q=2.4 bed=white
  tone   at=1.244 dur=0.09 gain=0.10 wave=sine from=860 to=1900 shape=hit pan=0.1
  noise  at=1.24  dur=0.010 gain=0.06 from=4400 to=2400 q=2.4 bed=white
  tone   at=2.054 dur=0.13 gain=0.08 wave=sine from=660 to=1480 shape=hit pan=-0.2
  noise  at=2.05  dur=0.010 gain=0.05 from=3800 to=2100 q=2.4 bed=white
  echo   send=0.44 time=0.22 fb=0.46
