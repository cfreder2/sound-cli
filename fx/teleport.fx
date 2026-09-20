# Teleporting out. Everything sweeps up and away, then stops.

@fx teleport
  desc  Teleporting out
  tags  scifi magic movement
@era 8bit
  tone   at=0    dur=0.40 gain=0.13 wave=pulse25 from=220 to=3200 shape=lin
  tone   at=0.02 dur=0.38 gain=0.07 wave=pulse12 from=330 to=4600 shape=lin
  noise  at=0    dur=0.42 gain=0.07 from=600 to=6000 q=1.4 bed=metal
@era 16bit
  tone   at=0    dur=0.45 gain=0.12 wave=saw from=200 to=3600 shape=lin pan=-0.3
  tone   at=0.02 dur=0.43 gain=0.06 wave=saw from=300 to=5200 shape=lin pan=0.3
  noise  at=0    dur=0.48 gain=0.06 from=550 to=7000 q=1.5 bed=white
  echo   send=0.46 time=0.14 fb=0.48
