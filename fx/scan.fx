# A scanner sweep. Three pulses at a steady interval, each a step higher.

@fx scan
  desc  A scanner or radar sweep
  tags  scifi ui
@era 8bit
  tone   at=0    dur=0.10 gain=0.10 wave=pulse50 from=880  to=1320 shape=lin
  tone   at=0.22 dur=0.10 gain=0.10 wave=pulse50 from=988  to=1480 shape=lin
  tone   at=0.44 dur=0.14 gain=0.11 wave=pulse50 from=1109 to=1660 shape=lin
@era 16bit
  tone   at=0    dur=0.12 gain=0.09 wave=tri from=880  to=1320 shape=lin pan=-0.3
  tone   at=0.22 dur=0.12 gain=0.09 wave=tri from=988  to=1480 shape=lin
  tone   at=0.44 dur=0.18 gain=0.10 wave=tri from=1109 to=1660 shape=lin pan=0.3
  noise  at=0    dur=0.60 gain=0.02 from=3000 to=5000 q=2.0 bed=white
  echo   send=0.40 time=0.11 fb=0.40
