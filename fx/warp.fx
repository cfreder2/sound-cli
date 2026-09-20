# A warp. Pitch rising while the filter falls -- two opposed sweeps is what
# makes it feel like travel rather than a siren.
@fx warp
  desc  Warping between levels
  tags  arcade scifi movement
@era 8bit
  tone   at=0 dur=0.80 gain=0.13 wave=pulse25 from=120 to=1800 shape=flat
  noise  at=0 dur=0.80 gain=0.08 from=6000 to=400 q=1.2 bed=metal
  tone   at=0 dur=0.80 gain=0.06 wave=pulse12 from=180 to=2700 shape=flat
@era 16bit
  tone   at=0 dur=0.95 gain=0.12 wave=saw from=110 to=2000 shape=flat pan=-0.3
  tone   at=0 dur=0.95 gain=0.06 wave=saw from=165 to=3000 shape=flat pan=0.3
  noise  at=0 dur=0.95 gain=0.07 from=7000 to=340 q=1.3 bed=white
  echo   send=0.44 time=0.16 fb=0.48
