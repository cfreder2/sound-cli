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

self.onmessage = (ev) => {
  const { job, kind, text, id, opts } = ev.data;
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
        onProgress: (frac) => self.postMessage({ job, type: 'progress', frac }),
      });
    }
    const wav = encodeWav(out.L, out.R, out.rate, 16);
    self.postMessage({ job, type: 'done', wav: wav.buffer, stats: out.stats }, [wav.buffer]);
  } catch (e) {
    self.postMessage({ job, type: 'error', message: e.message });
  }
};
