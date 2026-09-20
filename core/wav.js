// WAV out. No dependency, no Node: this returns a Uint8Array built through a
// DataView, so the identical code path writes a file from the CLI and fills an
// AudioBuffer in a browser tab. `Buffer` would have worked for the first and
// nothing for the second, and this library is only worth having if there is
// one renderer rather than two.
//
// Deterministic, too: the same score produces the same bytes every time, which
// is what makes a committed golden render a regression test rather than noise
// in the diff.

/**
 * Interleave and encode. `depth` is 16 or 24 integer PCM, or 32 for float --
 * which is the only sense in which this library has a "bit depth" at all. The
 * eras (8bit, 16bit) are console generations and have nothing to do with it.
 */
export function encodeWav(L, R, rate = 44100, depth = 16) {
  const frames = L.length;
  const channels = 2;
  const bytes = depth === 32 ? 4 : depth === 24 ? 3 : 2;
  const dataLen = frames * channels * bytes;
  const out = new Uint8Array(44 + dataLen);
  const dv = new DataView(out.buffer);
  const float = depth === 32;
  const ascii = (s2, at) => { for (let i = 0; i < s2.length; i++) out[at + i] = s2.charCodeAt(i); };

  ascii('RIFF', 0);
  dv.setUint32(4, 36 + dataLen, true);
  ascii('WAVE', 8);
  ascii('fmt ', 12);
  dv.setUint32(16, 16, true);
  dv.setUint16(20, float ? 3 : 1, true);         // 3 = IEEE float, 1 = PCM
  dv.setUint16(22, channels, true);
  dv.setUint32(24, rate, true);
  dv.setUint32(28, rate * channels * bytes, true);
  dv.setUint16(32, channels * bytes, true);
  dv.setUint16(34, depth, true);
  ascii('data', 36);
  dv.setUint32(40, dataLen, true);

  let o = 44;
  const max = depth === 24 ? 8388607 : 32767;
  for (let i = 0; i < frames; i++) {
    for (const ch of [L, R]) {
      const v = Math.max(-1, Math.min(1, ch[i] || 0));
      if (float) { dv.setFloat32(o, v, true); o += 4; }
      else if (depth === 24) {
        const n = Math.round(v * max);
        const u = n < 0 ? n + 0x1000000 : n;
        out[o] = u & 0xff; out[o + 1] = (u >> 8) & 0xff; out[o + 2] = (u >> 16) & 0xff;
        o += 3;
      } else { dv.setInt16(o, Math.round(v * max), true); o += 2; }
    }
  }
  return out;
}

/** MP3, if lamejs is installed. CLI only -- WAV needs nothing anywhere. */
export async function encodeMp3(L, R, rate = 44100, kbps = 192) {
  let Mp3Encoder;
  try { ({ Mp3Encoder } = await import('@breezystack/lamejs')); }
  catch { throw new Error('MP3 needs @breezystack/lamejs -- `npm i` here, or use --format wav'); }
  const enc = new Mp3Encoder(2, rate, kbps);
  const to16 = (ch) => {
    const a = new Int16Array(ch.length);
    for (let i = 0; i < ch.length; i++) a[i] = Math.max(-1, Math.min(1, ch[i])) * 32767;
    return a;
  };
  const l = to16(L), r = to16(R);
  const out = [];
  const BLOCK = 1152;
  for (let i = 0; i < l.length; i += BLOCK) {
    const b = enc.encodeBuffer(l.subarray(i, i + BLOCK), r.subarray(i, i + BLOCK));
    if (b.length) out.push(Uint8Array.from(b));
  }
  const end = enc.flush();
  if (end.length) out.push(Uint8Array.from(end));
  const total = out.reduce((n, b) => n + b.length, 0);
  const all = new Uint8Array(total);
  let at = 0;
  for (const b of out) { all.set(b, at); at += b.length; }
  return all;
}
