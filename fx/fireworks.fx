# A fireworks display, about seven seconds, built from six shells at three
# apparent distances.
#
# Distance is the whole problem, and it is not volume. Three things change with
# it, and all three are set per layer here:
#
#   the crack      air absorbs high frequencies, so a near shell has a sharp
#                  transient and a far one has none at all
#   the pitch      what survives the trip is the low end, so far shells sit
#                  an octave or more below near ones
#   the wet/dry    `send=` per layer. Near shells are dry; far ones are mostly
#                  reflection, which is what puts them behind the near ones
#                  rather than merely under them
#
# Pan spreads them left and right. Launch whistles precede each burst by about
# half a second, and the crackle tails overlap on purpose.
@fx fireworks
  desc  A fireworks display -- six shells, near and far
  tags  ambience explosion celebration

@era 8bit
  # shell 1 -- near, centre
  noise  at=0     dur=0.50  gain=0.06 from=900 to=3000 q=2.8 bed=metal
  noise  at=0.52  dur=0.014 gain=0.20 from=9000 to=2600 q=1.0 bed=metal
  noise  at=0.52  dur=0.42  gain=0.17 from=2600 to=200  q=0.7 bed=long
  noise  at=0.70  dur=0.02  gain=0.09 from=5000 to=1600 q=2.2 bed=metal
  noise  at=0.86  dur=0.02  gain=0.07 from=4400 to=1400 q=2.2 bed=metal
  noise  at=1.03  dur=0.02  gain=0.06 from=5200 to=1650 q=2.2 bed=metal
  # shell 2 -- far left. no crack at all
  noise  at=1.08  dur=0.52  gain=0.04 from=800 to=2400 q=3.0 bed=metal
  noise  at=1.74  dur=0.75  gain=0.13 from=700 to=90  q=0.7 bed=long shape=lin
  tone   at=1.76  dur=0.55  gain=0.07 wave=pulse50 from=120 to=42 shape=exp
  # shells 3 and 4 -- mid, overlapping
  noise  at=2.10  dur=0.48  gain=0.05 from=900 to=2800 q=2.8 bed=metal
  noise  at=2.70  dur=0.012 gain=0.13 from=7000 to=2200 q=1.1 bed=metal
  noise  at=2.70  dur=0.50  gain=0.15 from=1800 to=150 q=0.7 bed=long
  noise  at=2.92  dur=0.55  gain=0.12 from=1500 to=130 q=0.7 bed=long
  noise  at=3.02  dur=0.02  gain=0.07 from=4600 to=1500 q=2.2 bed=metal
  noise  at=3.20  dur=0.02  gain=0.06 from=4000 to=1300 q=2.2 bed=metal
  noise  at=3.38  dur=0.02  gain=0.05 from=4800 to=1550 q=2.2 bed=metal
  # shell 5 -- near, the big one
  noise  at=4.15  dur=0.50  gain=0.06 from=950 to=3200 q=2.8 bed=metal
  noise  at=4.82  dur=0.016 gain=0.22 from=9500 to=2800 q=1.0 bed=metal
  noise  at=4.82  dur=0.70  gain=0.19 from=3000 to=130  q=0.7 bed=long
  tone   at=4.82  dur=0.34  gain=0.09 wave=pulse50 from=160 to=44 shape=hit
  noise  at=5.02  dur=0.02  gain=0.10 from=5400 to=1700 q=2.2 bed=metal
  noise  at=5.19  dur=0.02  gain=0.08 from=4600 to=1450 q=2.2 bed=metal
  noise  at=5.37  dur=0.02  gain=0.07 from=5000 to=1600 q=2.2 bed=metal
  noise  at=5.56  dur=0.02  gain=0.05 from=4200 to=1350 q=2.2 bed=metal
  # shell 6 -- far right, last
  noise  at=5.90  dur=0.80  gain=0.12 from=650 to=80 q=0.7 bed=long shape=lin
  tone   at=5.92  dur=0.60  gain=0.06 wave=pulse50 from=105 to=38 shape=exp

