# Metal struck. Partials at roughly 1 : 2.76 : 5.40, which approximates the
# modes of a struck bar. Harmonic ratios instead would read as an organ.

@fx metal
  desc  Metal struck -- a clang with inharmonic partials
  tags  impact material

@vary pitch=0.04 gain=0.05

@era 8bit
  noise  at=0      dur=0.05  gain=0.12  from=7000 to=2600 q=1.4 bed=metal
  tone   at=0      dur=0.40  gain=0.09  wave=pulse50 from=520  to=505  shape=hit
  tone   at=0      dur=0.34  gain=0.05  wave=pulse12 from=1435 to=1420 shape=hit
  tone   at=0      dur=0.22  gain=0.03  wave=pulse12 from=2808 to=2790 shape=hit

@era 16bit
  noise  at=0      dur=0.05  gain=0.11  from=9000 to=3000 q=1.5 bed=white
  tone   at=0      dur=1.10  gain=0.09  wave=sine from=520  to=516  shape=hit
  tone   at=0      dur=0.85  gain=0.06  wave=sine from=1435 to=1425 shape=hit  pan=0.2
  tone   at=0      dur=0.60  gain=0.04  wave=sine from=2808 to=2780 shape=hit  pan=-0.2
  tone   at=0      dur=0.40  gain=0.02  wave=sine from=4180 to=4140 shape=hit
  echo   send=0.28 time=0.14 fb=0.36
