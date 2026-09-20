# Healing. Three rising consonant tones, slow.

@fx heal
  desc  Healing -- a soft rising shimmer
  tags  reward
@era 8bit
  tone   at=0     dur=0.10 gain=0.09 wave=pulse50 from=523 to=523 shape=flat
  tone   at=0.08  dur=0.10 gain=0.09 wave=pulse50 from=784 to=784 shape=flat
  tone   at=0.16  dur=0.34 gain=0.10 wave=pulse50 from=1047 to=1047 shape=exp
@era 16bit
  tone   at=0     dur=0.14 gain=0.07 wave=sine from=523  to=523  shape=exp
  tone   at=0.08  dur=0.16 gain=0.07 wave=sine from=784  to=784  shape=exp
  tone   at=0.16  dur=0.55 gain=0.08 wave=sine from=1047 to=1047 shape=exp
  tone   at=0.16  dur=0.55 gain=0.04 wave=tri  from=1568 to=1568 shape=exp pan=0.3
  echo   send=0.42 time=0.13 fb=0.44
