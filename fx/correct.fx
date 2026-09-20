# Correct answer. A major third then a fifth: consonant, quick, unmistakable.
@fx correct
  desc  A correct answer
  tags  puzzle ui reward
@era 8bit
  tone   at=0    dur=0.07 gain=0.12 wave=pulse25 from=784  to=784  shape=flat
  tone   at=0.07 dur=0.26 gain=0.13 wave=pulse25 from=1175 to=1175 shape=exp
@era 16bit
  tone   at=0    dur=0.08 gain=0.10 wave=tri from=784  to=784  shape=exp
  tone   at=0.07 dur=0.36 gain=0.11 wave=tri from=1175 to=1175 shape=exp
  tone   at=0.07 dur=0.30 gain=0.04 wave=sine from=1568 to=1568 shape=exp pan=0.25
  echo   send=0.34 time=0.09 fb=0.36
