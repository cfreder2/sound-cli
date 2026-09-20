# Landing ON something. A thud with a squash: the descending tone is the thing
# being flattened.
@fx stomp
  desc  Stomping an enemy
  tags  platformer combat
@vary pitch=0.08 gain=0.08
@era 8bit
  noise  at=0     dur=0.05 gain=0.16 from=2200 to=300 q=1.0 bed=long
  tone   at=0     dur=0.12 gain=0.14 wave=pulse50 from=340 to=80 shape=hit
  tone   at=0.03  dur=0.10 gain=0.07 wave=pulse12 from=700 to=200 shape=hit
@era 16bit
  noise  at=0     dur=0.06 gain=0.15 from=2800 to=280 q=1.1 bed=white
  tone   at=0     dur=0.15 gain=0.13 wave=saw from=360 to=72 shape=hit
  tone   at=0.03  dur=0.12 gain=0.06 wave=sine from=740 to=180 shape=hit pan=0.2
  echo   send=0.18 time=0.07 fb=0.24
