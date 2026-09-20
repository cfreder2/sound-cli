# Shifting gear. Mechanical clunk, then the engine in the new ratio.

@fx gearshift
  desc  Shifting gear
  tags  racing vehicle mechanical
@era 8bit
  noise  at=0    dur=0.04 gain=0.14 from=2600 to=600 q=1.8 bed=metal
  tone   at=0    dur=0.06 gain=0.08 wave=pulse50 from=260 to=150 shape=hit
  tone   at=0.06 dur=0.40 gain=0.10 wave=pulse25 from=110 to=190 shape=flat
@era 16bit
  noise  at=0    dur=0.045 gain=0.13 from=3000 to=560 q=2.0 bed=white
  tone   at=0    dur=0.07  gain=0.07 wave=tri from=270 to=140 shape=hit
  tone   at=0.06 dur=0.48  gain=0.09 wave=saw from=108 to=195 shape=flat pan=-0.2
  tone   at=0.06 dur=0.48  gain=0.08 wave=saw from=111 to=201 shape=flat pan=0.2
  echo   send=0.18 time=0.08 fb=0.24
