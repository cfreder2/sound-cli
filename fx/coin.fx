# Coin / pickup. Two notes, the second a fifth above: the interval is what
# makes it read as "reward" rather than "event".
@fx coin
  desc  Pickup -- two rising notes, B then F# above
  tags  pickup reward
@era 8bit
  tone   at=0     dur=0.07  gain=0.14  wave=pulse25 from=988  to=988  shape=flat
  tone   at=0.07  dur=0.28  gain=0.14  wave=pulse25 from=1319 to=1319 shape=exp
@era 16bit
  tone   at=0     dur=0.07  gain=0.11  wave=tri  from=988  to=988  shape=flat
  tone   at=0.07  dur=0.36  gain=0.11  wave=tri  from=1319 to=1319 shape=exp
  tone   at=0.07  dur=0.36  gain=0.04  wave=sine from=2638 to=2638 shape=exp pan=0.25
  echo   send=0.32 time=0.09 fb=0.35
