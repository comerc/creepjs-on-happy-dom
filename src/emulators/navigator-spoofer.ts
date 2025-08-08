/**
 * Navigator spoofing implementation for Chrome emulation
 * Handles user agent generation, navigator properties, plugins, and MIME types
 */

import { EmulationConfig } from '@/types/emulation-types';
import { EmulationError } from '@/types/error-types';

export interface NavigatorSpoofer {
  getChromeUserAgent(): string;
  setupNavigatorProperties(): void;
  configurePlugins(): void;
  setupLanguages(): void;
  configurePlatform(): void;
  setupDetectionEvasion(): void;
  hideWebDriverProperties(): void;
  addChromeSpecificMethods(): void;
}

export interface ChromePlugin {
  name: string;
  filename: string;
  description: string;
  mimeTypes: ChromeMimeType[];
}

export interface ChromeMimeType {
  type: string;
  description: string;
  suffixes: string;
}

export class NavigatorSpooferImpl implements NavigatorSpoofer {
  private config: EmulationConfig;
  private globalWindow: any;

  constructor(config: EmulationConfig, globalWindow: any) {
    this.config = config;
    this.globalWindow = globalWindow;
  }

  /**
   * Generate Chrome user agent string based on configuration
   */
  getChromeUserAgent(): string {
    try {
      // Return the configured user agent
      return this.config.userAgent;
    } catch (error) {
      throw new EmulationError(
        `Failed to generate Chrome user agent: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'emulation',
        'NavigatorSpoofer'
      );
    }
  }

  /**
   * Setup navigator object properties to match Chrome
   */
  setupNavigatorProperties(): void {
    try {
      const navigator = this.globalWindow.navigator;

      // Core navigator properties
      Object.defineProperty(navigator, 'userAgent', {
        value: this.config.userAgent,
        writable: false,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(navigator, 'appVersion', {
        value: this.getAppVersion(),
        writable: false,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(navigator, 'appName', {
        value: 'Netscape',
        writable: false,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(navigator, 'appCodeName', {
        value: 'Mozilla',
        writable: false,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(navigator, 'product', {
        value: 'Gecko',
        writable: false,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(navigator, 'productSub', {
        value: '20030107',
        writable: false,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(navigator, 'vendor', {
        value: 'Google Inc.',
        writable: false,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(navigator, 'vendorSub', {
        value: '',
        writable: false,
        enumerable: true,
        configurable: true
      });

      // Platform and hardware properties
      this.configurePlatform();

      // Language properties
      this.setupLanguages();

      // Plugin and MIME type properties
      this.configurePlugins();

      // Additional Chrome-specific properties
      this.setupChromeSpecificProperties();

      // Detection evasion mechanisms
      this.setupDetectionEvasion();

    } catch (error) {
      throw new EmulationError(
        `Failed to setup navigator properties: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'emulation',
        'NavigatorSpoofer'
      );
    }
  }

  /**
   * Configure platform-specific properties
   */
  configurePlatform(): void {
    try {
      const navigator = this.globalWindow.navigator;

      Object.defineProperty(navigator, 'platform', {
        value: this.config.platform,
        writable: false,
        enumerable: true,
        configurable: true
      });

      // Hardware concurrency (typical values for different platforms)
      const hardwareConcurrency = this.getHardwareConcurrency();
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: hardwareConcurrency,
        writable: false,
        enumerable: true,
        configurable: true
      });

      // Device memory (Chrome-specific)
      const deviceMemory = this.getDeviceMemory();
      Object.defineProperty(navigator, 'deviceMemory', {
        value: deviceMemory,
        writable: false,
        enumerable: true,
        configurable: true
      });

