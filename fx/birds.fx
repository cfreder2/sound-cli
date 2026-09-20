# Birds chirping. Each chirp is a fast glide up then back down between 2.6 and
# 4.8 kHz, 40 to 70 ms. Two sweeps per chirp is what makes it a bird rather
# than a beep: a single sweep in one direction reads as electronic.
@fx birds
  desc  Birds chirping
  tags  ambience nature loop
@vary pitch=0.08
@era 8bit
  tone   at=0     dur=0.030 gain=0.08 wave=pulse25 from=2600 to=4400 shape=flat
  tone   at=0.030 dur=0.030 gain=0.08 wave=pulse25 from=4400 to=3000 shape=exp
  tone   at=0.28  dur=0.026 gain=0.07 wave=pulse25 from=3000 to=4800 shape=flat
  tone   at=0.306 dur=0.026 gain=0.07 wave=pulse25 from=4800 to=3300 shape=exp
  tone   at=0.62  dur=0.032 gain=0.08 wave=pulse25 from=2800 to=4200 shape=flat
  tone   at=0.652 dur=0.032 gain=0.08 wave=pulse25 from=4200 to=2900 shape=exp
  tone   at=1.18  dur=0.028 gain=0.06 wave=pulse25 from=3200 to=4600 shape=flat
  tone   at=1.208 dur=0.028 gain=0.06 wave=pulse25 from=4600 to=3100 shape=exp
  tone   at=1.44  dur=0.026 gain=0.07 wave=pulse25 from=2900 to=4300 shape=flat
  tone   at=1.466 dur=0.026 gain=0.07 wave=pulse25 from=4300 to=3000 shape=exp
  tone   at=1.95  dur=0.030 gain=0.05 wave=pulse25 from=3100 to=4500 shape=flat
  tone   at=1.980 dur=0.030 gain=0.05 wave=pulse25 from=4500 to=3200 shape=exp
@era 16bit
  tone   at=0     dur=0.032 gain=0.07 wave=sine from=2600 to=4500 shape=flat pan=-0.35
  tone   at=0.032 dur=0.032 gain=0.07 wave=sine from=4500 to=2950 shape=exp pan=-0.35
  tone   at=0     dur=0.060 gain=0.02 wave=sine from=5200 to=5900 shape=exp pan=-0.35
  tone   at=0.28  dur=0.028 gain=0.06 wave=sine from=3000 to=4900 shape=flat pan=0.4
  tone   at=0.308 dur=0.028 gain=0.06 wave=sine from=4900 to=3300 shape=exp pan=0.4
  tone   at=0.62  dur=0.034 gain=0.07 wave=sine from=2800 to=4300 shape=flat pan=-0.15
  tone   at=0.654 dur=0.034 gain=0.07 wave=sine from=4300 to=2900 shape=exp pan=-0.15
  tone   at=1.18  dur=0.030 gain=0.05 wave=sine from=3200 to=4700 shape=flat pan=0.45
  tone   at=1.210 dur=0.030 gain=0.05 wave=sine from=4700 to=3100 shape=exp pan=0.45
  tone   at=1.44  dur=0.028 gain=0.06 wave=sine from=2900 to=4400 shape=flat pan=-0.3
  tone   at=1.468 dur=0.028 gain=0.06 wave=sine from=4400 to=3000 shape=exp pan=-0.3
  tone   at=1.95  dur=0.032 gain=0.04 wave=sine from=3100 to=4600 shape=flat pan=0.2
  tone   at=1.982 dur=0.032 gain=0.04 wave=sine from=4600 to=3200 shape=exp pan=0.2
  echo   send=0.42 time=0.17 fb=0.44
