# A heavy door. Low noise sliding, then the latch.
@fx door
  desc  A heavy door opening and latching
  tags  world
@era 8bit
  noise  at=0     dur=0.45 gain=0.10 from=320  to=180 q=1.6 bed=long
  tone   at=0     dur=0.40 gain=0.05 wave=pulse50 from=90 to=72 shape=flat
  noise  at=0.46  dur=0.05 gain=0.13 from=2600 to=700 q=1.4 bed=metal
@era 16bit
  noise  at=0     dur=0.55 gain=0.09 from=360  to=150 q=1.7 bed=white
  tone   at=0     dur=0.50 gain=0.05 wave=saw  from=88 to=64 shape=flat
  noise  at=0.56  dur=0.06 gain=0.12 from=3000 to=600 q=1.5 bed=white
  tone   at=0.56  dur=0.25 gain=0.05 wave=sine from=420 to=405 shape=hit
  echo   send=0.30 time=0.16 fb=0.35
