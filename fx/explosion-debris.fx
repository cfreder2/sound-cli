# The aftermath, without the blast. Seven impacts scattered over a second and a
# half, thinning out and getting quieter. Pairs with any of the others by
# firing it 200 ms later.
@fx explosion-debris
  desc  Debris falling after a blast
  tags  impact material explosion
@vary pitch=0.14 gain=0.15
@era 8bit
  noise  at=0     dur=0.04 gain=0.14 from=2600 to=500 q=1.6 bed=long
  noise  at=0.17  dur=0.03 gain=0.11 from=3400 to=700 q=1.8 bed=metal
  noise  at=0.31  dur=0.04 gain=0.12 from=2000 to=420 q=1.5 bed=long
  noise  at=0.55  dur=0.03 gain=0.09 from=3000 to=600 q=1.8 bed=metal
  noise  at=0.78  dur=0.04 gain=0.08 from=1800 to=380 q=1.5 bed=long
  noise  at=1.06  dur=0.03 gain=0.06 from=2600 to=520 q=1.8 bed=metal
  noise  at=1.34  dur=0.04 gain=0.05 from=1600 to=340 q=1.5 bed=long
@era 16bit
  noise  at=0     dur=0.045 gain=0.13 from=3000 to=460 q=1.8 bed=white pan=-0.3
  tone   at=0     dur=0.06  gain=0.05 wave=sine from=180 to=90 shape=hit
  noise  at=0.17  dur=0.035 gain=0.10 from=3800 to=650 q=2.0 bed=white pan=0.35
  noise  at=0.31  dur=0.045 gain=0.11 from=2300 to=400 q=1.7 bed=white pan=0.1
  tone   at=0.31  dur=0.06  gain=0.04 wave=sine from=160 to=80 shape=hit
  noise  at=0.55  dur=0.035 gain=0.08 from=3400 to=560 q=2.0 bed=white pan=-0.25
  noise  at=0.78  dur=0.045 gain=0.07 from=2000 to=360 q=1.7 bed=white pan=0.3
  noise  at=1.06  dur=0.035 gain=0.05 from=2900 to=480 q=2.0 bed=white pan=-0.15
  noise  at=1.34  dur=0.045 gain=0.04 from=1700 to=320 q=1.7 bed=white pan=0.2
  echo   send=0.26 time=0.13 fb=0.34
