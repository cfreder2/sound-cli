# A shell. Three stages in order: the launch whistle rising, the burst, then a
# crackle tail of small charges at irregular intervals.
@fx explosion-firework
  desc  A firework -- whistle, burst, crackle
  tags  ambience explosion
@era 8bit
  noise  at=0     dur=0.45  gain=0.07 from=900 to=3200 q=2.8 bed=metal
  tone   at=0     dur=0.45  gain=0.05 wave=pulse12 from=700 to=2000 shape=flat
  noise  at=0.46  dur=0.014 gain=0.20 from=9000 to=2600 q=1.0 bed=metal
  noise  at=0.46  dur=0.40  gain=0.17 from=2600 to=200  q=0.7 bed=long
  noise  at=0.62  dur=0.02  gain=0.10 from=5000 to=1600 q=2.2 bed=metal
  noise  at=0.75  dur=0.02  gain=0.09 from=4400 to=1400 q=2.2 bed=metal
  noise  at=0.91  dur=0.02  gain=0.08 from=5400 to=1700 q=2.2 bed=metal
  noise  at=1.04  dur=0.02  gain=0.06 from=4000 to=1300 q=2.2 bed=metal
  noise  at=1.22  dur=0.02  gain=0.05 from=4800 to=1500 q=2.2 bed=metal
@era 16bit
  noise  at=0     dur=0.50  gain=0.06 from=850 to=3600 q=3.0 bed=white
  tone   at=0     dur=0.50  gain=0.05 wave=saw from=680 to=2100 shape=flat
  noise  at=0.51  dur=0.015 gain=0.19 from=11000 to=3000 q=1.0 bed=white
  noise  at=0.51  dur=0.55  gain=0.17 from=3000  to=170  q=0.7 bed=white
  tone   at=0.51  dur=0.30  gain=0.07 wave=sine from=160 to=42 shape=hit
  noise  at=0.67  dur=0.02  gain=0.09 from=5600 to=1700 q=2.4 bed=white pan=-0.35
  noise  at=0.80  dur=0.02  gain=0.08 from=4800 to=1500 q=2.4 bed=white pan=0.4
  noise  at=0.96  dur=0.02  gain=0.07 from=6000 to=1800 q=2.4 bed=white pan=-0.2
  noise  at=1.09  dur=0.02  gain=0.06 from=4400 to=1400 q=2.4 bed=white pan=0.25
  noise  at=1.27  dur=0.02  gain=0.05 from=5200 to=1600 q=2.4 bed=white pan=-0.3
  echo   send=0.40 time=0.22 fb=0.46
