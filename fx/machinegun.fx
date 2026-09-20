# Machine guns.
#
# A burst is the clearest demonstration of what `at=` is for: six shots laid
# 65 ms apart, each one three layers. The noise bed offset differs per line,
# so no two shots are sample-identical -- which is the difference between a
# machine gun and a stutter.
@fx machinegun
  desc  A six-round burst
  tags  weapon gun

@vary pitch=0.05 gain=0.08

@era 8bit
  tone   at=0     dur=0.05 gain=0.13 wave=pulse50 from=420 to=90 shape=hit
  noise  at=0     dur=0.06 gain=0.13 from=4000 to=500 q=1.1 bed=long
  tone   at=0.065 dur=0.05 gain=0.13 wave=pulse50 from=410 to=88 shape=hit
  noise  at=0.065 dur=0.06 gain=0.13 from=3900 to=520 q=1.1 bed=long
  tone   at=0.13  dur=0.05 gain=0.13 wave=pulse50 from=430 to=92 shape=hit
  noise  at=0.13  dur=0.06 gain=0.13 from=4100 to=490 q=1.1 bed=long
  tone   at=0.195 dur=0.05 gain=0.13 wave=pulse50 from=415 to=89 shape=hit
  noise  at=0.195 dur=0.06 gain=0.13 from=3950 to=510 q=1.1 bed=long
  tone   at=0.26  dur=0.05 gain=0.13 wave=pulse50 from=425 to=91 shape=hit
  noise  at=0.26  dur=0.06 gain=0.13 from=4050 to=500 q=1.1 bed=long
  tone   at=0.325 dur=0.05 gain=0.13 wave=pulse50 from=418 to=90 shape=hit
  noise  at=0.325 dur=0.09 gain=0.13 from=4000 to=380 q=1.1 bed=long

@era 16bit
  noise  at=0     dur=0.09 gain=0.15 from=5000 to=280 q=1.0 bed=white
  tone   at=0     dur=0.07 gain=0.10 wave=sine from=300 to=60 shape=hit
  noise  at=0.065 dur=0.09 gain=0.15 from=4900 to=290 q=1.0 bed=white pan=-0.1
  tone   at=0.065 dur=0.07 gain=0.10 wave=sine from=295 to=58 shape=hit
  noise  at=0.13  dur=0.09 gain=0.15 from=5100 to=275 q=1.0 bed=white pan=0.1
  tone   at=0.13  dur=0.07 gain=0.10 wave=sine from=305 to=62 shape=hit
  noise  at=0.195 dur=0.09 gain=0.15 from=4950 to=285 q=1.0 bed=white pan=-0.12
  tone   at=0.195 dur=0.07 gain=0.10 wave=sine from=298 to=59 shape=hit
  noise  at=0.26  dur=0.09 gain=0.15 from=5050 to=282 q=1.0 bed=white pan=0.12
  tone   at=0.26  dur=0.07 gain=0.10 wave=sine from=302 to=61 shape=hit
  noise  at=0.325 dur=0.14 gain=0.15 from=5000 to=200 q=1.0 bed=white
  tone   at=0.325 dur=0.10 gain=0.10 wave=sine from=300 to=48 shape=hit
  echo   send=0.20 time=0.13 fb=0.30
