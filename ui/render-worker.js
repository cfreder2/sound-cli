// The renderer, in the browser.
//
// This is the same core/ the CLI uses -- not a port of it, not a reimplementation
// of it, the same files. That is the entire premise of the package: VECTRENCH
// has three synths that agree by hand and nothing tests that they do, and the
// way not to repeat that is to have one and run it everywhere.
//
// Which also means the previewer needs no server. A static host can serve
// index.html, core/*.js and a JSON of the scores, and the tab does the
// synthesis -- so this works on GitHub Pages exactly as it works locally.

import { loadScore } from './core/score.js';
import { renderTrack } from './core/render.js';
import { parseFx, renderFx } from './core/fx.js';
import { encodeWav } from './core/wav.js';

/** Min/max per bucket, as a flat Float32Array of pairs. */
function envelope(L, R, buckets) {
  const out = new Float32Array(buckets * 2);
  const per = Math.max(1, Math.floor(L.length / buckets));
  for (let b = 0; b < buckets; b++) {
    let lo = 0, hi = 0;
    const start = b * per;
    const end = Math.min(L.length, start + per);
    // Step through the bucket rather than reading every sample: 320 buckets of
    // a two-minute track is 13000 samples each, and the peak of every 16th is
    // indistinguishable at one pixel per bucket.
    for (let i = start; i < end; i += 16) {
      const v = (L[i] + R[i]) * 0.5;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    out[b * 2] = lo;
    out[b * 2 + 1] = hi;
  }
  return out;
}

self.onmessage = (ev) => {
  const { job, kind, text, id, opts } = ev.data;
  let lastPeakStep = -1;
  try {
    let out;
    if (kind === 'fx') {
      const { fx, errors } = parseFx(text, id);
      if (errors.length) throw new Error(errors.join('\n'));
      out = renderFx(fx, opts.era, opts);
      self.postMessage({ job, type: 'progress', frac: 1 });
    } else {
      const t = loadScore(text, id);
      const voices = opts.voice ? t.voices.filter((v) => v.id === opts.voice) : t.voices;
      out = renderTrack({ ...t, voices }, {
        ...opts,
        // A soloed voice is never re-levelled: the layer view exists to show
        // which voice is loud, and normalising each lane would erase that.
        normalize: opts.voice ? false : opts.normalize !== false,
        // Send a coarse peak envelope along with the progress, but only a few
        // times: each one is a full pass over the mix buffer, which for a
        // two-minute track is four million samples, and doing that on all
        // forty-seven progress ticks would cost more than the render.
        onProgress: (frac, mix) => {
          const step = Math.floor(frac * 5);
          let peaks = null;
          if (mix && step > lastPeakStep) {
            lastPeakStep = step;
            peaks = envelope(mix.L, mix.R, 320);
          }
          self.postMessage({ job, type: 'progress', frac, peaks },
            peaks ? [peaks.buffer] : []);
        },
      });
    }
    const wav = encodeWav(out.L, out.R, out.rate, 16);
    self.postMessage({ job, type: 'done', wav: wav.buffer, stats: out.stats }, [wav.buffer]);
  } catch (e) {
    self.postMessage({ job, type: 'error', message: e.message });
  }
};
