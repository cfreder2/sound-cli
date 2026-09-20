# A whoop. Pitch up fast, then down slower -- roughly one to three, which is
# what a voice does and what a siren does not. A symmetrical rise and fall
# reads as a slide whistle instead.
@fx whoop
  desc  A rising then falling whoop
  tags  ui cartoon reward
@vary pitch=0.07 gain=0.06
@era 8bit
  tone   at=0     dur=0.11 gain=0.14 wave=pulse25 from=290 to=880 shape=flat
  tone   at=0.11  dur=0.30 gain=0.14 wave=pulse25 from=880 to=330 shape=exp
  tone   at=0     dur=0.11 gain=0.05 wave=pulse50 from=145 to=440 shape=flat
  tone   at=0.11  dur=0.26 gain=0.05 wave=pulse50 from=440 to=165 shape=exp
  noise  at=0     dur=0.12 gain=0.030 from=1200 to=3000 q=2.0 bed=long
@era 16bit
  tone   at=0     dur=0.12 gain=0.13 wave=saw from=285 to=900 shape=flat pan=-0.2
  tone   at=0.12  dur=0.34 gain=0.13 wave=saw from=900 to=320 shape=exp pan=0.2
  tone   at=0     dur=0.12 gain=0.05 wave=sine from=142 to=450 shape=flat
  tone   at=0.12  dur=0.30 gain=0.05 wave=sine from=450 to=160 shape=exp
  noise  at=0     dur=0.13 gain=0.028 from=1300 to=3400 q=2.2 bed=white
  echo   send=0.34 time=0.11 fb=0.36
