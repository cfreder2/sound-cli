# An air horn. Three tones a fifth and an octave apart around 160 Hz, plus a
# short rise at the onset as the air pressure builds. Lower and longer than a
# car horn, and the rise is what says "air" rather than "electric".
@fx truck-horn
  desc  A truck or air horn
  tags  vehicle city
@era 8bit
  tone   at=0     dur=0.10 gain=0.12 wave=pulse50 from=120 to=160 shape=flat
  tone   at=0.10  dur=1.00 gain=0.14 wave=pulse50 from=160 to=158 shape=flat
  tone   at=0.10  dur=1.00 gain=0.10 wave=pulse50 from=240 to=237 shape=flat
  tone   at=0.10  dur=1.00 gain=0.06 wave=pulse25 from=320 to=316 shape=flat
@era 16bit
  tone   at=0     dur=0.11 gain=0.11 wave=saw from=118 to=160 shape=flat
  tone   at=0.11  dur=1.15 gain=0.13 wave=saw from=160 to=157 shape=flat
  tone   at=0.11  dur=1.15 gain=0.09 wave=saw from=240 to=236 shape=flat pan=0.2
  tone   at=0.11  dur=1.15 gain=0.06 wave=saw from=320 to=314 shape=flat pan=-0.2
  tone   at=0.11  dur=1.15 gain=0.04 wave=sine from=80 to=79 shape=flat
  echo   send=0.30 time=0.16 fb=0.38
