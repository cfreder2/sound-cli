# A small friendly voice. Masie, when she has something to say.
#
# Not a word and not a beep. It rises and then falls inside a fifth of a
# second, which is the shape of a question, and it is a sine rather than a
# pulse because a pulse at this pitch is a menu and a sine at this pitch is an
# animal.

@fx chirp
  desc  A small friendly voice -- one syllable
  tags  voice creature axi
@vary pitch=0.07 gain=0.07

@era 8bit
  tone   at=0     dur=0.07 gain=0.11 wave=pulse25 from=620 to=980 shape=flat
  tone   at=0.07  dur=0.09 gain=0.10 wave=pulse25 from=980 to=700 shape=exp
  tone   at=0     dur=0.14 gain=0.04 wave=nestri from=310 to=350 shape=exp

@era 16bit
  noise  at=0     dur=0.012 gain=0.025 from=3600 to=1400 q=1.2 bed=white
  tone   at=0     dur=0.07 gain=0.10 wave=sine from=640 to=1010 shape=flat
  tone   at=0.07  dur=0.10 gain=0.09 wave=sine from=1010 to=690 shape=exp
  # The octave under is what stops it being a whistle.
  tone   at=0     dur=0.16 gain=0.045 wave=tri from=320 to=345 shape=exp
  echo   send=0.10 time=0.07 fb=0.12
