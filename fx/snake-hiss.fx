# A hiss. Band-passed noise centred near 5 kHz, with the band drifting and two
# layers slightly offset so the texture moves. Static noise reads as tape
# hiss; the drift is what makes it an animal.
@fx snake-hiss
  desc  A snake hissing
  tags  animal nature horror
@vary gain=0.10
@era 8bit
  noise  at=0     dur=1.40 gain=0.13 from=4200 to=5600 q=2.0 bed=metal filter=bandpass
  noise  at=0.12  dur=1.20 gain=0.08 from=6400 to=5000 q=2.4 bed=metal filter=bandpass
@era 16bit
  noise  at=0     dur=1.60 gain=0.12 from=4400 to=6000 q=2.2 bed=white filter=bandpass pan=-0.2
  noise  at=0.12  dur=1.40 gain=0.08 from=6800 to=5200 q=2.6 bed=white filter=bandpass pan=0.25
  noise  at=0.30  dur=1.20 gain=0.05 from=3200 to=3800 q=1.8 bed=white filter=bandpass
  echo   send=0.20 time=0.13 fb=0.28
