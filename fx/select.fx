# Confirm. A blip that resolves upward, so it reads as "yes" not "moved".
@fx select
  desc  Confirm -- two quick ascending ticks
  tags  ui
@era 8bit
  tone   at=0     dur=0.04 gain=0.13 wave=pulse50 from=880  to=880  shape=flat
  tone   at=0.04  dur=0.14 gain=0.13 wave=pulse50 from=1320 to=1320 shape=exp
@era 16bit
  tone   at=0     dur=0.04 gain=0.10 wave=tri from=880  to=880  shape=flat
  tone   at=0.04  dur=0.20 gain=0.10 wave=tri from=1320 to=1320 shape=exp
  tone   at=0.04  dur=0.20 gain=0.04 wave=sine from=2640 to=2640 shape=exp pan=0.2
  echo   send=0.25 time=0.07 fb=0.30
