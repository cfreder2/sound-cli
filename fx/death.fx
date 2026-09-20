# Defeat. A long descending slide of about one and a half octaves.

@fx death
  desc  Defeat -- a long descending slide
  tags  state
@era 8bit
  tone   at=0     dur=0.70 gain=0.15 wave=pulse25 from=740 to=90 shape=lin
  tone   at=0.02  dur=0.68 gain=0.07 wave=pulse12 from=370 to=45 shape=lin
  noise  at=0.55  dur=0.22 gain=0.08 from=1800 to=200 q=0.9 bed=long
@era 16bit
  tone   at=0     dur=0.85 gain=0.12 wave=saw  from=740 to=80 shape=lin
  tone   at=0.02  dur=0.83 gain=0.06 wave=saw  from=370 to=40 shape=lin pan=-0.2
  tone   at=0     dur=0.90 gain=0.05 wave=sine from=185 to=30 shape=lin
  noise  at=0.65  dur=0.35 gain=0.08 from=2000 to=150 q=0.9 bed=white
  echo   send=0.38 time=0.20 fb=0.45
