// A render, off the main thread.
//
// Two problems, one fix. Rendering is synchronous and CPU-bound, so on the
// main thread it blocks the event loop for its whole duration -- which means a
// server cannot SEND progress about a render while that render is running, and
// the two eras of an A/B queue behind each other instead of going at once.
// In a worker both go away: the main thread stays free to stream progress, and
// N renders genuinely run in parallel.

import { parentPort } from 'node:worker_threads';
import { loadScore } from '../core/score.js';
import { renderTrack } from '../core/render.js';
import { parseFx, renderFx } from '../core/fx.js';
import { encodeWav } from '../core/wav.js';

parentPort.on('message', (msg) => {
  const { job, kind, text, id, opts } = msg;
  try {
    let out;
    if (kind === 'fx') {
      const { fx, errors } = parseFx(text, id);
      if (errors.length) throw new Error(errors.join('\n'));
      out = renderFx(fx, opts.era, opts);
      parentPort.postMessage({ job, type: 'progress', frac: 1 });
    } else {
      const t = loadScore(text, id);
      const voices = opts.voice ? t.voices.filter((v) => v.id === opts.voice) : t.voices;
      out = renderTrack({ ...t, voices }, {
        ...opts,
        normalize: opts.voice ? false : opts.normalize !== false,
        onProgress: (frac) => parentPort.postMessage({ job, type: 'progress', frac }),
      });
    }
    const wav = encodeWav(out.L, out.R, out.rate, 16);
    // Hand over the buffer rather than copying it: a two-minute stereo WAV is
    // 20 MB, and structured-cloning that per render is not free.
    const ab = wav.buffer.slice(wav.byteOffset, wav.byteOffset + wav.byteLength);
    parentPort.postMessage({ job, type: 'done', wav: ab, stats: out.stats }, [ab]);
  } catch (e) {
    parentPort.postMessage({ job, type: 'error', message: e.message });
  }
});
