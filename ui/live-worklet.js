// Live synthesis, on the audio thread.
//
// Holds a set of core/voice.js Voices and ticks them 128 samples at a time --
// the same Voice the offline renderer uses, so a note played on the keyboard
// and the same note written into a score produce identical samples. That is
// the only reason this is a worklet rather than a graph of OscillatorNodes:
// nodes would have been faster to write and would have been a second synth.
//
// 128 samples at 44.1 kHz is 2.9 ms per block, which is the floor on how late
// a key can sound. The rest of the latency is the output device.
//
// NOTE: dsp.js fixes the sample rate at 44100, so the AudioContext must be
// created with `{ sampleRate: 44100 }`. On a device that natively runs 48 kHz
// the browser resamples the output, which is fine; what is not fine is the
// worklet thinking a second is 44100 frames while the context thinks it is
// 48000, which detunes everything by a whole tone.

import { Voice } from './core/voice.js';
import { instrumentFor } from './core/instruments.js';
import { Echo } from './core/dsp.js';

class LiveProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.voices = new Map();
    // Events with a time in the future wait here. Scheduling from the main
    // thread with setTimeout would put several milliseconds of jitter on every
    // note, which is audible on anything with a sharp attack; the worklet has
    // the audio clock, so it does the waiting.
    this.pending = [];
    this.echo = null;
    this.echoSend = 0;
    this.port.onmessage = (e) => this.handle(e.data);
    this.port.postMessage({ type: 'ready', sampleRate });
  }

  handle(m) {
    if (m.at !== undefined && m.at > currentTime) { this.pending.push(m); return; }
    this.fire(m);
  }

  fire(m) {
    switch (m.type) {
      case 'on': {
        const { inst } = instrumentFor(m.inst, m.era);
        this.voices.set(m.id, new Voice(inst, m.note, {
          gain: m.gain ?? 0.25, pan: m.pan ?? 0, dur: Infinity,
          send: m.era === '16bit' ? 0.12 : 0,
        }));
        this.echoSend = m.era === '16bit' ? 1 : 0;
        break;
      }
      case 'off':
        this.voices.get(m.id)?.release();
        break;
      case 'panic':
        this.voices.clear();
        this.pending.length = 0;
        break;
      default:
    }
  }

  process(inputs, outputs) {
    if (this.pending.length) {
      // Anything due within this block fires now. A block is 2.9 ms, which is
      // below what anyone hears as early or late.
      const due = currentTime + 128 / sampleRate;
      for (let i = this.pending.length - 1; i >= 0; i--) {
        if (this.pending[i].at <= due) this.fire(this.pending.splice(i, 1)[0]);
      }
    }
    const out = outputs[0];
    const L = out[0];
    const R = out.length > 1 ? out[1] : out[0];
    const n = L.length;
    L.fill(0);
    if (R !== L) R.fill(0);

    if (this.voices.size || this.pending.length) {
      const S = this.echoSend ? (this.send ||= new Float32Array(n)) : null;
      if (S) S.fill(0);
      for (const [id, v] of this.voices) {
        if (!v.fill(L, R, S, 0, n)) this.voices.delete(id);
      }
      if (S) {
        this.echo ||= new Echo(0.19, 0.33, 4000, sampleRate);
        for (let i = 0; i < n; i++) {
          const w = this.echo.run(S[i]) * 0.5;
          L[i] += w * 0.9;
          R[i] += w;
        }
      }
      // A hard ceiling, because a handful of held notes at full gain will go
      // past 1.0 and a worklet has no limiter behind it.
      for (let i = 0; i < n; i++) {
        if (L[i] > 0.92) L[i] = 0.92; else if (L[i] < -0.92) L[i] = -0.92;
        if (R[i] > 0.92) R[i] = 0.92; else if (R[i] < -0.92) R[i] = -0.92;
      }
    }
    return true;
  }
}

registerProcessor('live', LiveProcessor);
