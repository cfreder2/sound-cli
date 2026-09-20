# A soft heavy impact. Low tone with no ring, plus a ~15 ms noise transient.

@fx thud
  desc  A soft heavy impact -- a body, a sack, a landing
  tags  impact body
@vary pitch=0.08 gain=0.10
@era 8bit
  noise  at=0 dur=0.05 gain=0.14 from=900 to=180 q=0.9 bed=long
  tone   at=0 dur=0.10 gain=0.16 wave=pulse50 from=120 to=62 shape=hit
@era 16bit
  noise  at=0 dur=0.06 gain=0.13 from=1100 to=160 q=1.0 bed=white
  tone   at=0 dur=0.13 gain=0.15 wave=sine from=125 to=55 shape=hit
  tone   at=0 dur=0.20 gain=0.06 wave=sine from=62  to=44 shape=hit
