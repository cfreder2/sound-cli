// A tiny fixed worker pool.
//
// Fixed, not one-per-request: spinning up a worker costs the module graph
// being loaded again, which is more than a short render takes. Sized to the
// machine but capped, because the point is to overlap a handful of renders,
// not to saturate every core while somebody is trying to listen.

import { Worker } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { fileURLToPath } from 'node:url';

const WORKER = fileURLToPath(new URL('./render-worker.js', import.meta.url));

export function createPool(size = Math.max(2, Math.min(4, availableParallelism() - 1))) {
  const workers = [];
  const idle = [];
  const queue = [];
  const jobs = new Map();
  let nextJob = 1;

  const spawn = () => {
    const w = new Worker(WORKER);
    w.on('message', (m) => {
      const j = jobs.get(m.job);
      if (!j) return;
      if (m.type === 'progress') { j.onProgress?.(m.frac); return; }
      jobs.delete(m.job);
      idle.push(w);
      pump();
      if (m.type === 'error') j.reject(new Error(m.message));
      else j.resolve({ wav: Buffer.from(m.wav), stats: m.stats });
    });
    w.on('error', (e) => {
      for (const [id, j] of jobs) if (j.worker === w) { jobs.delete(id); j.reject(e); }
      workers.splice(workers.indexOf(w), 1);
      const i = idle.indexOf(w); if (i >= 0) idle.splice(i, 1);
      spawn();
    });
    // Deliberately NOT unref'd: a render in flight has to keep the process
    // alive, or a short-lived caller exits mid-render. `close()` ends them.
    workers.push(w);
    idle.push(w);
    return w;
  };

  const pump = () => {
    while (queue.length && idle.length) {
      const task = queue.shift();
      const w = idle.pop();
      task.worker = w;
      jobs.set(task.job, task);
      w.postMessage({ job: task.job, kind: task.kind, text: task.text, id: task.id, opts: task.opts });
    }
  };

  for (let i = 0; i < size; i++) spawn();

  return {
    size,
    /** `onProgress` fires 0..1 while the render runs, on the main thread. */
    run({ kind, text, id, opts, onProgress }) {
      return new Promise((resolve, reject) => {
        queue.push({ job: nextJob++, kind, text, id, opts, onProgress, resolve, reject });
        pump();
      });
    },
    close() { for (const w of workers) w.terminate(); },
  };
}
