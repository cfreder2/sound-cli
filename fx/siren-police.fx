# A police siren, wailing. Two full sweeps up and back down.
#
# The sweep is not symmetrical: up takes about a third longer than down, which
# is what a motor-driven siren does as it spins up against its own inertia.
# Made symmetrical it stops sounding mechanical and starts sounding like a
# synthesiser doing a sweep.
#
# A saw rather than a sine, because a siren is a rotating slotted disc chopping
# air -- closer to a square wave than a tone -- and it is the harmonics that
# carry over distance and traffic.
@fx siren-police
  desc  A police siren wailing
  tags  vehicle city emergency
@era 8bit
  tone   at=0     dur=0.85 gain=0.13 wave=pulse25 from=620  to=1380 shape=flat
  tone   at=0.85  dur=0.62 gain=0.13 wave=pulse25 from=1380 to=620  shape=flat
  tone   at=1.47  dur=0.85 gain=0.13 wave=pulse25 from=620  to=1380 shape=flat
  tone   at=2.32  dur=0.62 gain=0.13 wave=pulse25 from=1380 to=620  shape=exp
  tone   at=0     dur=0.85 gain=0.04 wave=pulse50 from=310  to=690  shape=flat
  tone   at=0.85  dur=0.62 gain=0.04 wave=pulse50 from=690  to=310  shape=flat
  tone   at=1.47  dur=0.85 gain=0.04 wave=pulse50 from=310  to=690  shape=flat
  tone   at=2.32  dur=0.62 gain=0.04 wave=pulse50 from=690  to=310  shape=exp
@era 16bit
  tone   at=0     dur=0.85 gain=0.12 wave=saw from=620  to=1380 shape=flat pan=-0.2
  tone   at=0.85  dur=0.62 gain=0.12 wave=saw from=1380 to=620  shape=flat pan=-0.2
  tone   at=1.47  dur=0.85 gain=0.12 wave=saw from=620  to=1380 shape=flat pan=0.1
  tone   at=2.32  dur=0.62 gain=0.12 wave=saw from=1380 to=620  shape=exp  pan=0.25
  tone   at=0     dur=0.85 gain=0.035 wave=saw from=624 to=1389 shape=flat pan=0.25
  tone   at=0.85  dur=0.62 gain=0.035 wave=saw from=1389 to=624 shape=flat pan=0.25
  tone   at=1.47  dur=0.85 gain=0.035 wave=saw from=624 to=1389 shape=flat pan=-0.15
  tone   at=2.32  dur=0.62 gain=0.035 wave=saw from=1389 to=624 shape=exp  pan=-0.25
  tone   at=0     dur=2.94 gain=0.030 wave=sine from=210 to=205 shape=flat
  echo   send=0.32 time=0.23 fb=0.40
