# A stream of bubbles. Six, rising in pitch overall as they get smaller.
@fx bubbles
  desc  A stream of bubbles underwater
  tags  water underwater loop
@era 8bit
  tone   at=0     dur=0.07 gain=0.11 wave=sine from=300 to=700  shape=hit
  tone   at=0.09  dur=0.06 gain=0.10 wave=sine from=380 to=860  shape=hit
  tone   at=0.155 dur=0.06 gain=0.11 wave=sine from=340 to=790  shape=hit
  tone   at=0.25  dur=0.05 gain=0.09 wave=sine from=470 to=1030 shape=hit
  tone   at=0.32  dur=0.05 gain=0.10 wave=sine from=520 to=1160 shape=hit
  tone   at=0.40  dur=0.04 gain=0.08 wave=sine from=610 to=1340 shape=hit
@era 16bit
  tone   at=0     dur=0.08 gain=0.10 wave=sine from=290 to=690  shape=hit pan=-0.25
  tone   at=0.09  dur=0.07 gain=0.09 wave=sine from=370 to=850  shape=hit pan=0.2
  tone   at=0.155 dur=0.07 gain=0.10 wave=sine from=330 to=780  shape=hit pan=-0.1
  tone   at=0.25  dur=0.06 gain=0.08 wave=sine from=460 to=1020 shape=hit pan=0.3
  tone   at=0.32  dur=0.06 gain=0.09 wave=sine from=510 to=1150 shape=hit pan=-0.2
  tone   at=0.40  dur=0.05 gain=0.07 wave=sine from=600 to=1330 shape=hit pan=0.15
  noise  at=0     dur=0.45 gain=0.02 from=600 to=400 q=0.8 bed=white
  echo   send=0.38 time=0.09 fb=0.40
