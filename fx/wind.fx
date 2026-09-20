# Wind. One narrow noise band wandering slowly. Everything about wind is in
# how slowly the filter moves -- fast and it is a jet.
@fx wind
  desc  Wind through an open place
  tags  ambience nature loop
@era 8bit
  noise  at=0    dur=1.60 gain=0.13 from=380 to=900 q=1.8 bed=long
  noise  at=0.50 dur=1.30 gain=0.07 from=900 to=420 q=2.2 bed=long
@era 16bit
  noise  at=0    dur=1.90 gain=0.12 from=340 to=1000 q=2.0 bed=white pan=-0.3
  noise  at=0.50 dur=1.55 gain=0.07 from=950 to=380  q=2.4 bed=white pan=0.35
  noise  at=0.20 dur=1.70 gain=0.04 from=150 to=230  q=1.2 bed=white
  echo   send=0.30 time=0.24 fb=0.40
