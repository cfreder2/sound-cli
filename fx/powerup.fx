# Power-up. An arpeggio climbing a major triad, then the octave.
@fx powerup
  desc  Power-up -- a rising major arpeggio
  tags  pickup reward
@era 8bit
  tone   at=0     dur=0.06 gain=0.13 wave=pulse25 from=523  to=523  shape=flat
  tone   at=0.06  dur=0.06 gain=0.13 wave=pulse25 from=659  to=659  shape=flat
  tone   at=0.12  dur=0.06 gain=0.13 wave=pulse25 from=784  to=784  shape=flat
  tone   at=0.18  dur=0.30 gain=0.14 wave=pulse25 from=1047 to=1047 shape=exp
@era 16bit
  tone   at=0     dur=0.06 gain=0.10 wave=tri  from=523  to=523  shape=flat
  tone   at=0.06  dur=0.06 gain=0.10 wave=tri  from=659  to=659  shape=flat
  tone   at=0.12  dur=0.06 gain=0.10 wave=tri  from=784  to=784  shape=flat
  tone   at=0.18  dur=0.40 gain=0.11 wave=tri  from=1047 to=1047 shape=exp
  tone   at=0.18  dur=0.40 gain=0.05 wave=saw  from=1047 to=1047 shape=exp pan=0.3
  echo   send=0.34 time=0.10 fb=0.38
