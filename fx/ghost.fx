# A ghost wailing. Ooo-hhh-ooooh-hhh-ooo.
#
# Two things make it that rather than one long note.
#
# The pitch UNDULATES -- five segments that rise and fall against each other,
# not a single arc. One sweep up and back down is a siren; a voice wavers
# because it is running out of breath and taking more.
#
# And the amplitude swells and dips with it. Each segment decays while the next
# one is already coming up underneath, so the joins are the quiet "hhh" parts
# rather than gaps. Hard gaps click and read as separate notes.
#
# A sine, not a saw. "Oo" is a dark vowel -- almost everything is in the
# fundamental, with a little around 850 Hz and nothing above it. A saw at this
# pitch has harmonics all the way up and comes out closer to "aaah", which is
# what the first version of this got wrong.
@fx ghost
  desc  A ghost wailing
  tags  horror halloween ambience
@vary pitch=0.04
@era 8bit
  tone   at=0     dur=0.62 gain=0.11 wave=nestri from=380 to=452 shape=exp
  tone   at=0.44  dur=0.62 gain=0.12 wave=nestri from=452 to=396 shape=exp
  tone   at=0.90  dur=0.68 gain=0.13 wave=nestri from=396 to=492 shape=exp
  tone   at=1.42  dur=0.62 gain=0.12 wave=nestri from=492 to=408 shape=exp
  tone   at=1.88  dur=0.85 gain=0.11 wave=nestri from=408 to=352 shape=exp
  tone   at=0     dur=0.62 gain=0.020 wave=pulse12 from=855 to=1017 shape=exp
  tone   at=0.90  dur=0.68 gain=0.022 wave=pulse12 from=891 to=1107 shape=exp
  tone   at=1.88  dur=0.85 gain=0.018 wave=pulse12 from=918 to=792 shape=exp
  noise  at=0     dur=2.70 gain=0.016 from=520 to=760 q=2.6 bed=long
@era 16bit
  tone   at=0     dur=0.66 gain=0.10 wave=sine from=380 to=452 shape=exp pan=-0.2
  tone   at=0.46  dur=0.66 gain=0.11 wave=sine from=452 to=396 shape=exp pan=-0.2
  tone   at=0.94  dur=0.72 gain=0.12 wave=sine from=396 to=492 shape=exp pan=-0.2
  tone   at=1.48  dur=0.66 gain=0.11 wave=sine from=492 to=408 shape=exp pan=-0.2
  tone   at=1.96  dur=0.95 gain=0.10 wave=sine from=408 to=350 shape=exp pan=-0.2
  tone   at=0     dur=0.66 gain=0.085 wave=sine from=381.4 to=453.6 shape=exp pan=0.25
  tone   at=0.46  dur=0.66 gain=0.095 wave=sine from=453.6 to=397.4 shape=exp pan=0.25
  tone   at=0.94  dur=0.72 gain=0.10 wave=sine from=397.4 to=493.8 shape=exp pan=0.25
  tone   at=1.48  dur=0.66 gain=0.095 wave=sine from=493.8 to=409.4 shape=exp pan=0.25
  tone   at=1.96  dur=0.95 gain=0.085 wave=sine from=409.4 to=351.2 shape=exp pan=0.25
  tone   at=0     dur=0.66 gain=0.018 wave=sine from=855 to=1017 shape=exp
  tone   at=0.94  dur=0.72 gain=0.020 wave=sine from=891 to=1107 shape=exp pan=-0.3
  tone   at=1.96  dur=0.95 gain=0.016 wave=sine from=918 to=788 shape=exp pan=0.3
  noise  at=0     dur=2.95 gain=0.014 from=500 to=800 q=2.8 bed=white pan=0.15
  echo   send=0.54 time=0.29 fb=0.54
