# A wet impact. The thud with water's moving filter on top -- half of `thud`,
# half of `splash`, which is exactly what it is.
@fx thud-wet
  desc  A wet heavy impact -- mud, flesh, something landing in shallow water
  tags  impact water body
@vary pitch=0.09 gain=0.12
@era 8bit
  noise  at=0     dur=0.14 gain=0.16 from=1600 to=220 q=1.0 bed=long
  tone   at=0     dur=0.09 gain=0.13 wave=pulse50 from=130 to=58 shape=hit
  noise  at=0.05  dur=0.16 gain=0.07 from=3000 to=900 q=1.5 bed=metal
@era 16bit
  noise  at=0     dur=0.17 gain=0.15 from=2000 to=200 q=1.1 bed=white
  tone   at=0     dur=0.12 gain=0.12 wave=sine from=135 to=52 shape=hit
  noise  at=0.04  dur=0.26 gain=0.08 from=4000 to=1000 q=1.7 bed=white pan=0.25
  echo   send=0.20 time=0.07 fb=0.26
