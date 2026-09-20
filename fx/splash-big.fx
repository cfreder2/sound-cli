# A heavy body hitting water. The low tone is the displaced volume.

@fx splash-big
  desc  A heavy body hitting water
  tags  water impact
@vary pitch=0.05 gain=0.06
@era 8bit
  noise  at=0     dur=0.40 gain=0.24 from=700  to=80  q=0.7 bed=long
  tone   at=0     dur=0.24 gain=0.10 wave=pulse50 from=180 to=50 shape=hit
  noise  at=0.10  dur=0.45 gain=0.10 from=2600 to=700 q=1.3 bed=metal
@era 16bit
  noise  at=0     dur=0.50 gain=0.22 from=900  to=70  q=0.8 bed=white
  tone   at=0     dur=0.32 gain=0.11 wave=sine from=190 to=44 shape=hit
  noise  at=0.08  dur=0.75 gain=0.11 from=3600 to=800 q=1.7 bed=white pan=0.35
  noise  at=0.14  dur=0.65 gain=0.09 from=2800 to=600 q=1.7 bed=white pan=-0.35
  echo   send=0.30 time=0.13 fb=0.36
