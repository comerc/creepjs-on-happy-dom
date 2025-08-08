/**
 * Integration tests for Chrome profiles
 */

import { describe, it, expect } from 'vitest';
import { ChromeEmulatorImpl } from '@/emulators/chrome-emulator';

describe('Chrome Profiles Integration', () => {
  const profiles = [
    // Latest Chrome 139 profiles
    { name: 'chrome-139-windows', expectedPlatform: 'Win32', expectedVersion: '139.0.7258.67' },
    { name: 'chrome-139-macos', expectedPlatform: 'MacIntel', expectedVersion: '139.0.7258.67' },
    { name: 'chrome-139-linux', expectedPlatform: 'Linux x86_64', expectedVersion: '139.0.7258.66' },
    { name: 'chrome-139-ios', expectedPlatform: 'iPhone', expectedVersion: '139.0.7258.76' },
    { name: 'chrome-139-android', expectedPlatform: 'Linux armv8l', expectedVersion: '139.0.7258.62' },


  ];

  profiles.forEach(profile => {
    it(`should initialize ${profile.name} profile correctly`, async () => {
      const emulator = new ChromeEmulatorImpl();

      try {
        await emulator.initialize(undefined, profile.name);

        expect(emulator.isInitialized()).toBe(true);

        const config = emulator.getConfig();
        expect(config).toBeDefined();
        expect(config?.chromeVersion).toBe(profile.expectedVersion);
        expect(config?.platform).toBe(profile.expectedPlatform);
        // iOS Chrome uses "CriOS" instead of "Chrome" in user agent
        if (profile.name.includes('ios')) {
          expect(config?.userAgent).toContain('CriOS');
        } else {
          expect(config?.userAgent).toContain('Chrome');
        }

        // Test that user agent contains the correct version (Chrome 139)
        expect(config?.userAgent).toContain('139.0.0.0');

        await emulator.cleanup();
        expect(emulator.isInitialized()).toBe(false);

      } catch (error) {
        // If there's an error, make sure to cleanup
        if (emulator.isInitialized()) {
          await emulator.cleanup();
        }
        throw error;
      }
    });
  });

  it('should use Chrome 139 as default configuration', async () => {
    const emulator = new ChromeEmulatorImpl();

    try {
      await emulator.initialize();

      const config = emulator.getConfig();
      expect(config?.chromeVersion).toBe('139.0.7258.67');
      expect(config?.platform).toBe('Win32');
      expect(config?.userAgent).toContain('Chrome/139.0.0.0');

      await emulator.cleanup();
    } catch (error) {
      if (emulator.isInitialized()) {
        await emulator.cleanup();
      }
      throw error;
    }
  });

  it('should handle mobile profiles with correct viewport sizes', async () => {
    const mobileProfiles = [
      { name: 'chrome-139-ios', expectedWidth: 390, expectedHeight: 844 },
      { name: 'chrome-139-android', expectedWidth: 412, expectedHeight: 915 }
    ];

    for (const profile of mobileProfiles) {
      const emulator = new ChromeEmulatorImpl();

      try {
        await emulator.initialize(undefined, profile.name);

        const config = emulator.getConfig();
        expect(config?.viewport.width).toBe(profile.expectedWidth);
        expect(config?.viewport.height).toBe(profile.expectedHeight);
        expect(config?.userAgent).toContain('Mobile');

        await emulator.cleanup();
      } catch (error) {
        if (emulator.isInitialized()) {
          await emulator.cleanup();
        }
        throw error;
      }
    }
  });
});