# Extra life. Five rising tones resolving upward.

@fx extralife
  desc  An extra life
  tags  arcade reward
@era 8bit
  tone   at=0    dur=0.07 gain=0.12 wave=pulse25 from=784  to=784  shape=flat
  tone   at=0.07 dur=0.07 gain=0.12 wave=pulse25 from=1047 to=1047 shape=flat
  tone   at=0.14 dur=0.07 gain=0.12 wave=pulse25 from=1319 to=1319 shape=flat
  tone   at=0.21 dur=0.07 gain=0.12 wave=pulse25 from=1568 to=1568 shape=flat
  tone   at=0.28 dur=0.30 gain=0.13 wave=pulse25 from=2093 to=2093 shape=exp
@era 16bit
  tone   at=0    dur=0.07 gain=0.10 wave=tri from=784  to=784  shape=flat
  tone   at=0.07 dur=0.07 gain=0.10 wave=tri from=1047 to=1047 shape=flat
  tone   at=0.14 dur=0.07 gain=0.10 wave=tri from=1319 to=1319 shape=flat
  tone   at=0.21 dur=0.07 gain=0.10 wave=tri from=1568 to=1568 shape=flat
  tone   at=0.28 dur=0.42 gain=0.11 wave=tri from=2093 to=2093 shape=exp
  tone   at=0.28 dur=0.36 gain=0.04 wave=sine from=3136 to=3136 shape=exp pan=0.3
  echo   send=0.38 time=0.09 fb=0.38
