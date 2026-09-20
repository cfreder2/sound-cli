# A ghost wailing.
#
# One long glide up and back down with no attack at all -- a wail has no
# beginning, it is already happening when you notice it, so the first layer
# fades in over half a second rather than starting.
#
# Two voices six cents apart, which beat against each other slowly and are most
# of why it sounds wrong rather than merely sad. The partials a fifth and an
# octave above move with the fundamental, which is what makes it a voice; hold
# them still and it becomes an organ. Drenched in echo, because distance is the
# whole idea.
@fx ghost
  desc  A ghost wailing
  tags  horror halloween ambience
@vary pitch=0.04
@era 8bit
  tone   at=0     dur=0.60 gain=0.05 wave=pulse50 from=300 to=430 shape=flat
  tone   at=0.60  dur=0.70 gain=0.12 wave=pulse50 from=430 to=560 shape=flat
  tone   at=1.30  dur=1.10 gain=0.11 wave=pulse50 from=560 to=330 shape=exp
  tone   at=0.60  dur=0.70 gain=0.04 wave=pulse12 from=645 to=840 shape=flat
  tone   at=1.30  dur=0.90 gain=0.035 wave=pulse12 from=840 to=495 shape=exp
  noise  at=0     dur=2.30 gain=0.020 from=700 to=1200 q=2.4 bed=long
@era 16bit
  tone   at=0     dur=0.65 gain=0.045 wave=saw from=298 to=430 shape=flat pan=-0.25
  tone   at=0.65  dur=0.75 gain=0.11 wave=saw from=430 to=565 shape=flat pan=-0.25
  tone   at=1.40  dur=1.25 gain=0.10 wave=saw from=565 to=322 shape=exp pan=-0.25
  tone   at=0     dur=0.65 gain=0.040 wave=saw from=299 to=431.6 shape=flat pan=0.3
  tone   at=0.65  dur=0.75 gain=0.10 wave=saw from=431.6 to=567 shape=flat pan=0.3
  tone   at=1.40  dur=1.25 gain=0.09 wave=saw from=567 to=323 shape=exp pan=0.3
  tone   at=0.65  dur=0.75 gain=0.035 wave=sine from=645 to=848 shape=flat
  tone   at=1.40  dur=1.05 gain=0.030 wave=sine from=848 to=483 shape=exp
  tone   at=0.65  dur=0.60 gain=0.018 wave=sine from=860 to=1130 shape=flat pan=-0.35
  noise  at=0     dur=2.70 gain=0.018 from=680 to=1300 q=2.6 bed=white pan=0.2
  echo   send=0.56 time=0.31 fb=0.56
