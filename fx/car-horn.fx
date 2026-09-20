# A car horn. Two horns sounding together a major third apart -- 440 and 554 Hz
# -- which is how they are actually built; one horn alone sounds like a buzzer.
# Held flat, then cut.
@fx car-horn
  desc  A car horn
  tags  vehicle city
@era 8bit
  tone   at=0     dur=0.55 gain=0.13 wave=pulse25 from=440 to=440 shape=flat
  tone   at=0     dur=0.55 gain=0.11 wave=pulse25 from=554 to=554 shape=flat
  tone   at=0     dur=0.55 gain=0.04 wave=pulse12 from=880 to=880 shape=flat
@era 16bit
  tone   at=0     dur=0.60 gain=0.12 wave=saw from=440 to=440 shape=flat
  tone   at=0     dur=0.60 gain=0.10 wave=saw from=554 to=554 shape=flat pan=0.15
  tone   at=0     dur=0.60 gain=0.04 wave=sine from=880 to=880 shape=flat
  tone   at=0     dur=0.60 gain=0.03 wave=sine from=1108 to=1108 shape=flat pan=-0.15
  echo   send=0.24 time=0.10 fb=0.28
