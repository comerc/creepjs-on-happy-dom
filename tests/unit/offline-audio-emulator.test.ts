import { describe, it, expect, beforeEach } from 'vitest';
import { ChromeAudioEmulator } from '@/emulators/audio-emulator';
import { EmulationConfig } from '@/types/emulation-types';

describe('OfflineAudioContext (emulator)', () => {
  let emulator: ChromeAudioEmulator;
  let config: EmulationConfig;

  beforeEach(() => {
    config = {
      chromeVersion: '139.0.7258.67',
      platform: 'Win32',
      userAgent: 'UA',
      viewport: { width: 1920, height: 1080 },
      webgl: { vendor: 'V', renderer: 'R', version: 'WebGL 1.0' },
      audio: { sampleRate: 48000, maxChannelCount: 2 },
      performance: { enableRealisticTiming: true, baseLatency: 0.1 }
    };
    emulator = new ChromeAudioEmulator(config);
  });

  it('should render deterministic buffer', async () => {
    const oac = emulator.createOfflineAudioContext(2, 2048, 48000);
    const gain = oac.createGain();
    gain.gain.value = 0.9;
    const filter = oac.createBiquadFilter();
    filter.frequency.value = 1200;
    const comp = oac.createDynamicsCompressor();
    comp.ratio.value = 8;
    // Build graph
    gain.connect(filter);
    filter.connect(comp);

    const buf = await oac.startRendering();
    expect(buf.length).toBe(2048);
    expect(buf.sampleRate).toBe(48000);
    expect(buf.numberOfChannels).toBe(2);
  });
});


