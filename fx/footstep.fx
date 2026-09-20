# Footstep. Almost entirely transient -- a step you can hear ringing is wrong.
@fx footstep
  desc  A single footstep on dirt
  tags  movement material
@vary pitch=0.12 gain=0.15
@era 8bit
  noise  at=0  dur=0.05  gain=0.10 from=1400 to=300 q=1.0 bed=long
  tone   at=0  dur=0.04  gain=0.05 wave=pulse50 from=160 to=110 shape=hit
@era 16bit
  noise  at=0  dur=0.06  gain=0.09 from=1800 to=260 q=1.1 bed=white
  noise  at=0.01 dur=0.04 gain=0.04 from=5000 to=2000 q=1.4 bed=white
  tone   at=0  dur=0.05  gain=0.05 wave=sine from=150 to=95 shape=hit
