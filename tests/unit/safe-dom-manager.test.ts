/**
 * Unit tests for SafeDOMManager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SafeDOMManager } from '@/emulators/dom-manager-safe';
import { EmulationConfig } from '@/types/emulation-types';

describe('SafeDOMManager', () => {
  let domManager: SafeDOMManager;
  let config: EmulationConfig;

  beforeEach(() => {
    config = {
      chromeVersion: '139.0.7258.67',
      platform: 'Win32',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      webgl: {
        vendor: 'Google Inc. (Intel)',
        renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 620)',
        version: 'WebGL 1.0'
      },
      audio: { sampleRate: 44100, maxChannelCount: 2 },
      performance: { enableRealisticTiming: true, baseLatency: 0.1 }
    };

    domManager = new SafeDOMManager(config);
  });

  afterEach(() => {
    domManager.cleanup();
  });

  describe('window setup', () => {
    it('should create window with correct dimensions', async () => {
      const window = await domManager.setupWindow();

      expect(window).toBeDefined();
      expect(window.innerWidth).toBe(1920);
      expect(window.innerHeight).toBe(1080);
    });

    it('should configure Chrome properties safely', async () => {
      const window = await domManager.setupWindow();

      expect(window).toBeDefined();
      expect((window as any).chrome).toBeDefined();
      expect((window as any).chrome.runtime).toBeDefined();
    });

    it('should setup performance API', async () => {
      const window = await domManager.setupWindow();

      expect(window.performance).toBeDefined();
      expect(window.performance.now).toBeInstanceOf(Function);
      expect(window.performance.memory).toBeDefined();
    });

    it('should inject AudioContext API', async () => {
      const window = await domManager.setupWindow();
      expect((window as any).AudioContext).toBeDefined();
      const ctx = new (window as any).AudioContext();
      expect(ctx.sampleRate).toBeGreaterThan(0);
      expect(typeof ctx.createAnalyser).toBe('function');
    });
  });

  describe('document configuration', () => {
    it('should configure document after window setup', async () => {
      await domManager.setupWindow();
      const document = domManager.configureDocument();

      expect(document).toBeDefined();
      expect(document.title).toBe('Chrome Emulation Environment');
    });

    it('should throw error when configuring document without window', () => {
      expect(() => domManager.configureDocument()).toThrow();
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources properly', async () => {
      await domManager.setupWindow();
      domManager.configureDocument();

      domManager.cleanup();

      expect(domManager.getWindow()).toBeNull();
      expect(domManager.getDocument()).toBeNull();
    });
  });
});