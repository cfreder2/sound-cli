# Leaves moving. Climbing a vine, or something going through undergrowth.
#
# No pitch at all -- a leaf has no note. It is three short bands of filtered
# noise at slightly different heights and slightly different times, because
# leaves do not all move at once, and the irregularity IS the sound. Made even
# and it becomes a hi-hat.

@fx rustle
  desc  Leaves moving -- climbing, or undergrowth
  tags  nature foliage axi
@vary pitch=0.10 gain=0.12

@era 8bit
  noise  at=0     dur=0.05 gain=0.05 from=5200 to=2400 q=1.6 bed=long
  noise  at=0.03  dur=0.06 gain=0.04 from=3800 to=1800 q=1.8 bed=long off=0.31
  noise  at=0.07  dur=0.05 gain=0.03 from=6000 to=2800 q=1.5 bed=long off=0.67

@era 16bit
  noise  at=0     dur=0.06 gain=0.045 from=5400 to=2200 q=1.7 bed=white
  noise  at=0.025 dur=0.07 gain=0.035 from=3600 to=1600 q=2.0 bed=white off=0.31 pan=-0.25
  noise  at=0.065 dur=0.06 gain=0.028 from=6400 to=2600 q=1.6 bed=white off=0.67 pan=0.3
