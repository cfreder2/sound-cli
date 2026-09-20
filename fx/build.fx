# Placing a structure. Wood and stone transient plus a low tone.

@fx build
  desc  Placing a structure
  tags  strategy sim world
@vary pitch=0.07 gain=0.08
@era 8bit
  noise  at=0    dur=0.03 gain=0.14 from=2600 to=700 q=2.0 bed=long
  tone   at=0    dur=0.11 gain=0.12 wave=pulse50 from=300 to=140 shape=hit
  noise  at=0.07 dur=0.14 gain=0.07 from=1400 to=500 q=1.4 bed=long
@era 16bit
  noise  at=0    dur=0.035 gain=0.13 from=3200 to=650 q=2.2 bed=white
  tone   at=0    dur=0.14  gain=0.11 wave=tri from=310 to=130 shape=hit
  tone   at=0    dur=0.20  gain=0.05 wave=sine from=150 to=70 shape=hit
  noise  at=0.07 dur=0.18  gain=0.06 from=1600 to=480 q=1.5 bed=white pan=0.2
  echo   send=0.20 time=0.09 fb=0.26
