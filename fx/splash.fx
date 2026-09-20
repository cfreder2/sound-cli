# Water splashing.
#
# A splash is TWO events, not one: the body going in, and the spray coming
# back down. The 8-bit version can only afford a short second layer; the
# 16-bit one lets the spray ring on, spreads it in stereo, and adds a low
# thunk for the mass of the thing that fell in.
@fx splash
  desc  Water splashing -- body impact, then spray falling back
  tags  water impact

@era 8bit
  noise  at=0      dur=0.22  gain=0.24  from=900   to=120   q=0.8  bed=long
  noise  at=0.05   dur=0.26  gain=0.11  from=2600  to=700   q=1.3  bed=metal

@era 16bit
  noise  at=0      dur=0.30  gain=0.22  from=1500  to=150   q=0.9  bed=white
  noise  at=0.04   dur=0.55  gain=0.13  from=4200  to=800   q=1.7  bed=white  pan=0.3
  noise  at=0.09   dur=0.45  gain=0.09  from=3200  to=600   q=1.7  bed=white  pan=-0.3
  tone   at=0.005  dur=0.14  gain=0.06  wave=sine  from=380  to=120  shape=hit
  echo   send=0.22 time=0.08 fb=0.28
