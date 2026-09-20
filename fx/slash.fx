# Sword swing. A whoosh is a noise band sweeping UP then the tail falling --
# here the up-sweep is the swing and the metal ring is the blade.
@fx slash
  desc  A blade swung, and its ring
  tags  weapon melee
@vary pitch=0.07
@era 8bit
  noise  at=0     dur=0.13 gain=0.14 from=700  to=4200 q=1.8 bed=long
  noise  at=0.10  dur=0.10 gain=0.08 from=5000 to=1200 q=1.6 bed=metal
  tone   at=0.10  dur=0.20 gain=0.05 wave=pulse12 from=2400 to=2340 shape=hit
@era 16bit
  noise  at=0     dur=0.15 gain=0.13 from=700  to=5000 q=2.0 bed=white pan=-0.3
  noise  at=0.11  dur=0.14 gain=0.08 from=6000 to=1400 q=1.8 bed=white pan=0.3
  tone   at=0.11  dur=0.45 gain=0.05 wave=sine from=2400 to=2370 shape=hit
  tone   at=0.11  dur=0.30 gain=0.03 wave=sine from=6620 to=6550 shape=hit pan=0.25
  echo   send=0.30 time=0.12 fb=0.34
