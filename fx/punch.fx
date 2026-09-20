# A punch landing. Short, low-mid, entirely transient.

@fx punch
  desc  A punch landing
  tags  fighting combat impact
@vary pitch=0.10 gain=0.12
@era 8bit
  noise  at=0 dur=0.035 gain=0.18 from=1600 to=260 q=1.1 bed=long
  tone   at=0 dur=0.07  gain=0.13 wave=pulse50 from=220 to=80 shape=hit
@era 16bit
  noise  at=0 dur=0.04 gain=0.17 from=2000 to=240 q=1.2 bed=white
  tone   at=0 dur=0.09 gain=0.12 wave=sine from=230 to=70 shape=hit
  tone   at=0 dur=0.14 gain=0.05 wave=sine from=110 to=50 shape=hit
