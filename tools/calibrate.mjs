// Regenerate the per-instrument `trim` values in core/instruments.js.
//
// Run this after changing any instrument's layers. Without it, `mix=` stops
// meaning the same thing across instruments -- which is how the library ended
// up with a 21.5 dB spread and 16-bit renders that came out bass-heavy while
// 8-bit ones did not.
//
//   node tools/calibrate.mjs            # print the table
//   node tools/calibrate.mjs --check    # nonzero exit if anything drifted
import { loadScore } from '../core/score.js';
import { renderTrack } from '../core/render.js';
import { Biquad } from '../core/dsp.js';
import { INSTRUMENTS } from '../core/instruments.js';

const TARGET = -20;          // dB, K-weighted, for a sustained A3 at mix=1
const TOLERANCE = 0.6;       // dB of drift before --check complains

/** ITU-R BS.1770 K-weighting: how loud a thing actually sounds. */
function loudness(x) {
  const k = [new Biquad('highshelf', 1681, 0.707, 4), new Biquad('highpass', 38, 0.5)];
  const a = Math.floor(0.05 * 44100), b = Math.min(x.length, Math.floor(0.9 * 44100));
  let s = 0, n = 0;
  for (let i = 0; i < b; i++) {
    const y = k[1].run(k[0].run(x[i]));
    if (i >= a) { s += y * y; n++; }
  }
  return 10 * Math.log10(s / Math.max(1, n) + 1e-12);
}

const measure = (name, def) => {
  const note = def.drums ? 'k' : name === 'arp' ? 'am' : 'a3';
  const src = `@track x\n bpm 40\n beats 4\n era ${def.era}\n@voice v inst=${name} mix=1\n  ${note} .  .  .\n`;
  return loudness(renderTrack(loadScore(src, 'x'),
    { era: def.era, normalize: false, tail: 0.2, ceiling: Infinity }).L);
};

const check = process.argv.includes('--check');
const drift = [];
console.log('instrument        era     measured   current   wanted');
for (const [name, def] of Object.entries(INSTRUMENTS)) {
  // A kit's level cannot be read from a sustained note, so the two kits are
  // matched to each other by hand instead. Left out of the sweep on purpose.
  if (def.drums) { console.log(`  ${name.padEnd(16)}${def.era.padEnd(8)}     (kit, set by hand)`); continue; }
  const l = measure(name, def);
  const want = +(10 ** ((TARGET - l) / 20) * (def.trim ?? 1)).toFixed(3);
  const off = 20 * Math.log10(want / (def.trim ?? 1));
  if (Math.abs(off) > TOLERANCE) drift.push(`${name}: trim ${def.trim} should be ${want} (${off.toFixed(1)} dB off)`);
  console.log(`  ${name.padEnd(16)}${def.era.padEnd(8)}${l.toFixed(1).padStart(7)} dB`
    + `${String(def.trim ?? '-').padStart(10)}${String(want).padStart(10)}`
    + `${Math.abs(off) > TOLERANCE ? '   DRIFTED' : ''}`);
}
if (drift.length) {
  console.error(`\n${drift.length} instrument(s) drifted:\n- ${drift.join('\n- ')}`);
  console.error('\nUpdate `trim:` in core/instruments.js to the wanted column.');
  if (check) process.exitCode = 1;
} else {
  console.log('\nEvery instrument is within '
    + `${TOLERANCE} dB of the reference. \`mix=\` means one thing.`);
}
