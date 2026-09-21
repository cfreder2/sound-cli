# A tongue lashing out and snapping back. The Frog King's reach attack.
#
# `slash` is the nearest thing the library had and it is a blade: metal, dry,
# and it rings. A tongue is wet and elastic and it does not ring -- it goes out
# on a rising slither, lands with a slap, and comes back faster than it went.

@fx tongue
  desc  A tongue lashing out and snapping back
  tags  animal frog attack axi
@vary pitch=0.05 gain=0.05

@era 8bit
  # out: rising, because something leaving you rises
  noise  at=0     dur=0.10 gain=0.07 from=700  to=2600 q=1.4 bed=long
  tone   at=0     dur=0.10 gain=0.09 wave=pulse12 from=320 to=900 shape=lin
  # the slap at full stretch
  noise  at=0.10  dur=0.05 gain=0.13 from=2400 to=420 q=0.9 bed=long
  # back: faster, and falling
  noise  at=0.16  dur=0.06 gain=0.06 from=2600 to=600 q=1.4 bed=long
  tone   at=0.16  dur=0.06 gain=0.06 wave=pulse12 from=880 to=300 shape=exp

@era 16bit
  noise  at=0     dur=0.11 gain=0.06 from=650  to=2800 q=1.5 bed=white
  tone   at=0     dur=0.11 gain=0.08 wave=saw from=310 to=940 shape=lin
  tone   at=0     dur=0.11 gain=0.04 wave=sine from=155 to=470 shape=lin
  noise  at=0.11  dur=0.06 gain=0.12 from=2600 to=380 q=0.8 bed=white
  tone   at=0.11  dur=0.09 gain=0.07 wave=sine from=240 to=90 shape=hit
  noise  at=0.17  dur=0.06 gain=0.05 from=2800 to=560 q=1.5 bed=white pan=-0.2
  tone   at=0.17  dur=0.06 gain=0.05 wave=saw from=900 to=290 shape=exp
  echo   send=0.12 time=0.08 fb=0.15
