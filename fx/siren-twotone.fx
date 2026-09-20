# A two-tone siren: nee-naw, the European one. Four alternations.
#
# Two fixed pitches a fourth apart, 660 and 880 Hz, each held for about half a
# second with a hard switch between them. No glide -- a slide between the two
# is an American wail, and the whole character of this one is that it does not
# bend.
@fx siren-twotone
  desc  A two-tone nee-naw siren
  tags  vehicle city emergency
@era 8bit
  tone   at=0     dur=0.52 gain=0.13 wave=pulse25 from=660 to=660 shape=flat
  tone   at=0.52  dur=0.52 gain=0.13 wave=pulse25 from=880 to=880 shape=flat
  tone   at=1.04  dur=0.52 gain=0.13 wave=pulse25 from=660 to=660 shape=flat
  tone   at=1.56  dur=0.52 gain=0.13 wave=pulse25 from=880 to=880 shape=flat
  tone   at=0     dur=0.52 gain=0.04 wave=pulse50 from=330 to=330 shape=flat
  tone   at=0.52  dur=0.52 gain=0.04 wave=pulse50 from=440 to=440 shape=flat
  tone   at=1.04  dur=0.52 gain=0.04 wave=pulse50 from=330 to=330 shape=flat
  tone   at=1.56  dur=0.52 gain=0.04 wave=pulse50 from=440 to=440 shape=exp
@era 16bit
  tone   at=0     dur=0.52 gain=0.12 wave=saw from=660 to=660 shape=flat pan=-0.15
  tone   at=0.52  dur=0.52 gain=0.12 wave=saw from=880 to=880 shape=flat pan=0.15
  tone   at=1.04  dur=0.52 gain=0.12 wave=saw from=660 to=660 shape=flat pan=-0.15
  tone   at=1.56  dur=0.52 gain=0.12 wave=saw from=880 to=880 shape=exp  pan=0.15
  tone   at=0     dur=0.52 gain=0.035 wave=saw from=663 to=663 shape=flat pan=0.2
  tone   at=0.52  dur=0.52 gain=0.035 wave=saw from=884 to=884 shape=flat pan=-0.2
  tone   at=1.04  dur=0.52 gain=0.035 wave=saw from=663 to=663 shape=flat pan=0.2
  tone   at=1.56  dur=0.52 gain=0.035 wave=saw from=884 to=884 shape=exp  pan=-0.2
  tone   at=0     dur=2.08 gain=0.028 wave=sine from=220 to=220 shape=flat
  echo   send=0.34 time=0.19 fb=0.42
