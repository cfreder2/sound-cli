# Landing from a jump. Shorter and brighter than a thud -- boots, not a body.
@fx land
  desc  Landing after a jump
  tags  movement platformer
@vary pitch=0.10 gain=0.12
@era 8bit
  noise  at=0 dur=0.06 gain=0.13 from=1800 to=400 q=1.1 bed=long
  tone   at=0 dur=0.06 gain=0.09 wave=pulse50 from=200 to=110 shape=hit
@era 16bit
  noise  at=0 dur=0.07 gain=0.12 from=2400 to=380 q=1.2 bed=white
  tone   at=0 dur=0.08 gain=0.08 wave=sine from=210 to=100 shape=hit
  noise  at=0.012 dur=0.05 gain=0.04 from=6000 to=2400 q=1.5 bed=white pan=0.2
