# A dash or dodge. Noise band sweeping up, panned across the stereo field.

@fx dash
  desc  A dash or quick dodge
  tags  movement platformer fighting
@vary pitch=0.07
@era 8bit
  noise  at=0    dur=0.16 gain=0.13 from=500  to=3600 q=1.8 bed=long
  tone   at=0    dur=0.12 gain=0.05 wave=pulse12 from=300 to=900 shape=lin
@era 16bit
  noise  at=0    dur=0.18 gain=0.12 from=450  to=4200 q=2.0 bed=white pan=-0.45
  noise  at=0.05 dur=0.16 gain=0.09 from=900  to=3200 q=2.0 bed=white pan=0.45
  tone   at=0    dur=0.14 gain=0.04 wave=saw from=280 to=980 shape=lin
  echo   send=0.24 time=0.08 fb=0.28
