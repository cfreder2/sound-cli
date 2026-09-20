# A Halloween atmosphere, about four seconds.
#
# Four things at once, none of which is spooky on its own: a low drone of two
# tones six cents apart, so they beat slowly; wind; a descending figure a
# tritone wide, which is the interval the whole idea rests on; and a door
# creaking at the end. Heavy echo, because a dry spooky sound is a comedy
# spooky sound.
@fx halloween
  desc  A spooky Halloween atmosphere
  tags  horror ambience halloween
@era 8bit
  tone   at=0     dur=3.60 gain=0.09 wave=pulse50 from=55  to=53  shape=flat
  tone   at=0     dur=3.60 gain=0.07 wave=pulse50 from=55.4 to=53.4 shape=flat
  noise  at=0     dur=3.80 gain=0.07 from=420 to=900 q=1.8 bed=long
  tone   at=0.55  dur=0.34 gain=0.10 wave=pulse12 from=622 to=622 shape=exp
  tone   at=0.95  dur=0.34 gain=0.09 wave=pulse12 from=587 to=587 shape=exp
  tone   at=1.35  dur=0.34 gain=0.09 wave=pulse12 from=554 to=554 shape=exp
  tone   at=1.75  dur=0.80 gain=0.10 wave=pulse12 from=440 to=440 shape=exp
  noise  at=2.40  dur=0.80 gain=0.07 from=520 to=1400 q=3.2 bed=metal
  tone   at=3.20  dur=0.60 gain=0.06 wave=pulse50 from=311 to=305 shape=exp
@era 16bit
  tone   at=0     dur=4.00 gain=0.09 wave=saw from=55   to=52  shape=flat pan=-0.25
  tone   at=0     dur=4.00 gain=0.07 wave=saw from=55.2 to=52.2 shape=flat pan=0.25
  tone   at=0     dur=4.00 gain=0.04 wave=sine from=27.5 to=26 shape=flat
  noise  at=0     dur=4.20 gain=0.06 from=380 to=1000 q=2.0 bed=white pan=0.3
  noise  at=0.60  dur=3.20 gain=0.04 from=900 to=420  q=2.2 bed=white pan=-0.35
  tone   at=0.55  dur=0.40 gain=0.09 wave=sine from=622 to=622 shape=exp pan=-0.2
  tone   at=0.95  dur=0.40 gain=0.08 wave=sine from=587 to=587 shape=exp
  tone   at=1.35  dur=0.40 gain=0.08 wave=sine from=554 to=554 shape=exp pan=0.2
  tone   at=1.75  dur=1.00 gain=0.09 wave=sine from=440 to=440 shape=exp
  tone   at=1.75  dur=1.00 gain=0.04 wave=sine from=622 to=622 shape=exp pan=-0.3
  noise  at=2.40  dur=0.90 gain=0.06 from=480 to=1600 q=3.4 bed=white pan=0.35
  tone   at=3.30  dur=0.70 gain=0.05 wave=saw from=311 to=302 shape=exp
  echo   send=0.52 time=0.33 fb=0.54
