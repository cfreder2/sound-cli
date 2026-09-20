# Magic sparkle. Five inharmonic pings scattered across the stereo field and
# across 200 ms -- scatter is the entire effect.
@fx sparkle
  desc  A magical shimmer
  tags  rpg magic fantasy ui
@vary pitch=0.10
@era 8bit
  tone   at=0     dur=0.14 gain=0.09 wave=pulse12 from=2637 to=2620 shape=hit
  tone   at=0.05  dur=0.13 gain=0.08 wave=pulse12 from=3520 to=3500 shape=hit
  tone   at=0.10  dur=0.12 gain=0.07 wave=pulse12 from=3136 to=3110 shape=hit
  tone   at=0.16  dur=0.11 gain=0.06 wave=pulse12 from=4186 to=4160 shape=hit
  tone   at=0.21  dur=0.16 gain=0.05 wave=pulse12 from=5274 to=5240 shape=hit
@era 16bit
  tone   at=0     dur=0.28 gain=0.08 wave=sine from=2637 to=2620 shape=hit pan=-0.35
  tone   at=0.05  dur=0.26 gain=0.07 wave=sine from=3520 to=3500 shape=hit pan=0.3
  tone   at=0.10  dur=0.24 gain=0.07 wave=sine from=3136 to=3110 shape=hit pan=-0.1
  tone   at=0.16  dur=0.22 gain=0.05 wave=sine from=4186 to=4160 shape=hit pan=0.4
  tone   at=0.21  dur=0.32 gain=0.05 wave=sine from=5274 to=5240 shape=hit pan=-0.2
  echo   send=0.50 time=0.11 fb=0.48
