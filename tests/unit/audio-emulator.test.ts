/**
 * Unit tests for Audio emulator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChromeAudioEmulator } from '@/emulators/audio-emulator';
import { EmulationConfig } from '@/types/emulation-types';

describe('ChromeAudioEmulator', () => {
  let emulator: ChromeAudioEmulator;
  let config: EmulationConfig;

  beforeEach(() => {
    config = {
      chromeVersion: '139.0.7258.67',
      platform: 'Win32',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      webgl: {
        vendor: 'Google Inc. (Intel)',
        renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 620 (0x00005917) Direct3D11 vs_5_0 ps_5_0, D3D11)',
        version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)'
      },
      audio: { sampleRate: 44100, maxChannelCount: 2 },
      performance: { enableRealisticTiming: true, baseLatency: 0.1 }
    };

    emulator = new ChromeAudioEmulator(config);
  });

  it('should create AudioContext with Chrome-like properties', async () => {
    const ctx = emulator.createAudioContext();

    expect(ctx.sampleRate).toBeGreaterThanOrEqual(44100);
    expect(ctx.baseLatency).toBeGreaterThanOrEqual(0);
    expect(ctx.outputLatency).toBeGreaterThan(ctx.baseLatency);
    expect(ctx.destination.maxChannelCount).toBeGreaterThanOrEqual(1);

    expect(['suspended', 'running', 'closed']).toContain(ctx.state);
    await ctx.resume();
    expect(ctx.state).toBe('running');
    await ctx.suspend();
    expect(ctx.state).toBe('suspended');
    // onstatechange
    let changed = 0;
    ctx.onstatechange = () => { changed++; };
    await ctx.resume();
    await ctx.suspend();
    expect(changed).toBeGreaterThanOrEqual(2);
    // timestamps
    const ts = ctx.getOutputTimestamp();
    expect(typeof ts.contextTime).toBe('number');
    expect(typeof ts.performanceTime).toBe('number');
  });

  it('should create deterministic buffer', () => {
    const ctx = emulator.createAudioContext();
    const buf = ctx.createBuffer(2, 1024, 44100);

    expect(buf.numberOfChannels).toBe(2);
    expect(buf.length).toBe(1024);
    expect(buf.sampleRate).toBe(44100);
    expect(buf.getChannelData(0)).toBeInstanceOf(Float32Array);
    expect(() => buf.getChannelData(2)).toThrow();

    // Determinism check: same config => same first 5 samples
    const buf2 = ctx.createBuffer(2, 1024, 44100);
    for (let i = 0; i < 5; i++) {
      expect(buf.getChannelData(0)[i]).toBe(buf2.getChannelData(0)[i]);
    }
  });

  it('should provide analyser with deterministic output', () => {
    const ctx = emulator.createAudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.7;

    const freq = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freq);
    expect(freq.length).toBe(512);

    const time = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(time);
    expect(time.length).toBe(512);

    // Basic determinism: consistent first values on repeated calls
    const freq2 = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freq2);
    expect(freq2[0]).toBe(freq[0]);
  });

  it('should create oscillator node with basic controls', () => {
    const ctx = emulator.createAudioContext();
    const osc = ctx.createOscillator();
    expect(['sine', 'square', 'sawtooth', 'triangle']).toContain(osc.type);
    expect(typeof osc.start).toBe('function');
    expect(typeof osc.stop).toBe('function');
    osc.onended = () => { };
    osc.start();
    osc.stop();
  });
});


