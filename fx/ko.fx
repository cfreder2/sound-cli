# A knockout. The impact, then a long ring.

@fx ko
  desc  A knockout blow
  tags  fighting combat
@era 8bit
  noise  at=0    dur=0.04 gain=0.22 from=2600 to=200 q=1.0 bed=long
  tone   at=0    dur=0.16 gain=0.18 wave=pulse50 from=180 to=52 shape=hit
  tone   at=0.05 dur=0.70 gain=0.06 wave=pulse12 from=1400 to=1380 shape=hit
@era 16bit
  noise  at=0    dur=0.05 gain=0.20 from=3200 to=180 q=1.0 bed=white
  tone   at=0    dur=0.22 gain=0.17 wave=sine from=190 to=46 shape=hit
  tone   at=0.04 dur=1.10 gain=0.06 wave=sine from=1420 to=1400 shape=hit pan=-0.3
  tone   at=0.04 dur=0.85 gain=0.04 wave=sine from=2130 to=2100 shape=hit pan=0.3
  echo   send=0.42 time=0.20 fb=0.46
