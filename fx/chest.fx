# A chest opening: hinge, lid stopping, then a two-note reward.

@fx chest
  desc  A treasure chest opening
  tags  rpg reward world
@era 8bit
  noise  at=0    dur=0.34 gain=0.08 from=900 to=1900 q=2.4 bed=metal
  noise  at=0.36 dur=0.05 gain=0.13 from=2400 to=500 q=1.5 bed=metal
  tone   at=0.44 dur=0.10 gain=0.11 wave=pulse25 from=784  to=784  shape=flat
  tone   at=0.54 dur=0.40 gain=0.12 wave=pulse25 from=1175 to=1175 shape=exp
@era 16bit
  noise  at=0    dur=0.38 gain=0.07 from=800  to=2100 q=2.6 bed=white pan=-0.2
  noise  at=0.40 dur=0.06 gain=0.12 from=2800 to=480 q=1.6 bed=white
  tone   at=0.40 dur=0.14 gain=0.05 wave=sine from=280 to=150 shape=hit
  tone   at=0.48 dur=0.11 gain=0.10 wave=tri from=784  to=784  shape=exp
  tone   at=0.58 dur=0.55 gain=0.11 wave=tri from=1175 to=1175 shape=exp
  echo   send=0.40 time=0.13 fb=0.42
