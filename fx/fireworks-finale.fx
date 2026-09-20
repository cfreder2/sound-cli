# A finale: eleven bursts in four seconds, no launch whistles.
#
# The shape is a crescendo and then a single large burst. Spacing tightens from
# about 500 ms to 150 ms and the last one lands alone after a short gap -- the
# gap is what makes it land, and without it a barrage just stops.
@fx fireworks-finale
  desc  A fireworks finale -- a barrage, then one big burst
  tags  ambience explosion celebration
@era 8bit
  noise  at=0     dur=0.40 gain=0.13 from=2200 to=190 q=0.7 bed=long
  noise  at=0     dur=0.01 gain=0.11 from=8000 to=2600 q=1.0 bed=metal
  noise  at=0.48  dur=0.44 gain=0.14 from=2000 to=170 q=0.7 bed=long
  noise  at=0.48  dur=0.01 gain=0.12 from=7400 to=2400 q=1.0 bed=metal
  noise  at=0.88  dur=0.42 gain=0.14 from=2400 to=200 q=0.7 bed=long
  noise  at=1.22  dur=0.40 gain=0.15 from=2100 to=180 q=0.7 bed=long
  noise  at=1.22  dur=0.01 gain=0.12 from=8600 to=2800 q=1.0 bed=metal
  noise  at=1.53  dur=0.38 gain=0.15 from=2300 to=195 q=0.7 bed=long
  noise  at=1.80  dur=0.36 gain=0.16 from=2000 to=175 q=0.7 bed=long
  noise  at=2.04  dur=0.34 gain=0.16 from=2500 to=210 q=0.7 bed=long
  noise  at=2.04  dur=0.01 gain=0.13 from=9000 to=2900 q=1.0 bed=metal
  noise  at=2.24  dur=0.32 gain=0.17 from=2200 to=185 q=0.7 bed=long
  noise  at=2.40  dur=0.30 gain=0.17 from=2600 to=215 q=0.7 bed=long
  noise  at=2.55  dur=0.28 gain=0.18 from=2300 to=190 q=0.7 bed=long
  noise  at=3.10  dur=0.018 gain=0.22 from=9500 to=2800 q=1.0 bed=metal
  noise  at=3.10  dur=0.95  gain=0.21 from=3000 to=110  q=0.6 bed=long
  tone   at=3.10  dur=0.50  gain=0.11 wave=pulse50 from=150 to=36 shape=hit
  noise  at=3.34  dur=0.02  gain=0.09 from=5200 to=1650 q=2.2 bed=metal
  noise  at=3.55  dur=0.02  gain=0.07 from=4400 to=1400 q=2.2 bed=metal
  noise  at=3.78  dur=0.02  gain=0.05 from=5000 to=1550 q=2.2 bed=metal
@era 16bit
  noise  at=0     dur=0.50 gain=0.12 from=2400 to=175 q=0.7 bed=white pan=-0.4 send=0.30
  noise  at=0     dur=0.011 gain=0.10 from=9000 to=2800 q=1.0 bed=white pan=-0.35
  noise  at=0.48  dur=0.55 gain=0.13 from=2200 to=155 q=0.7 bed=white pan=0.45 send=0.30
  noise  at=0.48  dur=0.011 gain=0.11 from=8400 to=2600 q=1.0 bed=white pan=0.4
  noise  at=0.88  dur=0.52 gain=0.13 from=2600 to=185 q=0.7 bed=white pan=-0.2 send=0.28
  noise  at=1.22  dur=0.50 gain=0.14 from=2300 to=165 q=0.7 bed=white pan=0.3  send=0.26
  noise  at=1.22  dur=0.011 gain=0.11 from=9600 to=3000 q=1.0 bed=white pan=0.25
  noise  at=1.53  dur=0.46 gain=0.14 from=2500 to=180 q=0.7 bed=white pan=-0.45 send=0.26
  noise  at=1.80  dur=0.44 gain=0.15 from=2200 to=160 q=0.7 bed=white pan=0.15 send=0.24
  noise  at=2.04  dur=0.42 gain=0.15 from=2700 to=195 q=0.7 bed=white pan=-0.3 send=0.22
  noise  at=2.04  dur=0.011 gain=0.12 from=10000 to=3100 q=1.0 bed=white
  noise  at=2.24  dur=0.40 gain=0.16 from=2400 to=170 q=0.7 bed=white pan=0.4  send=0.22
  noise  at=2.40  dur=0.38 gain=0.16 from=2800 to=200 q=0.7 bed=white pan=-0.15 send=0.20
  noise  at=2.55  dur=0.36 gain=0.17 from=2500 to=175 q=0.7 bed=white pan=0.25 send=0.20
  noise  at=3.10  dur=0.020 gain=0.21 from=12000 to=3400 q=1.0 bed=white send=0.06
  noise  at=3.10  dur=1.25  gain=0.20 from=3400  to=95   q=0.6 bed=white send=0.14
  tone   at=3.10  dur=0.62  gain=0.12 wave=sine from=155 to=32 shape=hit send=0.10
  noise  at=3.34  dur=0.02  gain=0.09 from=5800 to=1750 q=2.4 bed=white pan=-0.45 send=0.18
  noise  at=3.55  dur=0.02  gain=0.07 from=4800 to=1500 q=2.4 bed=white pan=0.5  send=0.18
  noise  at=3.78  dur=0.02  gain=0.05 from=5400 to=1650 q=2.4 bed=white pan=-0.25 send=0.18
  echo   send=1.0 time=0.26 fb=0.48 damp=2800
