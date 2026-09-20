# Game over. Four descending tones, the last one held and sour -- a minor sixth
# under the root, which is the classic arcade way of saying no.
@fx gameover
  desc  Game over
  tags  arcade state
@era 8bit
  tone   at=0    dur=0.18 gain=0.13 wave=pulse25 from=523 to=523 shape=flat
  tone   at=0.18 dur=0.18 gain=0.13 wave=pulse25 from=440 to=440 shape=flat
  tone   at=0.36 dur=0.18 gain=0.13 wave=pulse25 from=349 to=349 shape=flat
  tone   at=0.54 dur=0.85 gain=0.14 wave=pulse25 from=262 to=262 shape=exp
  tone   at=0.54 dur=0.85 gain=0.08 wave=pulse50 from=208 to=208 shape=exp
@era 16bit
  tone   at=0    dur=0.19 gain=0.11 wave=saw from=523 to=523 shape=flat
  tone   at=0.18 dur=0.19 gain=0.11 wave=saw from=440 to=440 shape=flat
  tone   at=0.36 dur=0.19 gain=0.11 wave=saw from=349 to=349 shape=flat
  tone   at=0.54 dur=1.20 gain=0.12 wave=saw from=262 to=259 shape=exp pan=-0.2
  tone   at=0.54 dur=1.20 gain=0.07 wave=saw from=208 to=206 shape=exp pan=0.2
  tone   at=0.54 dur=1.30 gain=0.05 wave=sine from=131 to=129 shape=exp
  echo   send=0.40 time=0.20 fb=0.44
