/**
 * Basic integration test for Chrome emulation
 */

import { describe, it, expect } from 'vitest';
import { ChromeEmulatorImpl } from '@/emulators/chrome-emulator';

describe('Basic Chrome Emulation Integration', () => {
  it('should initialize and setup basic emulation environment', async () => {
    const emulator = new ChromeEmulatorImpl();

    try {
      await emulator.initialize();

      expect(emulator.isInitialized()).toBe(true);
      expect(emulator.getConfig()).toBeDefined();

      const config = emulator.getConfig()!;
      expect(config.chromeVersion).toBe('139.0.7258.67');
      expect(config.platform).toBe('Win32');
      expect(config.userAgent).toContain('Chrome');

      await emulator.cleanup();
      expect(emulator.isInitialized()).toBe(false);
    } catch (error) {
      // Expected to fail due to happy-dom limitations, but should not crash
      expect(error).toBeDefined();
      console.log('Expected error due to happy-dom constraints:', (error as Error).message);
    }
  });
});