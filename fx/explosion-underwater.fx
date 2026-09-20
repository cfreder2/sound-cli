# A charge below the surface. Water passes almost nothing above 700 Hz, so the
# crack is gone and what is left is the pressure pulse and the cavity
# collapsing behind it.
@fx explosion-underwater
  desc  An underwater detonation
  tags  weapon water explosion
@era 8bit
  tone   at=0     dur=0.30 gain=0.20 wave=pulse50 from=200 to=44 shape=hit
  noise  at=0     dur=0.45 gain=0.14 from=700 to=90 q=0.8 bed=long
  noise  at=0.18  dur=0.60 gain=0.08 from=420 to=140 q=1.2 bed=long
  tone   at=0.30  dur=0.18 gain=0.06 wave=sine from=180 to=380 shape=hit
@era 16bit
  tone   at=0     dur=0.40 gain=0.19 wave=sine from=210 to=38 shape=hit
  noise  at=0     dur=0.60 gain=0.13 from=760 to=80 q=0.8 bed=white
  noise  at=0.16  dur=0.85 gain=0.09 from=460 to=130 q=1.3 bed=white pan=0.3
  tone   at=0.30  dur=0.22 gain=0.06 wave=sine from=175 to=400 shape=hit
  tone   at=0.52  dur=0.16 gain=0.04 wave=sine from=260 to=560 shape=hit pan=-0.25
  echo   send=0.40 time=0.19 fb=0.46
