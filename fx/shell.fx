# A shell casing on concrete. Three bounces, each quieter and closer together,
# which is what "bouncing" means as a rhythm.
@fx shell
  desc  A spent casing hitting the floor
  tags  weapon shooter detail
@vary pitch=0.16 gain=0.15
@era 8bit
  noise  at=0    dur=0.02 gain=0.10 from=6000 to=2600 q=2.2 bed=metal
  tone   at=0    dur=0.09 gain=0.08 wave=pulse12 from=2600 to=2540 shape=hit
  tone   at=0.11 dur=0.07 gain=0.05 wave=pulse12 from=2800 to=2740 shape=hit
  tone   at=0.18 dur=0.05 gain=0.03 wave=pulse12 from=3000 to=2940 shape=hit
@era 16bit
  noise  at=0    dur=0.02 gain=0.09 from=7000 to=2800 q=2.4 bed=white
  tone   at=0    dur=0.14 gain=0.07 wave=sine from=2640 to=2600 shape=hit pan=0.2
  tone   at=0    dur=0.10 gain=0.04 wave=sine from=4300 to=4240 shape=hit
  tone   at=0.11 dur=0.10 gain=0.05 wave=sine from=2850 to=2800 shape=hit pan=-0.15
  tone   at=0.18 dur=0.07 gain=0.03 wave=sine from=3050 to=3000 shape=hit pan=0.25
  echo   send=0.34 time=0.09 fb=0.32
