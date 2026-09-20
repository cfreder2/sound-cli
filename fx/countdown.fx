# A race countdown tone. One of the three; play it three times then `go`.
@fx countdown
  desc  A countdown beep
  tags  racing ui
@era 8bit
  tone   at=0 dur=0.30 gain=0.13 wave=pulse50 from=440 to=440 shape=flat
@era 16bit
  tone   at=0 dur=0.34 gain=0.11 wave=tri from=440 to=440 shape=exp
  tone   at=0 dur=0.34 gain=0.04 wave=sine from=880 to=880 shape=exp pan=0.2
  echo   send=0.28 time=0.10 fb=0.30
