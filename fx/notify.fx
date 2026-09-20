# A notification. Two tones a fourth apart, quiet and short.

@fx notify
  desc  A notification chime
  tags  strategy sim ui
@era 8bit
  tone   at=0    dur=0.08 gain=0.09 wave=pulse25 from=1047 to=1047 shape=exp
  tone   at=0.08 dur=0.22 gain=0.09 wave=pulse25 from=1397 to=1397 shape=exp
@era 16bit
  tone   at=0    dur=0.09 gain=0.08 wave=sine from=1047 to=1047 shape=exp
  tone   at=0.08 dur=0.30 gain=0.08 wave=sine from=1397 to=1397 shape=exp pan=0.15
  echo   send=0.36 time=0.10 fb=0.36
