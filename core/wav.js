// WAV out. No dependency, and deterministic: the same score renders to the
// same bytes every time, which is what makes a committed golden render a
// usable regression test rather than a source of noise in the diff.

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
  const buf = Buffer.alloc(44 + dataLen);
  const float = depth === 32;

  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataLen, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(float ? 3 : 1, 20);          // 3 = IEEE float, 1 = PCM
  buf.writeUInt16LE(channels, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * channels * bytes, 28);
  buf.writeUInt16LE(channels * bytes, 32);
  buf.writeUInt16LE(depth, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataLen, 40);

  let o = 44;
  const max = depth === 24 ? 8388607 : 32767;
  for (let i = 0; i < frames; i++) {
    for (const ch of [L, R]) {
      const v = Math.max(-1, Math.min(1, ch[i] || 0));
      if (float) { buf.writeFloatLE(v, o); o += 4; }
      else if (depth === 24) {
        const n = Math.round(v * max);
        buf.writeUIntLE(n < 0 ? n + 0x1000000 : n, o, 3); o += 3;
      } else { buf.writeInt16LE(Math.round(v * max), o); o += 2; }
    }
  }
  return buf;
}

/** MP3, if lamejs is installed. Optional on purpose: WAV needs nothing. */
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
    if (b.length) out.push(Buffer.from(b));
  }
  const end = enc.flush();
  if (end.length) out.push(Buffer.from(end));
  return Buffer.concat(out);
}
