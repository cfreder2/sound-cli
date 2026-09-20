# A directional charge. Nearly all transient and almost no tail: the blast is
# aimed away, so what reaches you is the crack and little else.
@fx explosion-mine
  desc  A mine or shaped charge -- sharp, no tail
  tags  weapon impact explosion
@vary pitch=0.06 gain=0.07
@era 8bit
  noise  at=0 dur=0.008 gain=0.24 from=10000 to=4000 q=0.9 bed=metal
  noise  at=0 dur=0.10  gain=0.20 from=4000  to=500  q=0.9 bed=long shape=hit
  tone   at=0 dur=0.08  gain=0.10 wave=pulse50 from=280 to=90 shape=hit
@era 16bit
  noise  at=0 dur=0.008 gain=0.22 from=12000 to=4400 q=0.9 bed=white
  noise  at=0 dur=0.13  gain=0.19 from=4600  to=460  q=0.9 bed=white shape=hit
  tone   at=0 dur=0.10  gain=0.11 wave=sine from=290 to=80 shape=hit
  tone   at=0 dur=0.16  gain=0.05 wave=sine from=100 to=42 shape=hit
