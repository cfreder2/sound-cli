# A bullet glancing off stone. Fast downward sweep, heavy echo.

@fx ricochet
  desc  A bullet glancing off stone
  tags  weapon shooter impact
@vary pitch=0.18 gain=0.10
@era 8bit
  noise  at=0     dur=0.02 gain=0.15 from=8000 to=3000 q=1.6 bed=metal
  tone   at=0.004 dur=0.22 gain=0.13 wave=pulse12 from=4200 to=700 shape=hit
@era 16bit
  noise  at=0     dur=0.02 gain=0.13 from=9000 to=3200 q=1.7 bed=white
  tone   at=0.003 dur=0.26 gain=0.12 wave=saw from=4600 to=620 shape=hit pan=-0.2
  tone   at=0.003 dur=0.18 gain=0.05 wave=sine from=2300 to=310 shape=hit pan=0.3
  echo   send=0.48 time=0.13 fb=0.46
