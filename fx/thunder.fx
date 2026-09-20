# Thunder. Long, low, and moving -- the filter crawling downward over a full
# second is what makes it read as distance rather than as a snare.
@fx thunder
  desc  A distant roll of thunder
  tags  weather ambience
@era 8bit
  noise  at=0     dur=1.30 gain=0.20 from=900 to=70  q=0.6 bed=long
  noise  at=0.25  dur=0.90 gain=0.10 from=500 to=90  q=0.8 bed=long
@era 16bit
  noise  at=0     dur=1.60 gain=0.19 from=1000 to=55 q=0.6 bed=white
  noise  at=0.22  dur=1.30 gain=0.11 from=600  to=80 q=0.8 bed=white pan=0.35
  noise  at=0.40  dur=1.10 gain=0.09 from=420  to=70 q=0.8 bed=white pan=-0.35
  tone   at=0     dur=1.40 gain=0.06 wave=sine from=60 to=28 shape=exp
  echo   send=0.40 time=0.28 fb=0.48
