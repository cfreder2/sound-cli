# Drinking. Three gulps falling in pitch as the bottle empties, then the cork.
@fx potion
  desc  Drinking a potion
  tags  rpg item water
@era 8bit
  tone   at=0    dur=0.10 gain=0.11 wave=sine from=520 to=300 shape=hit
  tone   at=0.15 dur=0.10 gain=0.10 wave=sine from=470 to=270 shape=hit
  tone   at=0.30 dur=0.11 gain=0.09 wave=sine from=420 to=240 shape=hit
  noise  at=0.48 dur=0.03 gain=0.11 from=2600 to=800 q=2.0 bed=metal
@era 16bit
  tone   at=0    dur=0.12 gain=0.10 wave=sine from=530 to=290 shape=hit
  noise  at=0    dur=0.09 gain=0.04 from=1800 to=600 q=1.6 bed=white
  tone   at=0.15 dur=0.12 gain=0.09 wave=sine from=480 to=260 shape=hit
  tone   at=0.30 dur=0.13 gain=0.08 wave=sine from=430 to=230 shape=hit
  noise  at=0.48 dur=0.03 gain=0.10 from=3000 to=760 q=2.2 bed=white pan=0.2
  tone   at=0.48 dur=0.16 gain=0.04 wave=sine from=900 to=860 shape=hit
  echo   send=0.28 time=0.09 fb=0.30
