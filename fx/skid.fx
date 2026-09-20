# Tyres losing grip. A resonant band that rises as the slide develops, which is
# the rubber's contact patch shrinking.
@fx skid
  desc  Tyres skidding
  tags  racing vehicle
@vary pitch=0.08
@era 8bit
  noise  at=0 dur=0.70 gain=0.15 from=1400 to=2600 q=2.6 bed=metal
  noise  at=0 dur=0.70 gain=0.06 from=400  to=700  q=1.2 bed=long
@era 16bit
  noise  at=0    dur=0.85 gain=0.14 from=1300 to=2900 q=3.0 bed=white pan=-0.3
  noise  at=0.06 dur=0.78 gain=0.08 from=1600 to=3200 q=3.0 bed=white pan=0.3
  noise  at=0    dur=0.85 gain=0.05 from=380  to=650  q=1.3 bed=white
  echo   send=0.20 time=0.10 fb=0.28
