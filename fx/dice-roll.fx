# Dice tumbling and settling. Nine impacts with the spacing widening from 60 ms
# to 240 ms -- dice lose energy, so the gaps grow. Even spacing reads as a
# machine, and accelerating spacing reads as something falling apart.
@fx dice-roll
  desc  Dice rolling and coming to rest
  tags  game tabletop impact
@vary pitch=0.10 gain=0.12
@era 8bit
  noise  at=0     dur=0.018 gain=0.14 from=3400 to=1100 q=2.4 bed=long
  noise  at=0.06  dur=0.016 gain=0.12 from=3000 to=1000 q=2.4 bed=long
  noise  at=0.13  dur=0.018 gain=0.13 from=3800 to=1200 q=2.4 bed=long
  noise  at=0.22  dur=0.016 gain=0.11 from=3200 to=1050 q=2.4 bed=long
  noise  at=0.33  dur=0.018 gain=0.12 from=3600 to=1150 q=2.4 bed=long
  noise  at=0.47  dur=0.016 gain=0.10 from=2900 to=980  q=2.4 bed=long
  noise  at=0.64  dur=0.018 gain=0.09 from=3400 to=1100 q=2.4 bed=long
  noise  at=0.86  dur=0.016 gain=0.07 from=3100 to=1000 q=2.4 bed=long
  noise  at=1.10  dur=0.022 gain=0.06 from=2600 to=900  q=2.2 bed=long
@era 16bit
  noise  at=0     dur=0.020 gain=0.13 from=3800 to=1000 q=2.6 bed=white pan=-0.2
  tone   at=0     dur=0.030 gain=0.05 wave=tri from=620 to=380 shape=hit
  noise  at=0.06  dur=0.018 gain=0.11 from=3400 to=950  q=2.6 bed=white pan=0.25
  noise  at=0.13  dur=0.020 gain=0.12 from=4200 to=1150 q=2.6 bed=white pan=-0.1
  tone   at=0.13  dur=0.030 gain=0.04 wave=tri from=680 to=410 shape=hit
  noise  at=0.22  dur=0.018 gain=0.10 from=3600 to=1000 q=2.6 bed=white pan=0.3
  noise  at=0.33  dur=0.020 gain=0.11 from=4000 to=1100 q=2.6 bed=white pan=-0.25
  noise  at=0.47  dur=0.018 gain=0.09 from=3300 to=930  q=2.6 bed=white pan=0.15
  noise  at=0.64  dur=0.020 gain=0.08 from=3800 to=1050 q=2.6 bed=white pan=-0.15
  noise  at=0.86  dur=0.018 gain=0.06 from=3500 to=960  q=2.6 bed=white pan=0.2
  noise  at=1.10  dur=0.026 gain=0.05 from=2900 to=850  q=2.4 bed=white
  tone   at=1.10  dur=0.040 gain=0.03 wave=tri from=520 to=300 shape=hit
  echo   send=0.20 time=0.07 fb=0.24
