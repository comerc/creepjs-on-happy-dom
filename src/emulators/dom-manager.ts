/**
 * DOMManager for happy-dom environment setup with Chrome characteristics
 */

import { Window } from 'happy-dom';
import { EmulationConfig } from '@/types/emulation-types';
import { EmulationError } from '@/types/error-types';

export interface DOMManager {
  setupWindow(): Window;
  configureDocument(): any;
  injectChromeAPIs(): void;
  setupEventHandlers(): void;
}

export class DOMManagerImpl implements DOMManager {
  private window: Window | null = null;
  private document: any | null = null;
  private config: EmulationConfig;

  constructor(config: EmulationConfig) {
    this.config = config;
  }

  /**
   * Setup global window object with Chrome characteristics
   */
  setupWindow(): Window {
    try {
      // Create happy-dom window with minimal configuration to avoid internal errors
      this.window = new Window({
        url: 'https://example.com',
        width: this.config.viewport.width,
        height: this.config.viewport.height
      });

      // Wait a bit for happy-dom to finish internal initialization
      setTimeout(() => {
        // Configure window properties to match Chrome after initialization
        this.configureWindowProperties();
      }, 0);

      // Setup global references - skip problematic ones
      try {
        (global as any).window = this.window;
        (global as any).document = this.window.document;
        (global as any).location = this.window.location;
        (global as any).history = this.window.history;
        (global as any).screen = this.window.screen;
        // Skip navigator as it has read-only properties
      } catch (error) {
        console.log('Some global references could not be set:', error);
      }

      return this.window;
    } catch (error) {
      throw new EmulationError(
        `Failed to setup window: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'initialization',
        'DOMManager'
      );
    }
  }

  /**
   * Configure document with Chrome-specific features
   */
  configureDocument(): any {
    if (!this.window) {
      throw new EmulationError(
        'Window not initialized',
        'runtime',
        'DOMManager'
      );
    }

    try {
      this.document = this.window.document;

      // Configure document properties
      this.configureDocumentProperties();

      // Note: readyState is managed by happy-dom internally and should not be overridden

      return this.document;
    } catch (error) {
      throw new EmulationError(
        `Failed to configure document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'initialization',
        'DOMManager'
      );
    }
  }

  /**
   * Inject Chrome-specific APIs and extensions
   */
  injectChromeAPIs(): void {
    if (!this.window) {
      throw new EmulationError(
        'Window not initialized',
        'runtime',
        'DOMManager'
      );
    }

    try {
      // Inject Chrome-specific APIs
      this.injectPerformanceAPI();
      this.injectWebGLAPI();
      this.injectCanvasAPI();
      this.injectAudioAPI();
      this.injectChromeSpecificProperties();

    } catch (error) {
      throw new EmulationError(
        `Failed to inject Chrome APIs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'initialization',
        'DOMManager'
      );
    }
  }

  /**
   * Setup event handlers for DOM events
   */
  setupEventHandlers(): void {
    if (!this.window || !this.document) {
      throw new EmulationError(
        'Window or document not initialized',
        'runtime',
        'DOMManager'
      );
    }

    try {
      // Setup DOMContentLoaded event
      this.document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM content loaded in emulated environment');
      });

      // Setup window load event
      this.window.addEventListener('load', () => {
        console.log('Window loaded in emulated environment');
      });

      // Setup error handling
      this.window.addEventListener('error', (event) => {
        console.error('Window error:', event);
      });

    } catch (error) {
      throw new EmulationError(
        `Failed to setup event handlers: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'initialization',
        'DOMManager'
      );
    }
  }

  /**
   * Configure window properties to match Chrome
   */
  private configureWindowProperties(): void {
    if (!this.window) return;

    // Configure navigator properties - use try/catch for read-only properties
    try {
      Object.defineProperty(this.window.navigator, 'userAgent', {
        value: this.config.userAgent,
        writable: false,
        configurable: true
      });
    } catch (error) {
      // Property might be read-only, try alternative approach
      (this.window.navigator as any).userAgent = this.config.userAgent;
    }

    try {
      Object.defineProperty(this.window.navigator, 'platform', {
        value: this.config.platform,
        writable: false,
        configurable: true
      });
    } catch (error) {
      (this.window.navigator as any).platform = this.config.platform;
    }

    try {
      Object.defineProperty(this.window.navigator, 'vendor', {
        value: 'Google Inc.',
        writable: false,
        configurable: true
      });
    } catch (error) {
      (this.window.navigator as any).vendor = 'Google Inc.';
    }

    try {
      Object.defineProperty(this.window.navigator, 'vendorSub', {
        value: '',
        writable: false,
        configurable: true
      });
    } catch (error) {
      (this.window.navigator as any).vendorSub = '';
    }

    // Configure screen properties with error handling
    const screenProps = [
      { name: 'width', value: this.config.viewport.width },
      { name: 'height', value: this.config.viewport.height },
      { name: 'availWidth', value: this.config.viewport.width },
      { name: 'availHeight', value: this.config.viewport.height - 40 },
      { name: 'colorDepth', value: 24 },
      { name: 'pixelDepth', value: 24 }
    ];

    screenProps.forEach(prop => {
      try {
        Object.defineProperty(this.window!.screen, prop.name, {
          value: prop.value,
          writable: false,
          configurable: true
        });
      } catch (error) {
        (this.window!.screen as any)[prop.name] = prop.value;
      }
    });
  }

