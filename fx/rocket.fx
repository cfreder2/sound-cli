# A rocket launch: the ignition crack, then sustained noise receding.
@fx rocket
  desc  A rocket or missile launching
  tags  weapon shooter scifi
@era 8bit
  noise  at=0    dur=0.03 gain=0.20 from=6000 to=1200 q=1.0 bed=metal
  noise  at=0    dur=0.80 gain=0.16 from=1800 to=400  q=0.8 bed=long
  tone   at=0    dur=0.70 gain=0.07 wave=pulse50 from=180 to=90 shape=lin
@era 16bit
  noise  at=0    dur=0.03 gain=0.18 from=7000 to=1300 q=1.0 bed=white
  noise  at=0    dur=1.00 gain=0.15 from=2200 to=320  q=0.8 bed=white
  noise  at=0.10 dur=0.90 gain=0.07 from=900  to=220  q=1.0 bed=white pan=0.35
  tone   at=0    dur=0.90 gain=0.07 wave=saw from=190 to=70 shape=lin
  echo   send=0.30 time=0.16 fb=0.40
