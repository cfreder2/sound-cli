# Systems shutting down. Pitch and filter fall together, decelerating.

@fx powerdown
  desc  Systems shutting down
  tags  scifi state
@era 8bit
  tone   at=0 dur=1.00 gain=0.13 wave=pulse25 from=880 to=60 shape=lin curve=exp
  tone   at=0 dur=1.00 gain=0.07 wave=pulse50 from=440 to=30 shape=lin curve=exp
  noise  at=0 dur=1.00 gain=0.05 from=3000 to=200 q=1.0 bed=long
@era 16bit
  tone   at=0 dur=1.25 gain=0.12 wave=saw from=880 to=55 shape=lin curve=exp pan=-0.2
  tone   at=0 dur=1.25 gain=0.06 wave=saw from=440 to=48 shape=lin curve=exp pan=0.2
  tone   at=0 dur=1.30 gain=0.05 wave=sine from=220 to=42 shape=lin curve=exp
  noise  at=0 dur=1.25 gain=0.05 from=3400 to=160 q=1.0 bed=white
  echo   send=0.34 time=0.18 fb=0.42
