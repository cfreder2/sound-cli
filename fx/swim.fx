# One swimming stroke: the pull through, then the hand breaking the surface.

@fx swim
  desc  A swimming stroke
  tags  water movement
@vary pitch=0.08 gain=0.12
@era 8bit
  noise  at=0    dur=0.26 gain=0.13 from=600  to=200 q=0.9 bed=long
  noise  at=0.20 dur=0.14 gain=0.10 from=2400 to=700 q=1.4 bed=metal
@era 16bit
  noise  at=0    dur=0.30 gain=0.12 from=700  to=180 q=1.0 bed=white pan=-0.2
  noise  at=0.19 dur=0.20 gain=0.10 from=3200 to=800 q=1.6 bed=white pan=0.25
  tone   at=0.20 dur=0.08 gain=0.03 wave=sine from=480 to=900 shape=hit
  echo   send=0.22 time=0.09 fb=0.30
