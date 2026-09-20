# An explosive barrel. The charge, then the container: inharmonic partials at
# roughly 1 : 2.76 : 5.40, the same ratios as `metal`, ringing on after the
# boom has gone.
@fx explosion-barrel
  desc  An exploding barrel -- blast plus metal shell
  tags  weapon impact material explosion
@vary pitch=0.05 gain=0.06
@era 8bit
  noise  at=0     dur=0.012 gain=0.20 from=9000 to=3000 q=1.0 bed=metal
  noise  at=0     dur=0.40  gain=0.20 from=2400 to=140  q=0.7 bed=long
  tone   at=0     dur=0.26  gain=0.11 wave=pulse50 from=170 to=46 shape=hit
  tone   at=0.01  dur=0.55  gain=0.07 wave=pulse50 from=430  to=418  shape=hit
  tone   at=0.01  dur=0.44  gain=0.05 wave=pulse12 from=1187 to=1170 shape=hit
@era 16bit
  noise  at=0     dur=0.013 gain=0.18 from=11000 to=3400 q=1.0 bed=white
  noise  at=0     dur=0.55  gain=0.19 from=2800  to=120  q=0.7 bed=white
  tone   at=0     dur=0.34  gain=0.12 wave=sine from=180 to=40 shape=hit
  tone   at=0.01  dur=1.00  gain=0.07 wave=sine from=430  to=422  shape=hit pan=-0.3
  tone   at=0.01  dur=0.80  gain=0.05 wave=sine from=1187 to=1176 shape=hit pan=0.3
  tone   at=0.01  dur=0.55  gain=0.03 wave=sine from=2322 to=2300 shape=hit
  echo   send=0.30 time=0.15 fb=0.38
