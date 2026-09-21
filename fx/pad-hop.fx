# Landing on something floating. A lily pad, a raft, a log on water.
#
# `land` is ground and `thud-wet` is a body hitting mud; neither is a footfall
# on something that then MOVES. The difference is entirely in the tail: the
# impact is soft and short, and behind it the thing you landed on dips and the
# water round it slaps back. Without that second half it is just a quiet land.

@fx pad-hop
  desc  Landing on a lily pad or a raft -- soft, and it dips
  tags  platformer water footstep axi
@vary pitch=0.07 gain=0.09

@era 8bit
  noise  at=0     dur=0.035 gain=0.07 from=1100 to=260 q=1.0 bed=long
  tone   at=0     dur=0.09 gain=0.07 wave=nestri from=170 to=96 shape=hit
  noise  at=0.05  dur=0.10 gain=0.035 from=2600 to=700 q=1.4 bed=long off=0.42

@era 16bit
  noise  at=0     dur=0.04 gain=0.065 from=1200 to=220 q=1.0 bed=white
  tone   at=0     dur=0.10 gain=0.065 wave=sine from=175 to=88 shape=hit
  # the dip: the pad sinking and coming back, a slow wobble under the impact
  tone   at=0.02  dur=0.22 gain=0.035 wave=sine from=74 to=58 shape=exp
  # and the water closing round the edge of it
  noise  at=0.05  dur=0.12 gain=0.03 from=2800 to=620 q=1.5 bed=white off=0.42 pan=0.2
  echo   send=0.08 time=0.06 fb=0.10
