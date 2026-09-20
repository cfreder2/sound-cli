# Robot speech. Four short square blips at machine-gun spacing; the square is
# what makes it mechanical, and a sine version sounds like a toy.
@fx robot
  desc  Robot chatter
  tags  scifi dialogue
@vary pitch=0.14
@era 8bit
  tone   at=0    dur=0.05 gain=0.11 wave=pulse50 from=620 to=560 shape=flat
  tone   at=0.06 dur=0.05 gain=0.11 wave=pulse50 from=740 to=800 shape=flat
  tone   at=0.12 dur=0.05 gain=0.11 wave=pulse50 from=560 to=520 shape=flat
  tone   at=0.18 dur=0.07 gain=0.11 wave=pulse50 from=680 to=740 shape=flat
@era 16bit
  tone   at=0    dur=0.05 gain=0.10 wave=square from=620 to=560 shape=flat pan=-0.15
  tone   at=0.06 dur=0.05 gain=0.10 wave=square from=740 to=800 shape=flat pan=0.15
  tone   at=0.12 dur=0.05 gain=0.10 wave=square from=560 to=520 shape=flat
  tone   at=0.18 dur=0.07 gain=0.10 wave=square from=680 to=740 shape=flat pan=0.2
  noise  at=0    dur=0.26 gain=0.02 from=2000 to=2600 q=2.0 bed=white
  echo   send=0.24 time=0.06 fb=0.26
