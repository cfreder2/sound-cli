# Being swallowed. One big wet glug, going down.
#
# The whole sound is the pitch falling: a swallow is a cavity getting bigger
# behind whatever went into it, and a falling resonance is how the ear hears
# that. The click on the front is the throat closing, and it is the part that
# makes it a swallow rather than a drain.

@fx gulp
  desc  Being swallowed -- one wet descending glug
  tags  animal body axi
@vary pitch=0.06 gain=0.05

@era 8bit
  noise  at=0     dur=0.03 gain=0.09 from=1400 to=280 q=1.2 bed=long
  tone   at=0.01  dur=0.18 gain=0.15 wave=pulse50 from=420 to=95 shape=exp
  tone   at=0.01  dur=0.22 gain=0.07 wave=nestri from=210 to=58 shape=exp
  noise  at=0.14  dur=0.10 gain=0.04 from=600 to=160 q=1.6 bed=long

@era 16bit
  noise  at=0     dur=0.035 gain=0.08 from=1600 to=240 q=1.3 bed=white
  tone   at=0.01  dur=0.20 gain=0.14 wave=sine from=440 to=88 shape=exp
  tone   at=0.01  dur=0.26 gain=0.08 wave=tri  from=220 to=52 shape=exp
  # A second, smaller swallow underneath, slightly late: one glug is a bubble,
  # two is a throat.
  tone   at=0.09  dur=0.16 gain=0.06 wave=sine from=300 to=70 shape=exp
  noise  at=0.15  dur=0.12 gain=0.035 from=520 to=140 q=1.8 bed=white
  echo   send=0.14 time=0.09 fb=0.20
