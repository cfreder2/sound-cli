# A pop. 40 ms, rising.

@fx pop
  desc  A bubble-pop for matches and pickups
  tags  puzzle casual ui
@vary pitch=0.15 gain=0.10
@era 8bit
  tone   at=0 dur=0.04 gain=0.14 wave=sine from=520 to=1100 shape=hit
  noise  at=0 dur=0.012 gain=0.05 from=3000 to=1400 q=2.0 bed=long
@era 16bit
  tone   at=0 dur=0.05 gain=0.12 wave=sine from=500 to=1200 shape=hit
  tone   at=0 dur=0.03 gain=0.04 wave=sine from=1000 to=2400 shape=hit pan=0.2
  noise  at=0 dur=0.010 gain=0.04 from=4000 to=1600 q=2.2 bed=white
