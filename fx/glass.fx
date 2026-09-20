# Glass shattering. A crack, then inharmonic pings scattered over ~250 ms.

@fx glass
  desc  Glass shattering
  tags  impact material
@era 8bit
  noise  at=0     dur=0.03 gain=0.18 from=9000 to=3000 q=1.1 bed=metal
  tone   at=0.02  dur=0.16 gain=0.07 wave=pulse12 from=3140 to=3100 shape=hit
  tone   at=0.06  dur=0.14 gain=0.06 wave=pulse12 from=4712 to=4680 shape=hit
  tone   at=0.11  dur=0.12 gain=0.05 wave=pulse12 from=2637 to=2610 shape=hit
  tone   at=0.17  dur=0.10 gain=0.04 wave=pulse12 from=5300 to=5260 shape=hit
@era 16bit
  noise  at=0     dur=0.03 gain=0.16 from=11000 to=3500 q=1.0 bed=white
  tone   at=0.02  dur=0.40 gain=0.06 wave=sine from=3140 to=3120 shape=hit pan=-0.3
  tone   at=0.06  dur=0.35 gain=0.05 wave=sine from=4712 to=4690 shape=hit pan=0.35
  tone   at=0.11  dur=0.30 gain=0.05 wave=sine from=2637 to=2620 shape=hit pan=0.1
  tone   at=0.17  dur=0.26 gain=0.04 wave=sine from=5300 to=5270 shape=hit pan=-0.15
  tone   at=0.24  dur=0.22 gain=0.03 wave=sine from=6800 to=6760 shape=hit pan=0.4
  echo   send=0.40 time=0.15 fb=0.40
