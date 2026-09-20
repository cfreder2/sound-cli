# Damage taken. Falling, and slightly dissonant: a minor second under the tone.
@fx hurt
  desc  Taking damage -- a falling, sour two-tone
  tags  damage
@era 8bit
  tone   at=0     dur=0.20 gain=0.15 wave=pulse12 from=440 to=130 shape=hit
  tone   at=0.01  dur=0.18 gain=0.08 wave=pulse12 from=466 to=138 shape=hit
  noise  at=0     dur=0.10 gain=0.08 from=2400 to=400 q=1.1 bed=long
@era 16bit
  tone   at=0     dur=0.26 gain=0.13 wave=saw  from=440 to=120 shape=hit
  tone   at=0.01  dur=0.24 gain=0.07 wave=saw  from=466 to=128 shape=hit pan=0.2
  tone   at=0     dur=0.30 gain=0.05 wave=sine from=220 to=60  shape=hit
  noise  at=0     dur=0.13 gain=0.07 from=3000 to=380 q=1.1 bed=white
  echo   send=0.20 time=0.09 fb=0.28
