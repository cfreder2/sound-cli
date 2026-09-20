# A heartbeat. Two thumps, the second quieter and 320 ms later.

@fx heartbeat
  desc  A heartbeat -- low health, tension
  tags  horror state loop
@era 8bit
  tone   at=0    dur=0.16 gain=0.20 wave=pulse50 from=78 to=42 shape=hit
  tone   at=0.32 dur=0.13 gain=0.13 wave=pulse50 from=72 to=40 shape=hit
@era 16bit
  tone   at=0    dur=0.20 gain=0.19 wave=sine from=80 to=40 shape=hit
  tone   at=0    dur=0.10 gain=0.05 wave=sine from=160 to=90 shape=hit
  tone   at=0.32 dur=0.16 gain=0.12 wave=sine from=74 to=38 shape=hit
  tone   at=0.32 dur=0.08 gain=0.03 wave=sine from=148 to=84 shape=hit
