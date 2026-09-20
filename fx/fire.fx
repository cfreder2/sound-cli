# Fire. Broadband noise with the filter wandering, plus irregular crackles.
# The irregularity is everything: evenly spaced crackles read as a machine.
@fx fire
  desc  A burning flame
  tags  ambience nature loop
@era 8bit
  noise  at=0    dur=1.20 gain=0.11 from=700  to=900  q=0.8 bed=long
  noise  at=0.13 dur=0.02 gain=0.10 from=4000 to=1200 q=2.4 bed=metal
  noise  at=0.41 dur=0.02 gain=0.08 from=3400 to=1000 q=2.4 bed=metal
  noise  at=0.66 dur=0.02 gain=0.11 from=4600 to=1400 q=2.4 bed=metal
  noise  at=0.97 dur=0.02 gain=0.07 from=3000 to=900  q=2.4 bed=metal
@era 16bit
  noise  at=0    dur=1.40 gain=0.10 from=650  to=1000 q=0.9 bed=white
  noise  at=0.13 dur=0.02 gain=0.09 from=4600 to=1300 q=2.6 bed=white pan=-0.3
  noise  at=0.41 dur=0.02 gain=0.07 from=3800 to=1100 q=2.6 bed=white pan=0.35
  noise  at=0.66 dur=0.02 gain=0.10 from=5200 to=1500 q=2.6 bed=white pan=-0.15
  noise  at=0.97 dur=0.02 gain=0.06 from=3200 to=950  q=2.6 bed=white pan=0.25
  noise  at=0    dur=1.40 gain=0.03 from=180  to=240  q=1.0 bed=white
  echo   send=0.22 time=0.12 fb=0.30
