# Liquid poured. Sustained mid noise, filter rising as the vessel empties.

@fx pour
  desc  Liquid being poured
  tags  water item
@era 8bit
  noise  at=0    dur=0.90 gain=0.15 from=900  to=1800 q=1.2 bed=long
  noise  at=0.05 dur=0.80 gain=0.06 from=2600 to=3600 q=1.6 bed=metal
@era 16bit
  noise  at=0    dur=1.05 gain=0.14 from=1000 to=2100 q=1.3 bed=white
  noise  at=0.04 dur=0.95 gain=0.06 from=3000 to=4400 q=1.8 bed=white pan=0.2
  tone   at=0.55 dur=0.12 gain=0.04 wave=sine from=520 to=1100 shape=hit
  tone   at=0.78 dur=0.10 gain=0.04 wave=sine from=600 to=1300 shape=hit pan=-0.2
  echo   send=0.24 time=0.08 fb=0.26
