# A block. Metal's inharmonic partials, cut short -- a parry is a clang that
# is not allowed to ring.
@fx block
  desc  A blocked or parried blow
  tags  fighting combat
@vary pitch=0.07 gain=0.08
@era 8bit
  noise  at=0 dur=0.03 gain=0.16 from=7000 to=2200 q=1.5 bed=metal
  tone   at=0 dur=0.13 gain=0.11 wave=pulse50 from=680 to=660 shape=hit
  tone   at=0 dur=0.09 gain=0.06 wave=pulse12 from=1880 to=1850 shape=hit
@era 16bit
  noise  at=0 dur=0.03 gain=0.14 from=8500 to=2600 q=1.6 bed=white
  tone   at=0 dur=0.22 gain=0.10 wave=sine from=690 to=670 shape=hit
  tone   at=0 dur=0.16 gain=0.06 wave=sine from=1900 to=1870 shape=hit pan=0.25
  tone   at=0 dur=0.11 gain=0.03 wave=sine from=3720 to=3680 shape=hit pan=-0.2
  echo   send=0.26 time=0.10 fb=0.30
