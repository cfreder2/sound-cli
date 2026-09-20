# A spell cast. Rising filtered noise as the charge, then the tone on release.

@fx spell
  desc  A spell being cast
  tags  rpg magic fantasy
@era 8bit
  noise  at=0    dur=0.34 gain=0.10 from=400  to=4000 q=1.6 bed=metal
  tone   at=0    dur=0.34 gain=0.07 wave=pulse12 from=300 to=1200 shape=lin
  tone   at=0.32 dur=0.40 gain=0.14 wave=pulse25 from=1568 to=784 shape=hit
@era 16bit
  noise  at=0    dur=0.38 gain=0.09 from=380  to=5000 q=1.8 bed=white pan=-0.3
  tone   at=0    dur=0.38 gain=0.06 wave=saw from=280 to=1300 shape=lin
  tone   at=0.36 dur=0.55 gain=0.13 wave=tri from=1568 to=740 shape=hit
  tone   at=0.36 dur=0.40 gain=0.05 wave=sine from=3136 to=1480 shape=hit pan=0.35
  echo   send=0.46 time=0.15 fb=0.46
