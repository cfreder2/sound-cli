# An engine burst. Two detuned saws beating against each other is the whole
# sound of a motor; the beat rate IS the roughness.
@fx engine
  desc  An engine revving
  tags  vehicle
@era 8bit
  tone   at=0  dur=0.60 gain=0.11 wave=pulse25 from=84  to=150 shape=flat
  tone   at=0  dur=0.60 gain=0.09 wave=pulse50 from=86  to=153 shape=flat
  noise  at=0  dur=0.60 gain=0.05 from=600 to=1600 q=0.9 bed=long
@era 16bit
  tone   at=0  dur=0.70 gain=0.10 wave=saw from=84  to=155 shape=flat
  tone   at=0  dur=0.70 gain=0.09 wave=saw from=86.2 to=159 shape=flat pan=0.25
  tone   at=0  dur=0.70 gain=0.07 wave=saw from=82.1 to=151 shape=flat pan=-0.25
  noise  at=0  dur=0.70 gain=0.05 from=700 to=2000 q=0.9 bed=white
  echo   send=0.18 time=0.09 fb=0.25
