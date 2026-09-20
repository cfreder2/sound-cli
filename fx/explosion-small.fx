# A grenade or small charge. Short, with most of the energy in the crack rather
# than the body: small charges have little low end to give.
@fx explosion-small
  desc  A small charge -- grenade, satchel
  tags  weapon impact explosion
@vary pitch=0.07 gain=0.08
@era 8bit
  noise  at=0     dur=0.010 gain=0.22 from=9000 to=3600 q=1.0 bed=metal
  noise  at=0     dur=0.22  gain=0.20 from=3000 to=260  q=0.8 bed=long
  tone   at=0     dur=0.13  gain=0.09 wave=pulse50 from=240 to=70 shape=hit
@era 16bit
  noise  at=0     dur=0.011 gain=0.20 from=11000 to=4000 q=1.0 bed=white
  noise  at=0     dur=0.28  gain=0.19 from=3400  to=230  q=0.8 bed=white
  noise  at=0.02  dur=0.34  gain=0.08 from=1800  to=400  q=1.0 bed=white pan=0.28
  tone   at=0     dur=0.17  gain=0.10 wave=sine from=250 to=62 shape=hit
  echo   send=0.22 time=0.09 fb=0.28
