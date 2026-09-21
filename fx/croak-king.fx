# A very large frog croaking. The Frog King is two and a half tiles of him.
#
# Same construction as `croak` and every number moved the way size moves them:
# an octave down, the pulses further apart because a bigger throat is slower,
# one more of them because he is not in a hurry, and a longer tail. Nothing
# here is `croak` with the pitch knob turned -- a pitched-down croak sounds
# like a slowed tape, which is a different thing from a big animal.

@fx croak-king
  desc  A very large frog croaking -- a boss
  tags  animal frog boss axi
@vary pitch=0.04 gain=0.05

@era 8bit
  noise  at=0     dur=0.035 gain=0.07 from=1200 to=300 q=0.8 bed=long
  tone   at=0     dur=0.08 gain=0.18 wave=pulse50 from=124 to=116 shape=hit
  tone   at=0.09  dur=0.08 gain=0.18 wave=pulse50 from=120 to=112 shape=hit
  tone   at=0.18  dur=0.08 gain=0.16 wave=pulse50 from=116 to=107 shape=hit
  tone   at=0.27  dur=0.09 gain=0.14 wave=pulse50 from=111 to=100 shape=hit
  tone   at=0.36  dur=0.13 gain=0.11 wave=pulse50 from=105 to=88  shape=hit
  tone   at=0     dur=0.50 gain=0.09 wave=nestri from=62 to=52 shape=exp

@era 16bit
  noise  at=0     dur=0.04 gain=0.06 from=1400 to=260 q=0.9 bed=white
  tone   at=0     dur=0.09 gain=0.17 wave=saw from=126 to=117 shape=hit
  tone   at=0.09  dur=0.09 gain=0.17 wave=saw from=121 to=113 shape=hit
  tone   at=0.18  dur=0.09 gain=0.15 wave=saw from=117 to=107 shape=hit
  tone   at=0.27  dur=0.10 gain=0.13 wave=saw from=112 to=99  shape=hit
  tone   at=0.36  dur=0.15 gain=0.10 wave=saw from=106 to=84  shape=hit
  # Two bodies, a fifth apart, because one sine under a big animal reads as a
  # sub tone rather than as a chest.
  tone   at=0     dur=0.55 gain=0.10 wave=sine from=63 to=50 shape=exp
  tone   at=0     dur=0.45 gain=0.05 wave=tri  from=94 to=78 shape=exp
  echo   send=0.20 time=0.11 fb=0.26