  /**
   * Configure document properties
   */
  private configureDocumentProperties(): void {
    if (!this.document) return;

    // Set document title
    this.document.title = 'Chrome Emulation Environment';

    // Configure document properties with error handling
    try {
      Object.defineProperty(this.document, 'characterSet', {
        value: 'UTF-8',
        writable: false,
        configurable: true
      });
    } catch (error) {
      (this.document as any).characterSet = 'UTF-8';
    }

    try {
      Object.defineProperty(this.document, 'charset', {
        value: 'UTF-8',
        writable: false,
        configurable: true
      });
    } catch (error) {
      (this.document as any).charset = 'UTF-8';
    }

    try {
      Object.defineProperty(this.document, 'inputEncoding', {
        value: 'UTF-8',
        writable: false,
        configurable: true
      });
    } catch (error) {
      (this.document as any).inputEncoding = 'UTF-8';
    }
  }

  /**
   * Inject Performance API
   */
  private injectPerformanceAPI(): void {
    if (!this.window) return;

    // Basic performance API setup (will be enhanced in PerformanceEmulator)
    if (!this.window.performance) {
      (this.window as any).performance = {
        now: () => Date.now(),
        timeOrigin: Date.now(),
        timing: {},
        navigation: {},
        memory: {
          usedJSHeapSize: 10000000,
          totalJSHeapSize: 20000000,
          jsHeapSizeLimit: 2147483648
        }
      };
    }
  }

  /**
   * Inject WebGL API placeholders
   */
  private injectWebGLAPI(): void {
    if (!this.window) return;

    // WebGL context creation will be handled by WebGLEmulator
    // This is just a placeholder to ensure the API exists
    if (this.window.HTMLCanvasElement) {
      const CanvasElement = this.window.HTMLCanvasElement as any;
      const originalGetContext = CanvasElement.prototype.getContext;

      CanvasElement.prototype.getContext = function (contextType: string, ...args: any[]) {
        if (contextType === 'webgl' || contextType === 'experimental-webgl') {
          // WebGL context will be provided by WebGLEmulator
          return null; // Placeholder
        }
        return originalGetContext ? originalGetContext.call(this, contextType, ...args) : null;
      };
    }
  }

  /**
   * Inject Canvas API enhancements
   */
  private injectCanvasAPI(): void {
    if (!this.window) return;

    // Canvas API enhancements will be handled by CanvasEmulator
    // This ensures basic Canvas functionality is available
    if (!this.window.HTMLCanvasElement) {
      (this.window as any).HTMLCanvasElement = HTMLCanvasElement;
    }
  }

  /**
   * Inject Audio API placeholders
   */
  private injectAudioAPI(): void {
    if (!this.window) return;

    // Audio context will be provided by AudioEmulator
    if (!(this.window as any).AudioContext && !(this.window as any).webkitAudioContext) {
      (this.window as any).AudioContext = class MockAudioContext {
        constructor() {
          // Placeholder - will be replaced by AudioEmulator
        }
      };
      (this.window as any).webkitAudioContext = (this.window as any).AudioContext;
    }
  }

  /**
   * Inject Chrome-specific properties and methods
   */
  private injectChromeSpecificProperties(): void {
    if (!this.window) return;

    // Chrome-specific window properties
    (this.window as any).chrome = {
      runtime: {
        onConnect: { addListener: () => { } },
        onMessage: { addListener: () => { } }
      },
      app: {
        isInstalled: false
      }
    };

    // Configure additional navigator properties
    const navigatorProps = [
      { name: 'webdriver', value: undefined },
      { name: 'languages', value: ['en-US', 'en'] },
      { name: 'hardwareConcurrency', value: 8 },
      { name: 'deviceMemory', value: 8 },
      { name: 'connection', value: { effectiveType: '4g', rtt: 50, downlink: 10 } }
    ];

    navigatorProps.forEach(prop => {
      try {
        Object.defineProperty(this.window!.navigator, prop.name, {
          value: prop.value,
          writable: false,
          configurable: true
        });
      } catch (error) {
        (this.window!.navigator as any)[prop.name] = prop.value;
      }
    });
  }

  /**
   * Get current window instance
   */
  getWindow(): Window | null {
    return this.window;
  }

  /**
   * Get current document instance
   */
  getDocument(): any | null {
    return this.document;
  }

  /**
   * Cleanup DOM resources
   */
  cleanup(): void {
    try {
      if (this.window) {
        // Happy-DOM windows don't have a close method, just clear the reference
        this.window = null;
      }
      this.document = null;

      // Clear global references
      delete (global as any).window;
      delete (global as any).document;
      delete (global as any).location;
      delete (global as any).history;
      delete (global as any).screen;

    } catch (error) {
      console.warn('Error during DOM cleanup:', error);
    }
  }
}