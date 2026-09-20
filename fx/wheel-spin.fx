# A prize wheel. The flapper hitting pegs, eighteen ticks over four seconds
# with the interval widening from 70 ms to 520 ms. The deceleration is the
# whole sound: a constant tick is a clock.
@fx wheel-spin
  desc  A spinning prize wheel slowing to a stop
  tags  game tabletop ui
@era 8bit
  noise  at=0     dur=0.012 gain=0.11 from=4200 to=1400 q=2.6 bed=metal
  noise  at=0.07  dur=0.012 gain=0.11 from=4200 to=1400 q=2.6 bed=metal
  noise  at=0.145 dur=0.012 gain=0.11 from=4000 to=1350 q=2.6 bed=metal
  noise  at=0.225 dur=0.012 gain=0.11 from=4200 to=1400 q=2.6 bed=metal
  noise  at=0.315 dur=0.012 gain=0.11 from=4100 to=1380 q=2.6 bed=metal
  noise  at=0.415 dur=0.012 gain=0.11 from=4200 to=1400 q=2.6 bed=metal
  noise  at=0.53  dur=0.012 gain=0.10 from=4000 to=1350 q=2.6 bed=metal
  noise  at=0.66  dur=0.012 gain=0.10 from=4200 to=1400 q=2.6 bed=metal
  noise  at=0.81  dur=0.012 gain=0.10 from=4100 to=1380 q=2.6 bed=metal
  noise  at=0.99  dur=0.012 gain=0.10 from=4200 to=1400 q=2.6 bed=metal
  noise  at=1.20  dur=0.012 gain=0.09 from=4000 to=1350 q=2.6 bed=metal
  noise  at=1.45  dur=0.012 gain=0.09 from=4200 to=1400 q=2.6 bed=metal
  noise  at=1.75  dur=0.012 gain=0.09 from=4100 to=1380 q=2.6 bed=metal
  noise  at=2.11  dur=0.012 gain=0.08 from=4200 to=1400 q=2.6 bed=metal
  noise  at=2.54  dur=0.012 gain=0.08 from=4000 to=1350 q=2.6 bed=metal
  noise  at=3.02  dur=0.012 gain=0.07 from=4200 to=1400 q=2.6 bed=metal
  noise  at=3.54  dur=0.012 gain=0.07 from=4100 to=1380 q=2.6 bed=metal
  noise  at=4.06  dur=0.016 gain=0.06 from=3600 to=1200 q=2.4 bed=metal
@era 16bit
  noise  at=0     dur=0.012 gain=0.10 from=5000 to=1500 q=2.8 bed=white
  tone   at=0     dur=0.020 gain=0.04 wave=sine from=1800 to=1200 shape=hit
  noise  at=0.07  dur=0.012 gain=0.10 from=5000 to=1500 q=2.8 bed=white pan=0.1
  noise  at=0.145 dur=0.012 gain=0.10 from=4800 to=1450 q=2.8 bed=white pan=-0.1
  noise  at=0.225 dur=0.012 gain=0.10 from=5000 to=1500 q=2.8 bed=white pan=0.1
  noise  at=0.315 dur=0.012 gain=0.10 from=4900 to=1480 q=2.8 bed=white pan=-0.1
  noise  at=0.415 dur=0.012 gain=0.10 from=5000 to=1500 q=2.8 bed=white pan=0.1
  noise  at=0.53  dur=0.012 gain=0.09 from=4800 to=1450 q=2.8 bed=white pan=-0.1
  noise  at=0.66  dur=0.012 gain=0.09 from=5000 to=1500 q=2.8 bed=white pan=0.1
  noise  at=0.81  dur=0.012 gain=0.09 from=4900 to=1480 q=2.8 bed=white pan=-0.1
  noise  at=0.99  dur=0.012 gain=0.09 from=5000 to=1500 q=2.8 bed=white pan=0.1
  noise  at=1.20  dur=0.012 gain=0.08 from=4800 to=1450 q=2.8 bed=white pan=-0.1
  noise  at=1.45  dur=0.012 gain=0.08 from=5000 to=1500 q=2.8 bed=white pan=0.1
  noise  at=1.75  dur=0.012 gain=0.08 from=4900 to=1480 q=2.8 bed=white pan=-0.1
  noise  at=2.11  dur=0.012 gain=0.07 from=5000 to=1500 q=2.8 bed=white pan=0.1
  noise  at=2.54  dur=0.012 gain=0.07 from=4800 to=1450 q=2.8 bed=white pan=-0.1
  noise  at=3.02  dur=0.012 gain=0.06 from=5000 to=1500 q=2.8 bed=white pan=0.1
  noise  at=3.54  dur=0.012 gain=0.06 from=4900 to=1480 q=2.8 bed=white pan=-0.1
  noise  at=4.06  dur=0.018 gain=0.05 from=4200 to=1300 q=2.6 bed=white
  tone   at=4.06  dur=0.030 gain=0.03 wave=sine from=1500 to=900 shape=hit
  echo   send=0.22 time=0.08 fb=0.26
