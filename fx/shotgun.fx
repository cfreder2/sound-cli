# A shotgun blast. Broad, low and short; almost none of it is tonal.

@fx shotgun
  desc  A shotgun blast
  tags  weapon gun shooter
@vary pitch=0.05 gain=0.07
@era 8bit
  noise  at=0     dur=0.015 gain=0.22 from=9000 to=3000 q=0.9 bed=metal
  noise  at=0     dur=0.24  gain=0.22 from=2400 to=140  q=0.7 bed=long
  tone   at=0     dur=0.14  gain=0.10 wave=pulse50 from=150 to=48 shape=hit
@era 16bit
  noise  at=0     dur=0.016 gain=0.20 from=11000 to=3400 q=0.9 bed=white
  noise  at=0     dur=0.32  gain=0.21 from=2800  to=120  q=0.7 bed=white
  noise  at=0.04  dur=0.38  gain=0.09 from=1200  to=200  q=0.9 bed=white pan=0.3
  tone   at=0     dur=0.20  gain=0.11 wave=sine from=160 to=40 shape=hit
  echo   send=0.28 time=0.14 fb=0.36
