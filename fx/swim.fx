# One swimming stroke: the pull through, then the arm coming back for the next.
#
# Two swishes, and both of them SWELL. That is the whole effect, and it is what
# `rise` is for. A noise layer with no rise is at full amplitude on its first
# sample, and an onset arriving in the middle of a sound is something being
# STRUCK -- which is what this used to be: a bright burst at 0.19 s that came up
# 25 dB in ten milliseconds and was the loudest thing in the effect, so the
# stroke ended on a slap. Water moved through has no onset anywhere in it. It
# fades up, peaks where the hand is fastest, and fades away.
#
# The recovery is quieter and no brighter than the pull, never louder. It is an
# arm coming back, not a second and bigger event; let it out-peak the pull and
# the ear hears an impact at the end however soft its edges are.
#
# Both filters sweep DOWN, so each swish darkens as it passes rather than
# spraying. The 3.2 kHz sweep the old recovery layer had was most of why it
# read as a hit -- the ear places bright and sudden as hard and close.

@fx swim
  desc  A swimming stroke
  tags  water movement
@vary pitch=0.08 gain=0.12
@era 8bit
  noise  at=0     dur=0.26 gain=0.14  rise=0.07 from=900  to=260 q=0.9 bed=long
  noise  at=0.18  dur=0.26 gain=0.085 rise=0.09 from=1000 to=320 q=0.9 bed=long
@era 16bit
  noise  at=0     dur=0.28 gain=0.13  rise=0.07 from=880  to=240 q=0.9 bed=white pan=-0.18
  noise  at=0.19  dur=0.28 gain=0.080 rise=0.09 from=1020 to=300 q=0.9 bed=white pan=0.22
  noise  at=0     dur=0.46 gain=0.030 rise=0.10 from=240  to=170 q=0.8 bed=white
  echo   send=0.20 time=0.09 fb=0.28
