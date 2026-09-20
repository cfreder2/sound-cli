# Three detonations at uneven spacing, each smaller than the last. Even spacing
# reads as a machine; the irregularity is what makes it a chain reaction.
@fx explosion-chain
  desc  A chain of three explosions
  tags  weapon impact explosion
@era 8bit
  noise  at=0     dur=0.012 gain=0.20 from=9000 to=3200 q=1.0 bed=metal
  noise  at=0     dur=0.40  gain=0.20 from=2400 to=120  q=0.7 bed=long
  tone   at=0     dur=0.28  gain=0.12 wave=pulse50 from=170 to=40 shape=hit
  noise  at=0.29  dur=0.010 gain=0.15 from=8000 to=3000 q=1.0 bed=metal
  noise  at=0.29  dur=0.32  gain=0.15 from=2100 to=140  q=0.7 bed=long
  tone   at=0.29  dur=0.22  gain=0.09 wave=pulse50 from=195 to=48 shape=hit
  noise  at=0.71  dur=0.009 gain=0.11 from=7000 to=2800 q=1.0 bed=metal
  noise  at=0.71  dur=0.26  gain=0.11 from=1900 to=170  q=0.7 bed=long
  tone   at=0.71  dur=0.18  gain=0.07 wave=pulse50 from=215 to=56 shape=hit
@era 16bit
  noise  at=0     dur=0.013 gain=0.18 from=11000 to=3600 q=1.0 bed=white
  noise  at=0     dur=0.55  gain=0.19 from=2800  to=100  q=0.7 bed=white
  tone   at=0     dur=0.36  gain=0.13 wave=sine from=180 to=34 shape=hit
  noise  at=0.29  dur=0.011 gain=0.14 from=9000 to=3200 q=1.0 bed=white pan=0.35
  noise  at=0.29  dur=0.44  gain=0.14 from=2400 to=120  q=0.7 bed=white pan=0.2
  tone   at=0.29  dur=0.28  gain=0.10 wave=sine from=205 to=42 shape=hit
  noise  at=0.71  dur=0.010 gain=0.10 from=8000 to=3000 q=1.0 bed=white pan=-0.35
  noise  at=0.71  dur=0.34  gain=0.10 from=2100 to=150  q=0.7 bed=white pan=-0.2
  tone   at=0.71  dur=0.22  gain=0.08 wave=sine from=225 to=50 shape=hit
  echo   send=0.34 time=0.18 fb=0.42
