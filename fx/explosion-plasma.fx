# An energy detonation. Tonal rather than broadband: two detuned tones falling
# together, so the beat between them survives the whole decay. Chemical
# explosions are noise with a tone under them; this is the reverse.
@fx explosion-plasma
  desc  An energy or plasma detonation
  tags  weapon scifi explosion
@vary pitch=0.06
@era 8bit
  noise  at=0     dur=0.02 gain=0.16 from=9000 to=2000 q=1.1 bed=metal
  tone   at=0     dur=0.55 gain=0.14 wave=pulse25 from=900 to=70 shape=hit
  tone   at=0     dur=0.55 gain=0.10 wave=pulse25 from=930 to=74 shape=hit
  tone   at=0     dur=0.34 gain=0.06 wave=pulse12 from=1800 to=140 shape=hit
@era 16bit
  noise  at=0     dur=0.02 gain=0.14 from=11000 to=2200 q=1.1 bed=white
  tone   at=0     dur=0.70 gain=0.13 wave=saw from=920 to=62 shape=hit pan=-0.3
  tone   at=0     dur=0.70 gain=0.10 wave=saw from=952 to=67 shape=hit pan=0.3
  tone   at=0     dur=0.45 gain=0.06 wave=sine from=1840 to=124 shape=hit
  tone   at=0     dur=0.80 gain=0.05 wave=sine from=230 to=36 shape=hit
  echo   send=0.44 time=0.17 fb=0.46
