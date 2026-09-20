# A creak. A narrow band of noise crawling upward -- the slowness is the
# tension, and any transient at the front destroys it.
@fx creak
  desc  Wood or a hinge creaking
  tags  horror world material
@vary pitch=0.12
@era 8bit
  noise  at=0 dur=0.85 gain=0.12 from=520 to=1500 q=3.2 bed=metal
  noise  at=0.35 dur=0.50 gain=0.06 from=900 to=1900 q=3.6 bed=metal
@era 16bit
  noise  at=0    dur=1.00 gain=0.11 from=480 to=1700 q=3.6 bed=white pan=-0.25
  noise  at=0.35 dur=0.62 gain=0.06 from=950 to=2200 q=4.0 bed=white pan=0.3
  tone   at=0    dur=0.95 gain=0.02 wave=sine from=120 to=150 shape=flat
  echo   send=0.34 time=0.18 fb=0.38
