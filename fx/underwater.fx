# Submerging. Everything above ~700 Hz is removed.

@fx underwater
  desc  Submerging -- the world goes muffled
  tags  water ambience state
@era 8bit
  noise  at=0     dur=0.50 gain=0.16 from=1800 to=260 q=0.7 bed=long
  tone   at=0     dur=0.45 gain=0.08 wave=sine from=300 to=120 shape=lin
@era 16bit
  noise  at=0     dur=0.60 gain=0.15 from=2400 to=200 q=0.7 bed=white
  tone   at=0     dur=0.55 gain=0.07 wave=sine from=320 to=100 shape=lin
  noise  at=0.15  dur=0.80 gain=0.05 from=500  to=180 q=0.9 bed=white pan=0.3
  echo   send=0.45 time=0.19 fb=0.50
