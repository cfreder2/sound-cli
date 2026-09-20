# Two barks. A bark is a noise burst with a voiced tone under it, both falling
# fast: the fundamental drops from about 320 Hz to 180 in a tenth of a second,
# and the partials at 700 and 1500 Hz are what make it an animal rather than a
# thud.
@fx dog-bark
  desc  A dog barking twice
  tags  animal nature
@vary pitch=0.07 gain=0.08
@era 8bit
  noise  at=0     dur=0.035 gain=0.14 from=2600 to=700 q=1.4 bed=long
  tone   at=0     dur=0.14  gain=0.14 wave=pulse25 from=330 to=175 shape=hit
  tone   at=0     dur=0.11  gain=0.06 wave=pulse12 from=740 to=420 shape=hit
  noise  at=0.30  dur=0.035 gain=0.12 from=2400 to=660 q=1.4 bed=long
  tone   at=0.30  dur=0.13  gain=0.13 wave=pulse25 from=310 to=165 shape=hit
  tone   at=0.30  dur=0.10  gain=0.05 wave=pulse12 from=700 to=400 shape=hit
@era 16bit
  noise  at=0     dur=0.038 gain=0.13 from=3000 to=650 q=1.5 bed=white
  tone   at=0     dur=0.17  gain=0.13 wave=saw from=325 to=170 shape=hit
  tone   at=0     dur=0.13  gain=0.06 wave=sine from=760 to=430 shape=hit
  tone   at=0     dur=0.10  gain=0.03 wave=sine from=1540 to=900 shape=hit pan=0.2
  noise  at=0.30  dur=0.038 gain=0.11 from=2800 to=610 q=1.5 bed=white pan=-0.15
  tone   at=0.30  dur=0.16  gain=0.12 wave=saw from=305 to=160 shape=hit pan=-0.15
  tone   at=0.30  dur=0.12  gain=0.05 wave=sine from=720 to=410 shape=hit
  tone   at=0.30  dur=0.09  gain=0.03 wave=sine from=1460 to=860 shape=hit pan=0.25
  echo   send=0.30 time=0.13 fb=0.34
