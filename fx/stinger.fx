# A horror stinger. A dissonant cluster -- a tritone and a minor second in the
# same chord -- with a hard attack and a long tail.
@fx stinger
  desc  A jump-scare sting
  tags  horror
@era 8bit
  noise  at=0 dur=0.03 gain=0.20 from=9000 to=1600 q=1.0 bed=metal
  tone   at=0 dur=0.90 gain=0.13 wave=pulse25 from=440 to=430 shape=hit
  tone   at=0 dur=0.85 gain=0.10 wave=pulse25 from=622 to=612 shape=hit
  tone   at=0 dur=0.80 gain=0.08 wave=pulse12 from=466 to=458 shape=hit
@era 16bit
  noise  at=0 dur=0.035 gain=0.18 from=11000 to=1800 q=1.0 bed=white
  tone   at=0 dur=1.40 gain=0.12 wave=saw from=440 to=428 shape=hit pan=-0.35
  tone   at=0 dur=1.30 gain=0.09 wave=saw from=622 to=608 shape=hit pan=0.35
  tone   at=0 dur=1.20 gain=0.07 wave=saw from=466 to=456 shape=hit
  tone   at=0 dur=1.50 gain=0.06 wave=sine from=110 to=104 shape=hit
  echo   send=0.46 time=0.23 fb=0.50
