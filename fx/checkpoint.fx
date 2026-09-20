# A checkpoint. Rising perfect fourth then the octave: unambiguously "good",
# and short enough not to interrupt a run.
@fx checkpoint
  desc  Checkpoint reached
  tags  ui reward platformer
@era 8bit
  tone   at=0     dur=0.09 gain=0.12 wave=pulse25 from=587 to=587  shape=flat
  tone   at=0.09  dur=0.09 gain=0.12 wave=pulse25 from=784 to=784  shape=flat
  tone   at=0.18  dur=0.34 gain=0.13 wave=pulse25 from=1175 to=1175 shape=exp
@era 16bit
  tone   at=0     dur=0.10 gain=0.10 wave=tri from=587 to=587 shape=exp
  tone   at=0.09  dur=0.10 gain=0.10 wave=tri from=784 to=784 shape=exp
  tone   at=0.18  dur=0.46 gain=0.11 wave=tri from=1175 to=1175 shape=exp
  tone   at=0.18  dur=0.46 gain=0.04 wave=saw from=2350 to=2350 shape=exp pan=0.3
  echo   send=0.40 time=0.11 fb=0.42