      // Max touch points
      const maxTouchPoints = this.getMaxTouchPoints();
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: maxTouchPoints,
        writable: false,
        enumerable: true,
        configurable: true
      });

    } catch (error) {
      throw new EmulationError(
        `Failed to configure platform properties: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'emulation',
        'NavigatorSpoofer'
      );
    }
  }

  /**
   * Setup language properties
   */
  setupLanguages(): void {
    try {
      const navigator = this.globalWindow.navigator;

      // Default to English US, but can be configured
      const languages = ['en-US', 'en'];
      const language = 'en-US';

      Object.defineProperty(navigator, 'language', {
        value: language,
        writable: false,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(navigator, 'languages', {
        value: Object.freeze([...languages]),
        writable: false,
        enumerable: true,
        configurable: true
      });

    } catch (error) {
      throw new EmulationError(
        `Failed to setup language properties: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'emulation',
        'NavigatorSpoofer'
      );
    }
  }

  /**
   * Configure plugins and MIME types to match Chrome
   */
  configurePlugins(): void {
    try {
      const navigator = this.globalWindow.navigator;

      // Chrome's typical plugins
      const chromePlugins = this.getChromePlugins();
      const chromeMimeTypes = this.getChromeMimeTypes();

      // Create plugins array
      const plugins = chromePlugins.map((plugin) => ({
        ...plugin,
        length: plugin.mimeTypes.length,
        item: (i: number) => plugin.mimeTypes[i] || null,
        namedItem: (name: string) => plugin.mimeTypes.find(mt => mt.type === name) || null,
        [Symbol.iterator]: function* (this: any): Generator<any, void, unknown> {
          for (let i = 0; i < this.length; i++) {
            yield this.item(i);
          }
        }
      }));

      // Create MIME types array
      const mimeTypes = chromeMimeTypes.map((mimeType) => ({
        ...mimeType,
        enabledPlugin: chromePlugins.find(p => p.mimeTypes.some(mt => mt.type === mimeType.type)) || null
      }));

      // Setup plugins collection
      const pluginsCollection = Object.assign(plugins, {
        length: plugins.length,
        item: (index: number) => plugins[index] || null,
        namedItem: (name: string) => plugins.find(p => p.name === name) || null,
        refresh: () => { },
        [Symbol.iterator]: function* (this: any): Generator<any, void, unknown> {
          for (let i = 0; i < this.length; i++) {
            yield this.item(i);
          }
        }
      });

      // Setup MIME types collection
      const mimeTypesCollection = Object.assign(mimeTypes, {
        length: mimeTypes.length,
        item: (index: number) => mimeTypes[index] || null,
        namedItem: (name: string) => mimeTypes.find(mt => mt.type === name) || null,
        [Symbol.iterator]: function* (this: any): Generator<any, void, unknown> {
          for (let i = 0; i < this.length; i++) {
            yield this.item(i);
          }
        }
      });

      Object.defineProperty(navigator, 'plugins', {
        value: pluginsCollection,
        writable: false,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(navigator, 'mimeTypes', {
        value: mimeTypesCollection,
        writable: false,
        enumerable: true,
        configurable: true
      });

    } catch (error) {
      throw new EmulationError(
        `Failed to configure plugins: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'emulation',
        'NavigatorSpoofer'
      );
    }
  }

  /**
   * Setup Chrome-specific navigator properties
   */
  private setupChromeSpecificProperties(): void {
    const navigator = this.globalWindow.navigator;

    // Online status
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: false,
      enumerable: true,
      configurable: true
    });

    // Cookie enabled
    Object.defineProperty(navigator, 'cookieEnabled', {
      value: true,
      writable: false,
      enumerable: true,
      configurable: true
    });

    // Do not track
    Object.defineProperty(navigator, 'doNotTrack', {
      value: null,
      writable: false,
      enumerable: true,
      configurable: true
    });

    // PDF viewer enabled (Chrome-specific)
    Object.defineProperty(navigator, 'pdfViewerEnabled', {
      value: true,
      writable: false,
      enumerable: true,
      configurable: true
    });

    // WebDriver property (should be undefined to avoid detection)
    Object.defineProperty(navigator, 'webdriver', {
      value: undefined,
      writable: false,
      enumerable: false,
      configurable: true
    });
  }

  /**
   * Get app version string
   */
  private getAppVersion(): string {
    // Extract version info from user agent
    const match = this.config.userAgent.match(/Chrome\/([0-9.]+)/);
    const chromeVersion = match ? match[1] : this.config.chromeVersion;

    if (this.config.platform === 'Win32') {
      return `5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
    } else if (this.config.platform === 'MacIntel') {
      return `5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
    } else if (this.config.platform.includes('Linux')) {
      return `5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
    }

    return `5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
  }

  /**
   * Get hardware concurrency based on platform
   */
  private getHardwareConcurrency(): number {
    // Typical values for different platforms
    if (this.config.platform === 'Win32') return 8;
    if (this.config.platform === 'MacIntel') return 8;
    if (this.config.platform.includes('Linux')) return 4;
    if (this.config.platform === 'iPhone') return 6;
    if (this.config.platform.includes('Android')) return 8;
    return 4; // Default
  }

  /**
   * Get device memory based on platform
   */
  private getDeviceMemory(): number {
    // Typical values in GB
    if (this.config.platform === 'Win32') return 8;
    if (this.config.platform === 'MacIntel') return 16;
    if (this.config.platform.includes('Linux')) return 8;
    if (this.config.platform === 'iPhone') return 6;
    if (this.config.platform.includes('Android')) return 8;
    return 4; // Default
  }

  /**
   * Get max touch points based on platform
   */
  private getMaxTouchPoints(): number {
    if (this.config.platform === 'iPhone') return 5;
    if (this.config.platform.includes('Android')) return 10;
    return 0; // Desktop platforms
  }

  /**
   * Get Chrome plugins configuration
   */
  private getChromePlugins(): ChromePlugin[] {
    return [
      {
        name: 'PDF Viewer',
        filename: 'internal-pdf-viewer',
        description: 'Portable Document Format',
        mimeTypes: [
          {
            type: 'application/pdf',
            description: 'Portable Document Format',
            suffixes: 'pdf'
          }
        ]
      },
      {
        name: 'Chrome PDF Viewer',
        filename: 'internal-pdf-viewer',
        description: 'Portable Document Format',
        mimeTypes: [
          {
            type: 'application/pdf',
            description: 'Portable Document Format',
            suffixes: 'pdf'
          }
        ]
      },
      {
        name: 'Chromium PDF Viewer',
        filename: 'internal-pdf-viewer',
        description: 'Portable Document Format',
        mimeTypes: [
          {
            type: 'application/pdf',
            description: 'Portable Document Format',
            suffixes: 'pdf'
          }
        ]
      },
      {
        name: 'Microsoft Edge PDF Viewer',
        filename: 'internal-pdf-viewer',
        description: 'Portable Document Format',
        mimeTypes: [
          {
            type: 'application/pdf',
            description: 'Portable Document Format',
            suffixes: 'pdf'
          }
        ]
      },
      {
        name: 'WebKit built-in PDF',
        filename: 'internal-pdf-viewer',
        description: 'Portable Document Format',
        mimeTypes: [
          {
            type: 'application/pdf',
            description: 'Portable Document Format',
            suffixes: 'pdf'
          }
        ]
      }
    ];
  }

  /**
   * Get Chrome MIME types configuration
   */
  private getChromeMimeTypes(): ChromeMimeType[] {
    return [
      {
        type: 'application/pdf',
        description: 'Portable Document Format',
        suffixes: 'pdf'
      },
      {
        type: 'text/pdf',
        description: 'Portable Document Format',
        suffixes: 'pdf'
      }
    ];
  }

  /**
   * Setup detection evasion mechanisms
   */
  setupDetectionEvasion(): void {
    try {
      this.hideWebDriverProperties();
      this.addChromeSpecificMethods();
      this.setupHeadlessDetectionCountermeasures();
      this.setupAutomationDetectionEvasion();
    } catch (error) {
      throw new EmulationError(
        `Failed to setup detection evasion: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'emulation',
        'NavigatorSpoofer'
      );
    }
  }

  /**
   * Hide webdriver properties and automation indicators
   */
  hideWebDriverProperties(): void {
    try {
      const navigator = this.globalWindow.navigator;

      // Ensure webdriver property is undefined (not just false)
      if ('webdriver' in navigator) {
        delete navigator.webdriver;
      }
      Object.defineProperty(navigator, 'webdriver', {
        value: undefined,
        writable: false,
        enumerable: false,
        configurable: false
      });

      // Hide automation-related properties
      delete this.globalWindow.webdriver;
      delete this.globalWindow._phantom;
      delete this.globalWindow.__nightmare;
      delete this.globalWindow._selenium;
      delete this.globalWindow.callPhantom;
      delete this.globalWindow.callSelenium;
      delete this.globalWindow._Selenium_IDE_Recorder;

      // Remove common automation frameworks indicators
      delete this.globalWindow.spawn;
      delete this.globalWindow.emit;
      delete this.globalWindow.Buffer;

      // Override toString methods to hide function signatures
      const originalToString = Function.prototype.toString;
      Function.prototype.toString = function () {
        if (this === navigator.webdriver) {
          return 'function webdriver() { [native code] }';
        }
        return originalToString.call(this);
      };

    } catch (error) {
      throw new EmulationError(
        `Failed to hide webdriver properties: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'emulation',
        'NavigatorSpoofer'
      );
    }
  }

  /**
   * Add Chrome-specific navigator methods and properties
   */
  addChromeSpecificMethods(): void {
    try {
      const navigator = this.globalWindow.navigator;

      // Chrome-specific methods
      Object.defineProperty(navigator, 'sendBeacon', {
        value: function (_url: string, _data?: any): boolean {
          // Mock implementation - in real Chrome this sends data
          return true;
        },
        writable: true,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(navigator, 'vibrate', {
        value: function (this: any, pattern: number | number[]): boolean {
          void pattern;
          // Mock implementation - returns false on desktop Chrome
          return this.globalWindow.navigator.platform.includes('Mobile') ||
            this.globalWindow.navigator.platform === 'iPhone';
        }.bind(this),
        writable: true,
        enumerable: true,
        configurable: true
      });

      // Permissions API
      Object.defineProperty(navigator, 'permissions', {
        value: {
          query: async function (_permissionDesc: any) {
            return {
              state: 'granted',
              onchange: null
            };
          }
        },
        writable: true,
        enumerable: true,
        configurable: true
      });

      // Service Worker API
      if (!navigator.serviceWorker) {
        Object.defineProperty(navigator, 'serviceWorker', {
          value: {
            register: async function (_scriptURL: string, _options?: any) {
              return {
                installing: null,
                waiting: null,
                active: null,
                scope: '/',
                update: async () => { },
                unregister: async () => true
              };
            },
            getRegistration: async function (_scope?: string) {
              return null;
            },
            getRegistrations: async function () {
              return [];
            }
          },
          writable: true,
          enumerable: true,
          configurable: true
        });
      }

      // Storage API
      Object.defineProperty(navigator, 'storage', {
        value: {
          estimate: async function () {
            return {
              quota: 1000000000, // 1GB
              usage: 50000000,   // 50MB
              usageDetails: {}
            };
          },
          persist: async function () {
            return true;
          },
          persisted: async function () {
            return false;
          }
        },
        writable: true,
        enumerable: true,
        configurable: true
      });

      // Connection API (Network Information)
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '4g',
          rtt: 50,
          downlink: 10,
          saveData: false,
          onchange: null
        },
        writable: true,
        enumerable: true,
        configurable: true
      });

      // Clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          readText: async function () {
            return '';
          },
          writeText: async function (_text: string) {
            return;
          },
          read: async function () {
            return [];
          },
          write: async function (_data: any) {
            return;
          }
        },
        writable: true,
        enumerable: true,
        configurable: true
      });

    } catch (error) {
      throw new EmulationError(
        `Failed to add Chrome-specific methods: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'emulation',
        'NavigatorSpoofer'
      );
    }
  }

  /**
   * Setup headless browser detection countermeasures
   */
  private setupHeadlessDetectionCountermeasures(): void {
    try {
      // Override common headless detection methods

      // Mock screen properties to appear like a real display
      Object.defineProperty(this.globalWindow.screen, 'width', {
        value: this.config.viewport.width,
        writable: false,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(this.globalWindow.screen, 'height', {
        value: this.config.viewport.height,
        writable: false,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(this.globalWindow.screen, 'availWidth', {
        value: this.config.viewport.width,
        writable: false,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(this.globalWindow.screen, 'availHeight', {
        value: this.config.viewport.height - 40, // Account for taskbar
        writable: false,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(this.globalWindow.screen, 'colorDepth', {
        value: 24,
        writable: false,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(this.globalWindow.screen, 'pixelDepth', {
        value: 24,
        writable: false,
        enumerable: true,
        configurable: true
      });

      // Mock window properties
      Object.defineProperty(this.globalWindow, 'outerWidth', {
        value: this.config.viewport.width,
        writable: true,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(this.globalWindow, 'outerHeight', {
        value: this.config.viewport.height,
        writable: true,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(this.globalWindow, 'innerWidth', {
        value: this.config.viewport.width,
        writable: true,
        enumerable: true,
        configurable: true
      });

      Object.defineProperty(this.globalWindow, 'innerHeight', {
        value: this.config.viewport.height,
        writable: true,
        enumerable: true,
        configurable: true
      });

      // Mock chrome object (present in real Chrome)
      Object.defineProperty(this.globalWindow, 'chrome', {
        value: {
          runtime: {
            onConnect: null,
            onMessage: null
          },
          loadTimes: function () {
            return {
              requestTime: Date.now() / 1000,
              startLoadTime: Date.now() / 1000,
              commitLoadTime: Date.now() / 1000,
              finishDocumentLoadTime: Date.now() / 1000,
              finishLoadTime: Date.now() / 1000,
              firstPaintTime: Date.now() / 1000,
              firstPaintAfterLoadTime: 0,
              navigationType: 'Other'
            };
          },
          csi: function () {
            return {
              pageT: Date.now(),
              startE: Date.now(),
              tran: 15
            };
          }
        },
        writable: true,
        enumerable: true,
        configurable: true
      });

    } catch (error) {
      throw new EmulationError(
        `Failed to setup headless detection countermeasures: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'emulation',
        'NavigatorSpoofer'
      );
    }
  }

  /**
   * Setup automation detection evasion
   */
  private setupAutomationDetectionEvasion(): void {
    try {
      // Override common automation detection patterns

      // Mock notification permission (automation tools often have this denied)
      if (!this.globalWindow.Notification) {
        this.globalWindow.Notification = function () { };
      }
      Object.defineProperty(this.globalWindow.Notification, 'permission', {
        value: 'default',
        writable: false,
        enumerable: true,
        configurable: true
      });

      // Mock external protocol handlers
      Object.defineProperty(this.globalWindow.navigator, 'registerProtocolHandler', {
        value: function (_scheme: string, _url: string, _title: string) {
          // Mock implementation
        },
        writable: true,
        enumerable: true,
        configurable: true
      });

      // Mock battery API (often missing in headless)
      Object.defineProperty(this.globalWindow.navigator, 'getBattery', {
        value: async function () {
          return {
            charging: true,
            chargingTime: 0,
            dischargingTime: Infinity,
            level: 1,
            onchargingchange: null,
            onchargingtimechange: null,
            ondischargingtimechange: null,
            onlevelchange: null
          };
        },
        writable: true,
        enumerable: true,
        configurable: true
      });

      // Mock media devices (often restricted in automation)
      Object.defineProperty(this.globalWindow.navigator, 'mediaDevices', {
        value: {
          enumerateDevices: async function () {
            return [
              {
                deviceId: 'default',
                kind: 'audioinput',
                label: 'Default - Microphone (Built-in)',
                groupId: 'group1'
              },
              {
                deviceId: 'default',
                kind: 'audiooutput',
                label: 'Default - Speaker (Built-in)',
                groupId: 'group1'
              }
            ];
          },
          getUserMedia: async function (_constraints: any) {
            throw new Error('NotAllowedError');
          }
        },
        writable: true,
        enumerable: true,
        configurable: true
      });

      // Override Error.stack to hide automation traces
      const originalPrepareStackTrace = Error.prepareStackTrace;
      Error.prepareStackTrace = function (error, stack) {
        if (originalPrepareStackTrace) {
          return originalPrepareStackTrace(error, stack);
        }
        return stack.map(frame => frame.toString()).join('\n');
      };

    } catch (error) {
      throw new EmulationError(
        `Failed to setup automation detection evasion: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'emulation',
        'NavigatorSpoofer'
      );
    }
  }
}