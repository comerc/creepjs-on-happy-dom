/**
 * Unit tests for ChromeEmulator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChromeEmulatorImpl } from '@/emulators/chrome-emulator';
import { EmulationError } from '@/types/error-types';

describe('ChromeEmulator', () => {
  let emulator: ChromeEmulatorImpl;

  beforeEach(() => {
    emulator = new ChromeEmulatorImpl();
  });

  afterEach(async () => {
    if (emulator.isInitialized()) {
      await emulator.cleanup();
    }
  });

  describe('initialization', () => {
    it('should initialize with default configuration', async () => {
      await emulator.initialize();

      expect(emulator.isInitialized()).toBe(true);
      expect(emulator.getConfig()).toBeDefined();
      expect(emulator.getConfig()?.chromeVersion).toBe('139.0.7258.67');
    });

    it('should initialize with specific profile', async () => {
      await emulator.initialize(undefined, 'chrome-139-macos');

      expect(emulator.isInitialized()).toBe(true);
      expect(emulator.getConfig()?.platform).toBe('MacIntel');
    });

    it('should throw error for invalid profile', async () => {
      await expect(emulator.initialize(undefined, 'invalid-profile'))
        .rejects.toThrow(EmulationError);
    });
  });

  describe('environment setup', () => {
    it('should setup environment after initialization', async () => {
      await emulator.initialize();

      // Environment setup is called during initialization
      expect(emulator.isInitialized()).toBe(true);
    });

    it('should throw error when setting up environment without config', async () => {
      await expect(emulator.setupEnvironment()).rejects.toThrow(EmulationError);
    });
  });

  describe('CreepJS execution', () => {
    it('should run CreepJS tests after initialization', async () => {
      await emulator.initialize();

      const results = await emulator.runCreepJS();

      expect(results).toBeDefined();
      expect(results.fingerprint).toBeDefined();
      expect(results.detectedBrowser).toBe('Chrome');
    });

    it('should throw error when running CreepJS without initialization', async () => {
      await expect(emulator.runCreepJS()).rejects.toThrow(EmulationError);
    });
  });

  describe('report generation', () => {
    it('should generate report after initialization', async () => {
      await emulator.initialize();

      const report = emulator.generateReport();

      expect(report).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.config).toBeDefined();
      expect(report.success).toBe(true);
    });

    it('should throw error when generating report without initialization', () => {
      expect(() => emulator.generateReport()).toThrow(EmulationError);
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources properly', async () => {
      await emulator.initialize();
      expect(emulator.isInitialized()).toBe(true);

      await emulator.cleanup();
      expect(emulator.isInitialized()).toBe(false);
      expect(emulator.getConfig()).toBeNull();
    });
  });
});