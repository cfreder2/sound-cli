# A spring. Three rising tones; the wobble between them is the spring.

@fx bounce
  desc  A spring or bouncy pad
  tags  platformer
@era 8bit
  tone   at=0    dur=0.09 gain=0.14 wave=pulse25 from=260 to=680  shape=lin
  tone   at=0.08 dur=0.07 gain=0.11 wave=pulse25 from=620 to=980  shape=lin
  tone   at=0.14 dur=0.06 gain=0.08 wave=pulse25 from=900 to=1240 shape=lin
@era 16bit
  tone   at=0    dur=0.10 gain=0.13 wave=tri from=250 to=700  shape=lin
  tone   at=0.08 dur=0.08 gain=0.10 wave=tri from=640 to=1020 shape=lin
  tone   at=0.15 dur=0.07 gain=0.07 wave=tri from=940 to=1320 shape=lin
  tone   at=0    dur=0.24 gain=0.04 wave=sine from=125 to=350 shape=lin
  echo   send=0.28 time=0.07 fb=0.30
