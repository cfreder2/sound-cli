# Wood struck. 20 ms of bandpassed noise and a tone gone in about a tenth of a
# second. Longer decay reads as metal; lower pitch reads as a drum.

@fx wood
  desc  Wood struck -- a knock, a block, a hit on a crate
  tags  impact material

@vary pitch=0.06 gain=0.06

@era 8bit
  noise  at=0      dur=0.02  gain=0.15  from=2400 to=1200 q=2.2 bed=long
  tone   at=0      dur=0.09  gain=0.13  wave=pulse50 from=840 to=600 shape=hit
  tone   at=0      dur=0.06  gain=0.06  wave=pulse25 from=1680 to=1200 shape=hit

@era 16bit
  noise  at=0      dur=0.022 gain=0.14  from=3000 to=1400 q=2.4 bed=white  filter=bandpass
  tone   at=0      dur=0.11  gain=0.12  wave=tri  from=840  to=610 shape=hit
  tone   at=0      dur=0.07  gain=0.05  wave=sine from=1680 to=1230 shape=hit pan=0.15
  tone   at=0      dur=0.16  gain=0.04  wave=sine from=220  to=180 shape=hit
  echo   send=0.14 time=0.06 fb=0.20
