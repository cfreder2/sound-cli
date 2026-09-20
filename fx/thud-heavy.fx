# Something very large landing. Longer, lower, and with a second bloom 90 ms in
# -- that delayed swell is what makes a thing read as massive rather than loud.
@fx thud-heavy
  desc  A massive impact -- a boss landing, a gate dropping
  tags  impact body boss
@era 8bit
  noise  at=0    dur=0.09 gain=0.18 from=700 to=110 q=0.8 bed=long
  tone   at=0    dur=0.30 gain=0.20 wave=pulse50 from=90 to=38 shape=hit
  noise  at=0.09 dur=0.35 gain=0.07 from=340 to=90  q=1.1 bed=long
@era 16bit
  noise  at=0    dur=0.10 gain=0.16 from=900 to=100 q=0.8 bed=white
  tone   at=0    dur=0.42 gain=0.18 wave=sine from=95 to=34 shape=hit
  tone   at=0    dur=0.55 gain=0.08 wave=sine from=52 to=42 shape=hit
  noise  at=0.09 dur=0.55 gain=0.08 from=420 to=80 q=1.2 bed=white pan=0.3
  echo   send=0.26 time=0.17 fb=0.34
