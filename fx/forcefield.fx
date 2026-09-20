# A shield coming up. Two detuned tones beating against each other at about
# 6 Hz -- that beat is what makes it read as energy rather than as a note.
@fx forcefield
  desc  An energy shield engaging
  tags  scifi state
@era 8bit
  tone   at=0    dur=0.70 gain=0.11 wave=pulse50 from=180 to=320 shape=flat
  tone   at=0    dur=0.70 gain=0.09 wave=pulse50 from=186 to=328 shape=flat
  noise  at=0    dur=0.30 gain=0.05 from=1200 to=3400 q=1.6 bed=metal
@era 16bit
  tone   at=0    dur=0.85 gain=0.10 wave=saw from=175 to=330 shape=flat pan=-0.25
  tone   at=0    dur=0.85 gain=0.09 wave=saw from=181 to=341 shape=flat pan=0.25
  tone   at=0    dur=0.85 gain=0.05 wave=sine from=350 to=660 shape=flat
  noise  at=0    dur=0.34 gain=0.04 from=1400 to=4000 q=1.8 bed=white
  echo   send=0.36 time=0.12 fb=0.42
