/**
 * Unit tests for Performance emulator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChromePerformanceEmulator } from '@/emulators/performance-emulator';
import { EmulationConfig } from '@/types/emulation-types';

describe('ChromePerformanceEmulator', () => {
  let emulator: ChromePerformanceEmulator;
  let config: EmulationConfig;
  let win: any;

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

    emulator = new ChromePerformanceEmulator(config);
    win = {};
    emulator.install(win);
  });

  it('should install performance API with monotonic now()', async () => {
    const p = win.performance;
    expect(p).toBeDefined();
    const a = p.now();
    const b = p.now();
    expect(b).toBeGreaterThanOrEqual(a);
    expect(typeof p.timeOrigin).toBe('number');
  });

  it('should expose navigation and resource entries', () => {
    const p = win.performance;
    const nav = p.getEntriesByType('navigation');
    const res = p.getEntriesByType('resource');
    expect(nav.length).toBeGreaterThan(0);
    expect(res.length).toBeGreaterThan(0);
    const all = p.getEntries();
    expect(all.length).toBe(nav.length + res.length);
  });

  it('should support User Timing marks and measures', () => {
    const p = win.performance;
    p.mark('start');
    p.mark('mid');
    p.measure('measure1', 'start', 'mid');
    // object syntax
    p.measure('measure2', { start: 'start' });
    const marks = p.getEntriesByType('mark');
    const measures = p.getEntriesByType('measure');
    expect(marks.length).toBeGreaterThanOrEqual(2);
    expect(measures.length).toBeGreaterThanOrEqual(2);
    expect(measures[0].duration).toBeGreaterThanOrEqual(0);

    const byName = p.getEntriesByName('measure1', 'measure');
    expect(byName.length).toBe(1);
    const byNameNoType = p.getEntriesByName('measure1');
    expect(byNameNoType.length).toBeGreaterThanOrEqual(1);

    p.clearMarks('mid');
    expect(p.getEntriesByName('mid', 'mark').length).toBe(0);

    p.clearMeasures();
    expect(p.getEntriesByType('measure').length).toBe(0);
  });

  it('should respect resource timing buffer size', () => {
    const p = win.performance;
    p.setResourceTimingBufferSize(5);
    for (let i = 0; i < 10; i++) {
      emulator.addResourceTiming({ name: `https://example.com/r${i}.js`, initiatorType: 'script' });
    }
    const res = p.getEntriesByType('resource');
    expect(res.length).toBe(5);
    // serverTiming presence
    expect(res[0].serverTiming?.length).toBeGreaterThan(0);
  });
});


