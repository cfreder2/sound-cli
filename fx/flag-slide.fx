# Sliding down a pole. The end of a stage.
#
# Two things at once and both matter: a falling tone, which is the distance,
# and a fast regular ratchet, which is the hands. The tone alone is a slide
# whistle; the ratchet alone is a zip. Together they are somebody coming down
# something.

@fx flag-slide
  desc  Sliding down a pole -- a falling ratchet
  tags  platformer goal axi

@era 8bit
  tone   at=0    dur=0.55 gain=0.09 wave=pulse12 from=1200 to=280 shape=lin
  tone   at=0    dur=0.55 gain=0.05 wave=nestri  from=600  to=140 shape=lin
  noise  at=0    dur=0.03 gain=0.04 from=5000 to=2000 q=1.6 bed=metal
  noise  at=0.07 dur=0.03 gain=0.04 from=4600 to=1800 q=1.6 bed=metal
  noise  at=0.14 dur=0.03 gain=0.04 from=4200 to=1700 q=1.6 bed=metal
  noise  at=0.21 dur=0.03 gain=0.04 from=3800 to=1500 q=1.6 bed=metal
  noise  at=0.28 dur=0.03 gain=0.04 from=3400 to=1400 q=1.6 bed=metal
  noise  at=0.35 dur=0.03 gain=0.04 from=3000 to=1200 q=1.6 bed=metal
  noise  at=0.42 dur=0.03 gain=0.035 from=2700 to=1100 q=1.6 bed=metal
  noise  at=0.49 dur=0.03 gain=0.03 from=2400 to=950 q=1.6 bed=metal

@era 16bit
  tone   at=0    dur=0.58 gain=0.085 wave=saw  from=1240 to=270 shape=lin
  tone   at=0    dur=0.58 gain=0.05  wave=sine from=620  to=135 shape=lin
  noise  at=0    dur=0.03 gain=0.035 from=5200 to=2100 q=1.7 bed=metal
  noise  at=0.07 dur=0.03 gain=0.035 from=4800 to=1900 q=1.7 bed=metal pan=-0.15
  noise  at=0.14 dur=0.03 gain=0.035 from=4400 to=1750 q=1.7 bed=metal pan=0.15
  noise  at=0.21 dur=0.03 gain=0.035 from=3900 to=1550 q=1.7 bed=metal pan=-0.15
  noise  at=0.28 dur=0.03 gain=0.035 from=3500 to=1400 q=1.7 bed=metal pan=0.15
  noise  at=0.35 dur=0.03 gain=0.033 from=3100 to=1250 q=1.7 bed=metal pan=-0.15
  noise  at=0.42 dur=0.03 gain=0.03  from=2750 to=1100 q=1.7 bed=metal pan=0.15
  noise  at=0.49 dur=0.03 gain=0.026 from=2400 to=950  q=1.7 bed=metal
  echo   send=0.10 time=0.09 fb=0.14
