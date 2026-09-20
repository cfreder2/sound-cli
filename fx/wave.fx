# A wave on a shore. Slow in, slow out -- the two-second swell is the sound,
# and any transient at all ruins it.
@fx wave
  desc  A wave breaking on a shore
  tags  water ambience loop
@era 8bit
  noise  at=0    dur=1.10 gain=0.16 from=300  to=1600 q=0.6 bed=long
  noise  at=0.95 dur=1.30 gain=0.12 from=1800 to=280  q=0.7 bed=long
@era 16bit
  noise  at=0    dur=1.30 gain=0.15 from=260  to=1900 q=0.6 bed=white pan=-0.25
  noise  at=1.10 dur=1.60 gain=0.12 from=2200 to=240  q=0.7 bed=white pan=0.25
  noise  at=0.20 dur=1.90 gain=0.05 from=140  to=110  q=0.9 bed=white
  echo   send=0.30 time=0.26 fb=0.40
