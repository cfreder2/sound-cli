# A door creaking open on a dry hinge, then stopping against the frame.
#
# A creak is not a glide. The hinge sticks, the door keeps pushing, the hinge
# lets go -- stick-slip, over and over, a few dozen times a second. What you
# hear is a run of short resonant grabs, not a smooth sweep, which is why
# `creak` (a noise band crawling upward) sounds like a theremin next to this.
#
# The grabs speed up as the door gets moving, spread out again as it slows, and
# rise in pitch throughout because a tightening hinge resonates higher. Then
# the door meets the frame and it is over.
#
# The grab gains look large next to everything else in this library. A bandpass
# at Q 5.5 throws away about 30 dB, so a grab written at 0.10 arrives 20 dB
# under the closing thud and is not heard at all. These are written at what
# they need to be after the filter, not before it.
@fx door-creak
  desc  A door creaking open and stopping
  tags  horror world material
@vary pitch=0.07 gain=0.10
@era 8bit
  noise  at=0     dur=0.035 gain=0.66 from=520  to=470  q=5.0 bed=metal filter=bandpass
  noise  at=0.10  dur=0.032 gain=0.72 from=560  to=505  q=5.0 bed=metal filter=bandpass
  noise  at=0.18  dur=0.030 gain=0.72 from=610  to=550  q=5.2 bed=metal filter=bandpass
  noise  at=0.245 dur=0.028 gain=0.78 from=670  to=600  q=5.2 bed=metal filter=bandpass
  noise  at=0.30  dur=0.026 gain=0.78 from=740  to=665  q=5.4 bed=metal filter=bandpass
  noise  at=0.35  dur=0.026 gain=0.72 from=810  to=730  q=5.4 bed=metal filter=bandpass
  noise  at=0.40  dur=0.026 gain=0.72 from=880  to=790  q=5.4 bed=metal filter=bandpass
  noise  at=0.455 dur=0.028 gain=0.66 from=950  to=855  q=5.2 bed=metal filter=bandpass
  noise  at=0.52  dur=0.030 gain=0.66 from=1020 to=920  q=5.2 bed=metal filter=bandpass
  noise  at=0.60  dur=0.032 gain=0.6 from=1080 to=970  q=5.0 bed=metal filter=bandpass
  noise  at=0.70  dur=0.034 gain=0.54 from=1140 to=1025 q=5.0 bed=metal filter=bandpass
  noise  at=0.83  dur=0.036 gain=0.48 from=1190 to=1070 q=4.8 bed=metal filter=bandpass
  noise  at=0.99  dur=0.038 gain=0.36 from=1230 to=1105 q=4.8 bed=metal filter=bandpass
  noise  at=1.18  dur=0.040 gain=0.3 from=1260 to=1130 q=4.6 bed=metal filter=bandpass
  noise  at=1.44  dur=0.05  gain=0.14 from=900  to=180  q=1.2 bed=long
  tone   at=1.44  dur=0.13  gain=0.075 wave=pulse50 from=150 to=62 shape=hit
@era 16bit
  noise  at=0     dur=0.038 gain=0.6 from=520  to=465  q=5.4 bed=white filter=bandpass pan=-0.3
  noise  at=0.10  dur=0.034 gain=0.66 from=560  to=500  q=5.4 bed=white filter=bandpass pan=-0.28
  noise  at=0.18  dur=0.032 gain=0.66 from=610  to=545  q=5.6 bed=white filter=bandpass pan=-0.25
  noise  at=0.245 dur=0.030 gain=0.72 from=670  to=598  q=5.6 bed=white filter=bandpass pan=-0.2
  noise  at=0.30  dur=0.028 gain=0.72 from=740  to=662  q=5.8 bed=white filter=bandpass pan=-0.15
  noise  at=0.35  dur=0.028 gain=0.66 from=810  to=725  q=5.8 bed=white filter=bandpass pan=-0.1
  noise  at=0.40  dur=0.028 gain=0.66 from=880  to=788  q=5.8 bed=white filter=bandpass
  noise  at=0.455 dur=0.030 gain=0.6 from=950  to=850  q=5.6 bed=white filter=bandpass pan=0.08
  noise  at=0.52  dur=0.032 gain=0.6 from=1020 to=915  q=5.6 bed=white filter=bandpass pan=0.14
  noise  at=0.60  dur=0.034 gain=0.54 from=1080 to=968  q=5.4 bed=white filter=bandpass pan=0.2
  noise  at=0.70  dur=0.036 gain=0.48 from=1140 to=1020 q=5.4 bed=white filter=bandpass pan=0.24
  noise  at=0.83  dur=0.038 gain=0.42 from=1190 to=1065 q=5.2 bed=white filter=bandpass pan=0.28
  noise  at=0.99  dur=0.040 gain=0.33 from=1230 to=1100 q=5.2 bed=white filter=bandpass pan=0.3
  noise  at=1.18  dur=0.044 gain=0.27 from=1260 to=1125 q=5.0 bed=white filter=bandpass pan=0.32
  noise  at=1.44  dur=0.06  gain=0.13 from=1000 to=160  q=1.2 bed=white
  tone   at=1.44  dur=0.16  gain=0.075 wave=sine from=155 to=56 shape=hit
  tone   at=1.44  dur=0.30  gain=0.04 wave=sine from=78  to=44 shape=hit
  echo   send=0.40 time=0.21 fb=0.44
