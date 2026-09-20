# Menu move. A 25 ms tick.

@fx blip
  desc  Menu move -- a 25 ms tick
  tags  ui
@vary pitch=0.03
@era 8bit
  tone   at=0  dur=0.025 gain=0.13 wave=pulse50 from=1200 to=1200 shape=flat
@era 16bit
  tone   at=0  dur=0.028 gain=0.10 wave=tri  from=1200 to=1200 shape=exp
  tone   at=0  dur=0.028 gain=0.03 wave=sine from=2400 to=2400 shape=exp
