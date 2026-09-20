# One bubble rising and popping. Almost a pure tone.

@fx bubble
  desc  A single bubble rising and popping
  tags  water underwater
@vary pitch=0.20 gain=0.12
@era 8bit
  tone   at=0 dur=0.07 gain=0.13 wave=sine from=420 to=980 shape=hit
@era 16bit
  tone   at=0 dur=0.085 gain=0.12 wave=sine from=400 to=1040 shape=hit
  tone   at=0 dur=0.05  gain=0.03 wave=sine from=800 to=2080 shape=hit pan=0.2
  echo   send=0.30 time=0.06 fb=0.28
