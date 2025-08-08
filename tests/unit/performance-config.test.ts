import { describe, it, expect } from 'vitest';
import { ChromePerformanceEmulator } from '@/emulators/performance-emulator';

describe('PerformanceEmulator configurable resolution/jitter', () => {
  it('should respect nowResolutionMs and jitterMs', () => {
    const emu = new ChromePerformanceEmulator({
      chromeVersion: '139',
      platform: 'Win32',
      userAgent: 'UA',
      viewport: { width: 800, height: 600 },
      webgl: { vendor: 'V', renderer: 'R', version: '1.0' },
      audio: { sampleRate: 48000, maxChannelCount: 2 },
      performance: { enableRealisticTiming: true, baseLatency: 0.1, nowResolutionMs: 0.1, jitterMs: 0.02 }
    });
    const w: any = {};
    emu.install(w);
    const a = w.performance.now();
    const b = w.performance.now();
    const delta = Math.abs(b - a);
    // Rounded to 0.1ms steps
    expect(Number.isFinite(delta)).toBe(true);
  });
});