@era 16bit
  # shell 1 -- near, centre, dry
  noise  at=0     dur=0.50  gain=0.05 from=850 to=3400 q=3.0 bed=white send=0.10
  tone   at=0     dur=0.50  gain=0.04 wave=saw from=660 to=2000 shape=flat send=0.10
  noise  at=0.52  dur=0.015 gain=0.19 from=11000 to=3000 q=1.0 bed=white send=0.08
  noise  at=0.52  dur=0.55  gain=0.17 from=3000  to=170  q=0.7 bed=white send=0.10
  tone   at=0.52  dur=0.28  gain=0.07 wave=sine from=155 to=44 shape=hit send=0.10
  noise  at=0.70  dur=0.02  gain=0.09 from=5600 to=1700 q=2.4 bed=white pan=-0.3 send=0.14
  noise  at=0.86  dur=0.02  gain=0.07 from=4800 to=1500 q=2.4 bed=white pan=0.35 send=0.14
  noise  at=1.03  dur=0.02  gain=0.06 from=5800 to=1750 q=2.4 bed=white pan=-0.15 send=0.14
  # shell 2 -- far left. no crack, low, and mostly reflection
  noise  at=1.08  dur=0.55  gain=0.03 from=780 to=2600 q=3.2 bed=white pan=-0.5 send=0.30
  noise  at=1.74  dur=0.95  gain=0.12 from=640 to=72 q=0.7 bed=white pan=-0.55 shape=lin send=0.55
  tone   at=1.76  dur=0.70  gain=0.07 wave=sine from=118 to=36 shape=exp pan=-0.45 send=0.55
  # shells 3 and 4 -- mid, overlapping, half wet
  noise  at=2.10  dur=0.48  gain=0.04 from=880 to=3000 q=3.0 bed=white pan=0.4 send=0.22
  noise  at=2.70  dur=0.013 gain=0.12 from=8000 to=2400 q=1.1 bed=white pan=0.35 send=0.20
  noise  at=2.70  dur=0.65  gain=0.14 from=2000 to=120 q=0.7 bed=white pan=0.4  send=0.30
  noise  at=2.92  dur=0.72  gain=0.11 from=1600 to=105 q=0.7 bed=white pan=-0.4 send=0.34
  noise  at=3.02  dur=0.02  gain=0.07 from=5200 to=1600 q=2.4 bed=white pan=0.5  send=0.26
  noise  at=3.20  dur=0.02  gain=0.06 from=4400 to=1400 q=2.4 bed=white pan=-0.45 send=0.26
  noise  at=3.38  dur=0.02  gain=0.05 from=5400 to=1650 q=2.4 bed=white pan=0.2  send=0.26
  # shell 5 -- near, the big one, dry and wide
  noise  at=4.15  dur=0.50  gain=0.05 from=900 to=3600 q=3.0 bed=white send=0.10
  tone   at=4.15  dur=0.50  gain=0.04 wave=saw from=700 to=2300 shape=flat send=0.10
  noise  at=4.82  dur=0.018 gain=0.21 from=12000 to=3400 q=1.0 bed=white send=0.06
  noise  at=4.82  dur=0.90  gain=0.19 from=3400  to=110  q=0.7 bed=white send=0.12
  tone   at=4.82  dur=0.42  gain=0.10 wave=sine from=165 to=38 shape=hit send=0.10
  noise  at=5.02  dur=0.02  gain=0.10 from=6000 to=1800 q=2.4 bed=white pan=-0.4 send=0.16
  noise  at=5.19  dur=0.02  gain=0.08 from=5000 to=1550 q=2.4 bed=white pan=0.45 send=0.16
  noise  at=5.37  dur=0.02  gain=0.07 from=5600 to=1700 q=2.4 bed=white pan=-0.25 send=0.16
  noise  at=5.56  dur=0.02  gain=0.05 from=4600 to=1450 q=2.4 bed=white pan=0.3  send=0.16
  # shell 6 -- far right, last
  noise  at=5.90  dur=1.00  gain=0.11 from=600 to=66 q=0.7 bed=white pan=0.55 shape=lin send=0.55
  tone   at=5.92  dur=0.75  gain=0.06 wave=sine from=102 to=32 shape=exp pan=0.45 send=0.55
  echo   send=1.0 time=0.29 fb=0.50 damp=2600
