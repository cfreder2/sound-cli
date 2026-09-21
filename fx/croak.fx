# A frog croaking. AXI has three frogs in it and the library had none.
#
# A croak is not a tone, it is a RATE. The pitch barely moves; what you hear is
# the throat opening and closing about forty times a second, and the ear reads
# that pulsation as "frog" long before it reads the pitch. So the body is four
# short bursts of the same low note in quick succession rather than one held
# note with a wobble on it -- a tremolo sounds like a synthesiser being
# modulated, and four separate openings sound like an animal.

@fx croak
  desc  A frog croaking
  tags  animal frog axi
@vary pitch=0.06 gain=0.06

@era 8bit
  noise  at=0     dur=0.02 gain=0.05 from=1800 to=600 q=0.9 bed=long
  tone   at=0     dur=0.05 gain=0.15 wave=pulse25 from=250 to=235 shape=hit
  tone   at=0.055 dur=0.05 gain=0.15 wave=pulse25 from=240 to=228 shape=hit
  tone   at=0.11  dur=0.05 gain=0.13 wave=pulse25 from=232 to=218 shape=hit
  tone   at=0.165 dur=0.07 gain=0.10 wave=pulse25 from=222 to=196 shape=hit
  tone   at=0     dur=0.24 gain=0.05 wave=nestri  from=124 to=110 shape=exp

@era 16bit
  noise  at=0     dur=0.022 gain=0.045 from=2000 to=520 q=1.0 bed=white
  tone   at=0     dur=0.05 gain=0.14 wave=saw from=252 to=236 shape=hit
  tone   at=0.055 dur=0.05 gain=0.14 wave=saw from=241 to=227 shape=hit
  tone   at=0.11  dur=0.05 gain=0.12 wave=saw from=233 to=216 shape=hit
  tone   at=0.165 dur=0.08 gain=0.09 wave=saw from=221 to=192 shape=hit
  # The octave below is the throat rather than the voice: without it a croak is
  # a duck.
  tone   at=0     dur=0.26 gain=0.06 wave=sine from=125 to=104 shape=exp
  echo   send=0.10 time=0.06 fb=0.12
