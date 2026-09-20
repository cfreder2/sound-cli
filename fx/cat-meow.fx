# A meow. The pitch contour is the whole thing: up from 520 to 780 Hz over the
# first third, then down to 430 over the rest. Held partials at roughly twice
# and three times the fundamental carry the vowel.
@fx cat-meow
  desc  A cat meowing
  tags  animal nature
@vary pitch=0.08
@era 8bit
  tone   at=0     dur=0.18 gain=0.12 wave=pulse25 from=520 to=780 shape=flat
  tone   at=0.18  dur=0.38 gain=0.12 wave=pulse25 from=780 to=430 shape=exp
  tone   at=0     dur=0.18 gain=0.05 wave=pulse12 from=1040 to=1560 shape=flat
  tone   at=0.18  dur=0.32 gain=0.05 wave=pulse12 from=1560 to=880 shape=exp
  noise  at=0     dur=0.05 gain=0.03 from=1600 to=900 q=2.0 bed=long
@era 16bit
  tone   at=0     dur=0.20 gain=0.11 wave=saw from=520 to=790 shape=flat
  tone   at=0.20  dur=0.44 gain=0.11 wave=saw from=790 to=420 shape=exp
  tone   at=0     dur=0.20 gain=0.05 wave=sine from=1040 to=1580 shape=flat pan=0.2
  tone   at=0.20  dur=0.38 gain=0.05 wave=sine from=1580 to=860 shape=exp pan=0.2
  tone   at=0     dur=0.20 gain=0.03 wave=sine from=1560 to=2370 shape=flat pan=-0.2
  tone   at=0.20  dur=0.30 gain=0.03 wave=sine from=2370 to=1290 shape=exp pan=-0.2
  noise  at=0     dur=0.06 gain=0.025 from=1800 to=900 q=2.2 bed=white
  echo   send=0.30 time=0.11 fb=0.32
