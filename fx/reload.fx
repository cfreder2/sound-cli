# Magazine out, magazine in, slide. Three events at uneven spacing.

@fx reload
  desc  Magazine out, magazine in, slide
  tags  weapon shooter mechanical
@era 8bit
  noise  at=0    dur=0.04 gain=0.13 from=3400 to=900 q=1.8 bed=metal
  noise  at=0.20 dur=0.05 gain=0.15 from=2600 to=600 q=1.6 bed=metal
  tone   at=0.20 dur=0.05 gain=0.06 wave=pulse50 from=300 to=180 shape=hit
  noise  at=0.42 dur=0.06 gain=0.17 from=4200 to=800 q=1.4 bed=metal
  tone   at=0.42 dur=0.07 gain=0.07 wave=pulse50 from=420 to=200 shape=hit
@era 16bit
  noise  at=0    dur=0.045 gain=0.12 from=4000 to=1000 q=2.0 bed=white pan=-0.15
  noise  at=0.20 dur=0.055 gain=0.14 from=3000 to=650  q=1.8 bed=white
  tone   at=0.20 dur=0.06  gain=0.05 wave=tri from=310 to=170 shape=hit
  noise  at=0.42 dur=0.07  gain=0.16 from=5000 to=850  q=1.5 bed=white pan=0.2
  tone   at=0.42 dur=0.09  gain=0.06 wave=tri from=440 to=190 shape=hit
  tone   at=0.42 dur=0.22  gain=0.03 wave=sine from=1800 to=1760 shape=hit
  echo   send=0.22 time=0.10 fb=0.28
