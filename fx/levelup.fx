# Levelling up. A full major arpeggio to the octave with a shimmer on top --
# longer than a pickup because it is allowed to interrupt.
@fx levelup
  desc  Level up -- a rising fanfare
  tags  rpg reward
@era 8bit
  tone   at=0    dur=0.09 gain=0.12 wave=pulse25 from=523  to=523  shape=flat
  tone   at=0.09 dur=0.09 gain=0.12 wave=pulse25 from=659  to=659  shape=flat
  tone   at=0.18 dur=0.09 gain=0.12 wave=pulse25 from=784  to=784  shape=flat
  tone   at=0.27 dur=0.09 gain=0.12 wave=pulse25 from=1047 to=1047 shape=flat
  tone   at=0.36 dur=0.55 gain=0.14 wave=pulse25 from=1568 to=1568 shape=exp
  tone   at=0.36 dur=0.55 gain=0.07 wave=pulse12 from=1047 to=1047 shape=exp
@era 16bit
  tone   at=0    dur=0.09 gain=0.10 wave=tri from=523  to=523  shape=flat
  tone   at=0.09 dur=0.09 gain=0.10 wave=tri from=659  to=659  shape=flat
  tone   at=0.18 dur=0.09 gain=0.10 wave=tri from=784  to=784  shape=flat
  tone   at=0.27 dur=0.09 gain=0.10 wave=tri from=1047 to=1047 shape=flat
  tone   at=0.36 dur=0.75 gain=0.12 wave=tri from=1568 to=1568 shape=exp
  tone   at=0.36 dur=0.75 gain=0.06 wave=saw from=1047 to=1047 shape=exp pan=-0.25
  tone   at=0.36 dur=0.60 gain=0.04 wave=sine from=3136 to=3136 shape=exp pan=0.3
  echo   send=0.44 time=0.12 fb=0.44
