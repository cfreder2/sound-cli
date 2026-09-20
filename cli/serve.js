// `sound view`: a static server for the preview page, plus one endpoint that
// renders a track or effect on demand and streams back a WAV.
//
// The page does not contain a synth. It asks this server for audio, which
// calls the same core/render.js the CLI calls -- so what you A/B in the
// browser is byte-identical to what `sound render` writes to disk. That is the
// entire reason the preview is trustworthy.

import { createServer } from 'node:http';
import { readFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { spawn } from 'node:child_process';

import { loadScore, parseScore, expand } from '../core/score.js';
import { renderTrack } from '../core/render.js';
import { parseFx, renderFx, explainFx } from '../core/fx.js';
import { encodeWav } from '../core/wav.js';
import { INSTRUMENTS, listInstruments, SUBSTITUTE } from '../core/instruments.js';

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };

export function serve({ root, port = 7171, open = true }) {
  const TRACKS = join(root, 'tracks');
  const FX = join(root, 'fx');
  const cache = new Map();

  const manifest = () => ({
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
  });

  const server = createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    const send = (code, type, body) => {
      res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' });
      res.end(body);
    };

    try {
      if (url.pathname === '/api/manifest') {
        return send(200, 'application/json', JSON.stringify(manifest()));
      }

      if (url.pathname === '/api/audio') {
        const kind = url.searchParams.get('kind') || 'track';
        const id = url.searchParams.get('id');
        const era = url.searchParams.get('era') || '8bit';
        const extra = ['bars', 'from', 'seed', 'layers', 'solo', 'voice'].map((k) => url.searchParams.get(k) ?? '').join(',');
        const key = `${kind}:${id}:${era}:${extra}`;
        if (cache.has(key)) return send(200, 'audio/wav', cache.get(key));

        let out;
        if (kind === 'fx') {
          const { fx } = parseFx(readFileSync(join(FX, `${id}.fx`), 'utf8'), id);
          const nL = url.searchParams.get('layers');
          const solo = url.searchParams.get('solo');
          out = renderFx(fx, era, {
            vary: url.searchParams.has('seed'),
            seed: Number(url.searchParams.get('seed') || 1),
            maxLayers: nL === null ? null : Number(nL),
            soloLayer: solo === null ? null : Number(solo),
          });
        } else {
          let t = loadScore(readFileSync(join(TRACKS, `${id}.snd`), 'utf8'), id);
          const bars = url.searchParams.get('bars');
          const voice = url.searchParams.get('voice');
          // Soloing a voice must NOT re-normalise, or every lane comes back at
          // the same loudness and the visualiser lies about the mix: a pad at
          // 0.055 would look and sound exactly as present as a lead at 0.20.
          if (voice) t = { ...t, voices: t.voices.filter((v) => v.id === voice) };
          out = renderTrack(t, {
            era, bars: bars ? Number(bars) : null,
            from: Number(url.searchParams.get('from') || 0),
            normalize: !voice,
          });
        }
        const wav = encodeWav(out.L, out.R, out.rate, 16);
        if (cache.size > 60) cache.clear();
        cache.set(key, wav);
        return send(200, 'audio/wav', wav);
      }

      const file = url.pathname === '/' ? '/index.html' : url.pathname;
      const path = join(root, 'ui', file);
      if (!path.startsWith(join(root, 'ui'))) return send(403, 'text/plain', 'no');
      return send(200, TYPES[extname(path)] || 'application/octet-stream', readFileSync(path));
    } catch (e) {
      return send(e.code === 'ENOENT' ? 404 : 500, 'text/plain', e.message);
    }
  });

  server.listen(port, () => {
    const at = `http://localhost:${port}`;
    console.log(`sound view -- ${at}`);
    console.log('  Ctrl-C to stop.');
    if (open && process.platform === 'darwin') spawn('open', [at], { stdio: 'ignore' });
  });
}
