// `sound view`: a static file server, and nothing else.
//
// It used to render audio and stream progress back. It does not any more --
// the browser renders, using the same core/ the CLI uses. That removes the
// server from the critical path entirely, which is what makes the previewer
// hostable on GitHub Pages: `sound build` writes the same files this serves,
// and a static host is all either of them needs.

import { createServer } from 'node:http';
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

import { statSync } from 'node:fs';
import { parseScore, expand } from '../core/score.js';
import { parseFx, explainFx } from '../core/fx.js';

/**
 * Re-import core/instruments.js when it changes on disk.
 *
 * Node caches ES modules for the life of the process, so a running `sound
 * view` kept serving the instrument list it loaded at startup -- edit an
 * instrument, reload the page, see the old one, and conclude the edit did not
 * work. The scores and effects are read per request and never had this
 * problem; this makes the instruments behave the same way. Keyed on mtime, so
 * it re-imports once per edit rather than once per request.
 */
let instMod = null;
let instStamp = 0;
async function instruments(root) {
  const path = join(root, 'core', 'instruments.js');
  const stamp = statSync(path).mtimeMs;
  if (!instMod || stamp !== instStamp) {
    instStamp = stamp;
    instMod = await import(`${pathToFileURL(path).href}?v=${stamp}`);
  }
  return instMod;
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

/**
 * Everything the page needs, in one object: the scores and effects as TEXT.
 *
 * The sources ship rather than rendered audio, because the whole library is
 * 360 KB of text and one two-minute render is 20 MB of WAV. Shipping the text
 * and synthesising in the tab is two orders of magnitude smaller, and it is
 * also the only version where changing a note means changing a file.
 */
export async function buildManifest(root) {
  const { INSTRUMENTS, listInstruments, SUBSTITUTE } = await instruments(root);
  const TRACKS = join(root, 'tracks');
  const FX = join(root, 'fx');
  return {
    tracks: readdirSync(TRACKS).filter((f) => f.endsWith('.snd')).map((f) => {
      const id = f.replace(/\.snd$/, '');
      const text = readFileSync(join(TRACKS, f), 'utf8');
      const t = expand(parseScore(text, f).track);
      return {
        id, name: t.name, bpm: t.bpm, beats: t.beats, era: t.era, tags: t.tags,
        bars: t.totalBars, seconds: +t.seconds.toFixed(1), notes: t.notes,
        voices: t.voices.map((v) => ({ id: v.id, inst: v.inst, mix: v.mix, pan: v.pan })),
        blurb: (text.match(/^# ?(.*)$/gm) || []).slice(0, 14).map((l) => l.replace(/^# ?/, '')),
        source: text,
      };
    }),
    fx: readdirSync(FX).filter((f) => f.endsWith('.fx')).map((f) => {
      const id = f.replace(/\.fx$/, '');
      const text = readFileSync(join(FX, f), 'utf8');
      const { fx } = parseFx(text, f);
      return {
        id, desc: fx.desc, tags: fx.tags, vary: fx.vary,
        eras: Object.fromEntries(Object.keys(fx.eras).map((e) => [e, explainFx(fx, e)])),
        blurb: (text.match(/^# ?(.*)$/gm) || []).slice(0, 12).map((l) => l.replace(/^# ?/, '')),
        source: text,
      };
    }),
    instruments: listInstruments().map((i) => ({ ...i, detail: INSTRUMENTS[i.name] })),
    substituteTable: SUBSTITUTE,
  };
}

export function serve({ root, port = 7171, open = true }) {
  const server = createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    const send = (code, type, body) => {
      res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' });
      res.end(body);
    };
    try {
      // Writing a take back into tracks/. Only the local server does this --
      // a static host has no filesystem, and the page falls back to a browser
      // download there.
      if (url.pathname === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', (d) => { body += d; if (body.length > 2e6) req.destroy(); });
        req.on('end', () => {
          try {
            const { id, text, overwrite } = JSON.parse(body);
            if (!/^[a-z0-9][a-z0-9-]{0,48}$/.test(id || '')) {
              return send(400, 'text/plain', 'Name must be lower-case letters, digits and hyphens.');
            }
            const dest = join(root, 'tracks', `${id}.snd`);
            if (!dest.startsWith(join(root, 'tracks'))) return send(403, 'text/plain', 'no');
            if (existsSync(dest) && !overwrite) {
              return send(409, 'text/plain', `tracks/${id}.snd already exists.`);
            }
            // Parse before writing. A file that does not load is worse than no
            // file, because it breaks `sound check` for everything else.
            const { errors } = parseScore(text, `${id}.snd`);
            if (errors.length) return send(400, 'text/plain', errors.slice(0, 4).join('\n'));
            writeFileSync(dest, text);
            return send(200, 'application/json', JSON.stringify({ path: `tracks/${id}.snd` }));
          } catch (e) {
            return send(500, 'text/plain', e.message);
          }
        });
        return undefined;
      }

      if (url.pathname === '/data.json') {
        buildManifest(root)
          .then((m) => send(200, TYPES['.json'], JSON.stringify(m)))
          .catch((e) => send(500, 'text/plain', e.message));
        return undefined;
      }
      // Two roots: the page and its worker come from ui/, core/ is served as
      // itself so the worker's imports resolve the same way they will on a
      // static host.
      const rel = normalize(url.pathname === '/' ? 'index.html' : url.pathname.slice(1));
      if (rel.startsWith('..')) return send(403, 'text/plain', 'no');
      const path = rel.startsWith('core/') ? join(root, rel) : join(root, 'ui', rel);
      if (!existsSync(path)) return send(404, 'text/plain', `not found: ${rel}`);
      return send(200, TYPES[extname(path)] || 'application/octet-stream', readFileSync(path));
    } catch (e) {
      return send(500, 'text/plain', e.message);
    }
  });

  server.listen(port, () => {
    const at = `http://localhost:${port}`;
    console.log(`sound view -- ${at}`);
    console.log('  The browser does the rendering; this only serves files.');
    console.log('  Ctrl-C to stop.');
    if (open && process.platform === 'darwin') spawn('open', [at], { stdio: 'ignore' });
  });
}
