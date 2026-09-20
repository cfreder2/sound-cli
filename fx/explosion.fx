# Explosion.
#
# Three timescales stacked: a 10 ms crack, a 400 ms body falling through the
# filter, and a low sine drop for the pressure wave. Skip the crack and it
# sounds distant; skip the sine and it sounds small.
@fx explosion
  desc  A big boom -- crack, body, and a pressure drop
  tags  weapon impact
@vary pitch=0.05 gain=0.06
@era 8bit
  noise  at=0     dur=0.012 gain=0.22 from=9000 to=4000 q=1.0 bed=metal
  noise  at=0     dur=0.50  gain=0.24 from=2200 to=90   q=0.7 bed=long
  tone   at=0     dur=0.34  gain=0.13 wave=pulse50 from=180 to=42 shape=hit
@era 16bit
  noise  at=0     dur=0.014 gain=0.20 from=11000 to=5000 q=0.9 bed=white
  noise  at=0     dur=0.70  gain=0.22 from=2600  to=70   q=0.7 bed=white
  noise  at=0.03  dur=0.90  gain=0.10 from=1400  to=160  q=0.8 bed=white pan=0.3
  noise  at=0.05  dur=0.85  gain=0.09 from=1100  to=140  q=0.8 bed=white pan=-0.3
  tone   at=0     dur=0.50  gain=0.14 wave=sine from=190 to=32 shape=hit
  echo   send=0.35 time=0.17 fb=0.42
