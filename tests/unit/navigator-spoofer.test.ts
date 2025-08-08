/**
 * Unit tests for NavigatorSpoofer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NavigatorSpooferImpl } from '@/emulators/navigator-spoofer';
import { EmulationConfig } from '@/types/emulation-types';
import { Window } from 'happy-dom';

describe('NavigatorSpoofer', () => {
  let config: EmulationConfig;
  let window: Window;
  let navigatorSpoofer: NavigatorSpooferImpl;

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

    window = new Window();
    navigatorSpoofer = new NavigatorSpooferImpl(config, window);
  });

  describe('getChromeUserAgent', () => {
    it('should return the configured user agent', () => {
      const userAgent = navigatorSpoofer.getChromeUserAgent();
      expect(userAgent).toBe(config.userAgent);
    });
  });

  describe('setupNavigatorProperties', () => {
    beforeEach(() => {
      navigatorSpoofer.setupNavigatorProperties();
    });

    it('should set basic navigator properties', () => {
      const navigator = window.navigator;

      expect(navigator.userAgent).toBe(config.userAgent);
      expect(navigator.appName).toBe('Netscape');
      expect(navigator.appCodeName).toBe('Mozilla');
      expect(navigator.product).toBe('Gecko');
      expect(navigator.productSub).toBe('20030107');
      expect(navigator.vendor).toBe('Google Inc.');
      expect(navigator.vendorSub).toBe('');
    });

    it('should set platform-specific properties', () => {
      const navigator = window.navigator;

      expect(navigator.platform).toBe(config.platform);
      expect(navigator.hardwareConcurrency).toBe(8); // Windows default
      expect(navigator.deviceMemory).toBe(8); // Windows default
      expect(navigator.maxTouchPoints).toBe(0); // Desktop default
    });

    it('should set language properties', () => {
      const navigator = window.navigator;

      expect(navigator.language).toBe('en-US');
      expect(navigator.languages).toEqual(['en-US', 'en']);
      expect(Object.isFrozen(navigator.languages)).toBe(true);
    });

    it('should set Chrome-specific properties', () => {
      const navigator = window.navigator;

      expect(navigator.onLine).toBe(true);
      expect(navigator.cookieEnabled).toBe(true);
      expect(navigator.doNotTrack).toBe(null);
      expect(navigator.pdfViewerEnabled).toBe(true);
      expect(navigator.webdriver).toBe(undefined);
    });

    it('should configure plugins', () => {
      const navigator = window.navigator;

      expect(navigator.plugins).toBeDefined();
      expect(navigator.plugins.length).toBeGreaterThan(0);
      expect(navigator.plugins[0].name).toContain('PDF');
    });

    it('should configure MIME types', () => {
      const navigator = window.navigator;

      expect(navigator.mimeTypes).toBeDefined();
      expect(navigator.mimeTypes.length).toBeGreaterThan(0);
      expect(navigator.mimeTypes[0].type).toBe('application/pdf');
    });
  });

  describe('configurePlatform', () => {
    it('should configure Windows platform correctly', () => {
      navigatorSpoofer.configurePlatform();
      const navigator = window.navigator;

      expect(navigator.platform).toBe('Win32');
      expect(navigator.hardwareConcurrency).toBe(8);
      expect(navigator.deviceMemory).toBe(8);
      expect(navigator.maxTouchPoints).toBe(0);
    });

    it('should configure macOS platform correctly', () => {
      config.platform = 'MacIntel';
      navigatorSpoofer = new NavigatorSpooferImpl(config, window);
      navigatorSpoofer.configurePlatform();
      const navigator = window.navigator;

      expect(navigator.platform).toBe('MacIntel');
      expect(navigator.hardwareConcurrency).toBe(8);
      expect(navigator.deviceMemory).toBe(16);
      expect(navigator.maxTouchPoints).toBe(0);
    });

    it('should configure mobile platform correctly', () => {
      config.platform = 'iPhone';
      navigatorSpoofer = new NavigatorSpooferImpl(config, window);
      navigatorSpoofer.configurePlatform();
      const navigator = window.navigator;

      expect(navigator.platform).toBe('iPhone');
      expect(navigator.hardwareConcurrency).toBe(6);
      expect(navigator.deviceMemory).toBe(6);
      expect(navigator.maxTouchPoints).toBe(5);
    });
  });

  describe('setupLanguages', () => {
    it('should set default English language', () => {
      navigatorSpoofer.setupLanguages();
      const navigator = window.navigator;

      expect(navigator.language).toBe('en-US');
      expect(navigator.languages).toEqual(['en-US', 'en']);
    });
  });

  describe('configurePlugins', () => {
    beforeEach(() => {
      navigatorSpoofer.configurePlugins();
    });

    it('should create plugins collection with proper methods', () => {
      const navigator = window.navigator;
      const plugins = navigator.plugins;

      expect(plugins.length).toBeGreaterThan(0);
      expect(typeof plugins.item).toBe('function');
      expect(typeof plugins.namedItem).toBe('function');
      expect(typeof plugins.refresh).toBe('function');
    });

    it('should create MIME types collection with proper methods', () => {
      const navigator = window.navigator;
      const mimeTypes = navigator.mimeTypes;

      expect(mimeTypes.length).toBeGreaterThan(0);
      expect(typeof mimeTypes.item).toBe('function');
      expect(typeof mimeTypes.namedItem).toBe('function');
    });

    it('should link MIME types to plugins', () => {
      const navigator = window.navigator;
      const mimeType = navigator.mimeTypes[0];

      expect(mimeType.enabledPlugin).toBeDefined();
      expect(mimeType.enabledPlugin.name).toContain('PDF');
    });

    it('should support iteration over plugins', () => {
      const navigator = window.navigator;
      const plugins = Array.from(navigator.plugins);

      expect(plugins.length).toBe(navigator.plugins.length);
      expect(plugins[0].name).toContain('PDF');
    });

    it('should support iteration over MIME types', () => {
      const navigator = window.navigator;
      const mimeTypes = Array.from(navigator.mimeTypes);

      expect(mimeTypes.length).toBe(navigator.mimeTypes.length);
      expect(mimeTypes[0].type).toBe('application/pdf');
    });
  });

  describe('setupDetectionEvasion', () => {
    beforeEach(() => {
      navigatorSpoofer.setupNavigatorProperties();
    });

    it('should hide webdriver properties', () => {
      const navigator = window.navigator;

      expect(navigator.webdriver).toBe(undefined);
      expect(window.webdriver).toBe(undefined);
      expect((window as any)._phantom).toBe(undefined);
      expect((window as any).__nightmare).toBe(undefined);
    });

    it('should add Chrome-specific methods', () => {
      const navigator = window.navigator;

      expect(typeof navigator.sendBeacon).toBe('function');
      expect(typeof navigator.vibrate).toBe('function');
      expect(navigator.permissions).toBeDefined();
      expect(navigator.serviceWorker).toBeDefined();
      expect(navigator.storage).toBeDefined();
      expect(navigator.connection).toBeDefined();
      expect(navigator.clipboard).toBeDefined();
    });

    it('should setup screen properties for headless detection evasion', () => {
      expect(window.screen.width).toBe(config.viewport.width);
      expect(window.screen.height).toBe(config.viewport.height);
      expect(window.screen.colorDepth).toBe(24);
      expect(window.screen.pixelDepth).toBe(24);
    });

    it('should setup window dimensions', () => {
      expect(window.outerWidth).toBe(config.viewport.width);
      expect(window.outerHeight).toBe(config.viewport.height);
      expect(window.innerWidth).toBe(config.viewport.width);
      expect(window.innerHeight).toBe(config.viewport.height);
    });

    it('should setup chrome global object', () => {
      expect(window.chrome).toBeDefined();
      expect(typeof window.chrome.loadTimes).toBe('function');
      expect(typeof window.chrome.csi).toBe('function');
      expect(window.chrome.runtime).toBeDefined();
    });

    it('should setup automation detection evasion', () => {
      expect(window.Notification.permission).toBe('default');
      expect(typeof window.navigator.registerProtocolHandler).toBe('function');
      expect(typeof window.navigator.getBattery).toBe('function');
      expect(window.navigator.mediaDevices).toBeDefined();
    });
  });

  describe('hideWebDriverProperties', () => {
    it('should hide webdriver property completely', () => {
      navigatorSpoofer.hideWebDriverProperties();
      const navigator = window.navigator;

      expect(navigator.webdriver).toBe(undefined);
      // Property exists but is not enumerable and returns undefined
      expect('webdriver' in navigator).toBe(true);
      expect(Object.propertyIsEnumerable.call(navigator, 'webdriver')).toBe(false);
    });

    it('should remove automation framework indicators', () => {
      // Set some automation indicators
      (window as any).webdriver = true;
      (window as any)._phantom = {};
      (window as any).__nightmare = {};

      navigatorSpoofer.hideWebDriverProperties();

      expect(window.webdriver).toBe(undefined);
      expect((window as any)._phantom).toBe(undefined);
      expect((window as any).__nightmare).toBe(undefined);
    });
  });

  describe('addChromeSpecificMethods', () => {
    beforeEach(() => {
      navigatorSpoofer.addChromeSpecificMethods();
    });

    it('should add sendBeacon method', () => {
      const navigator = window.navigator;
      expect(typeof navigator.sendBeacon).toBe('function');
      expect(navigator.sendBeacon('http://example.com', 'data')).toBe(true);
    });

    it('should add vibrate method with platform-specific behavior', () => {
      const navigator = window.navigator;
      expect(typeof navigator.vibrate).toBe('function');

      // Desktop should return false
      expect(navigator.vibrate([100, 200, 100])).toBe(false);
    });

    it('should add permissions API', async () => {
      const navigator = window.navigator;
      const result = await navigator.permissions.query({ name: 'camera' });
      expect(result.state).toBe('granted');
    });

    it('should add service worker API', async () => {
      const navigator = window.navigator;
      expect(navigator.serviceWorker).toBeDefined();
      expect(typeof navigator.serviceWorker.register).toBe('function');

      const registration = await navigator.serviceWorker.register('/sw.js');
      expect(registration.scope).toBe('/');
    });

    it('should add storage API', async () => {
      const navigator = window.navigator;
      const estimate = await navigator.storage.estimate();
      expect(estimate.quota).toBeGreaterThan(0);
      expect(estimate.usage).toBeGreaterThan(0);
    });

    it('should add connection API', () => {
      const navigator = window.navigator;
      expect(navigator.connection).toBeDefined();
      expect(navigator.connection.effectiveType).toBe('4g');
      expect(typeof navigator.connection.rtt).toBe('number');
    });

    it('should add clipboard API', async () => {
      const navigator = window.navigator;
      expect(navigator.clipboard).toBeDefined();
      expect(typeof navigator.clipboard.readText).toBe('function');
      expect(typeof navigator.clipboard.writeText).toBe('function');

      const text = await navigator.clipboard.readText();
      expect(typeof text).toBe('string');
    });
  });

  describe('error handling', () => {
    it('should handle invalid configuration gracefully', () => {
      const invalidConfig = { ...config, userAgent: '' };
      const spoofer = new NavigatorSpooferImpl(invalidConfig, window);

      expect(() => spoofer.getChromeUserAgent()).not.toThrow();
    });

    it('should handle missing window object gracefully', () => {
      const spoofer = new NavigatorSpooferImpl(config, null);

      expect(() => spoofer.setupNavigatorProperties()).toThrow();
    });

    it('should handle detection evasion setup errors', () => {
      const spoofer = new NavigatorSpooferImpl(config, {});

      expect(() => spoofer.setupDetectionEvasion()).toThrow();
    });
  });
});