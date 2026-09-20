# An explosion some distance away. Air absorbs high frequencies over distance,
# so there is no crack at all -- only the body, arriving slower and lasting
# longer. Removing the transient is what makes it read as far away.
@fx explosion-distant
  desc  A distant explosion, no transient
  tags  weapon ambience explosion
@era 8bit
  noise  at=0     dur=1.30 gain=0.18 from=420 to=70 q=0.7 bed=long shape=lin
  tone   at=0.02  dur=0.90 gain=0.09 wave=pulse50 from=110 to=38 shape=exp
  noise  at=0.30  dur=1.10 gain=0.07 from=260 to=80 q=0.9 bed=long
@era 16bit
  noise  at=0     dur=1.60 gain=0.17 from=460 to=58 q=0.7 bed=white shape=lin
  tone   at=0.02  dur=1.10 gain=0.09 wave=sine from=115 to=32 shape=exp
  noise  at=0.28  dur=1.40 gain=0.08 from=300 to=70 q=0.9 bed=white pan=0.35
  noise  at=0.46  dur=1.20 gain=0.06 from=220 to=60 q=0.9 bed=white pan=-0.35
  echo   send=0.42 time=0.31 fb=0.50
