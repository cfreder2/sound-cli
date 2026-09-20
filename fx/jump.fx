# A hop. Short rising pulse.

@fx jump
  desc  A hop -- a short rising pulse
  tags  movement platformer
@era 8bit
  tone   at=0  dur=0.13  gain=0.16  wave=pulse50 from=380  to=900  shape=lin
@era 16bit
  tone   at=0  dur=0.15  gain=0.13  wave=tri  from=380  to=940  shape=lin
  tone   at=0  dur=0.15  gain=0.05  wave=sine from=190  to=470  shape=lin
  noise  at=0  dur=0.03  gain=0.04  from=3000 to=900 q=1.2 bed=white
