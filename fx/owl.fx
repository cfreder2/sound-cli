# An owl hooting. Three parts: a short hoo, a pause, then a longer one that
# rises and falls away.
#
# Nearly a pure tone. An owl has almost no harmonics above the second, which is
# why a square or a saw reads as a duck and a sine reads as an owl. The breath
# underneath is a tenth the level of the tone and does most of the work of
# making it an animal.
@fx owl
  desc  An owl hooting
  tags  animal nature ambience
@vary pitch=0.05 gain=0.08
@era 8bit
  tone   at=0     dur=0.26 gain=0.13 wave=nestri from=430 to=414 shape=exp
  tone   at=0     dur=0.20 gain=0.03 wave=nestri from=860 to=828 shape=exp
  noise  at=0     dur=0.09 gain=0.020 from=900 to=620 q=2.4 bed=long
  tone   at=0.50  dur=0.14 gain=0.11 wave=nestri from=436 to=468 shape=flat
  tone   at=0.64  dur=0.52 gain=0.13 wave=nestri from=468 to=396 shape=exp
  tone   at=0.64  dur=0.40 gain=0.03 wave=nestri from=936 to=792 shape=exp
  noise  at=0.50  dur=0.09 gain=0.018 from=880 to=600 q=2.4 bed=long
@era 16bit
  tone   at=0     dur=0.30 gain=0.12 wave=sine from=430 to=412 shape=exp
  tone   at=0     dur=0.22 gain=0.030 wave=sine from=860 to=824 shape=exp pan=0.15
  noise  at=0     dur=0.10 gain=0.018 from=1000 to=640 q=2.6 bed=white
  tone   at=0.50  dur=0.15 gain=0.10 wave=sine from=434 to=470 shape=flat
  tone   at=0.65  dur=0.60 gain=0.12 wave=sine from=470 to=392 shape=exp
  tone   at=0.65  dur=0.44 gain=0.028 wave=sine from=940 to=784 shape=exp pan=-0.2
  noise  at=0.50  dur=0.10 gain=0.016 from=960 to=620 q=2.6 bed=white
  echo   send=0.46 time=0.26 fb=0.46
