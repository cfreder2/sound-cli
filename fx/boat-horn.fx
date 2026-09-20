# A ship's horn. Very low and very long: a fundamental near 75 Hz with a fifth
# above it, held for two and a half seconds. The pitch sags slightly across the
# blast, which is what a real horn does as pressure drops.
@fx boat-horn
  desc  A ship or fog horn
  tags  vehicle water ambience
@era 8bit
  tone   at=0     dur=0.20 gain=0.10 wave=pulse50 from=58 to=75 shape=flat
  tone   at=0.20  dur=2.10 gain=0.16 wave=pulse50 from=75 to=71 shape=flat
  tone   at=0.20  dur=2.10 gain=0.10 wave=pulse50 from=112 to=106 shape=flat
  tone   at=0.20  dur=2.10 gain=0.05 wave=pulse25 from=150 to=142 shape=flat
  tone   at=2.30  dur=0.45 gain=0.12 wave=pulse50 from=71 to=62 shape=exp
@era 16bit
  tone   at=0     dur=0.22 gain=0.09 wave=saw from=56 to=75 shape=flat
  tone   at=0.22  dur=2.30 gain=0.15 wave=saw from=75 to=70 shape=flat
  tone   at=0.22  dur=2.30 gain=0.09 wave=saw from=112 to=105 shape=flat pan=0.2
  tone   at=0.22  dur=2.30 gain=0.05 wave=sine from=150 to=140 shape=flat pan=-0.2
  tone   at=0.22  dur=2.30 gain=0.04 wave=sine from=225 to=210 shape=flat
  tone   at=2.52  dur=0.55 gain=0.11 wave=saw from=70 to=58 shape=exp
  echo   send=0.46 time=0.34 fb=0.52
