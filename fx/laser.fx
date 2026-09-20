# A single energy shot. Falling pulse, an octave-down layer, and a noise
# transient at the front.

@fx laser
  desc  A single energy shot
  tags  weapon scifi

@vary pitch=0.08 gain=0.06

@era 8bit
  tone   at=0      dur=0.16  gain=0.15  wave=pulse25  from=1800  to=240  shape=hit
  tone   at=0.004  dur=0.16  gain=0.07  wave=pulse12  from=900   to=120  shape=hit
  noise  at=0      dur=0.05  gain=0.07  from=6000  to=1400  q=1.2  bed=metal

@era 16bit
  tone   at=0      dur=0.22  gain=0.13  wave=saw   from=2400  to=190  shape=hit
  tone   at=0      dur=0.22  gain=0.07  wave=sine  from=1200  to=95   shape=hit
  tone   at=0.002  dur=0.10  gain=0.05  wave=sine  from=3600  to=800  shape=hit  pan=0.2
  noise  at=0      dur=0.07  gain=0.07  from=8000  to=1600  q=1.4  bed=white
  echo   send=0.30 time=0.11 fb=0.34
