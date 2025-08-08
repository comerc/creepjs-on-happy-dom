/**
 * Safe DOMManager implementation that avoids happy-dom internal conflicts
 */

import { Window } from 'happy-dom';
import { EmulationConfig } from '@/types/emulation-types';
import { EmulationError } from '@/types/error-types';
import { ChromeAudioEmulator } from '@/emulators/audio-emulator';
import { ChromePerformanceEmulator } from '@/emulators/performance-emulator';

export class SafeDOMManager {
  private window: Window | null = null;
  private document: any | null = null;
  private config: EmulationConfig;

  constructor(config: EmulationConfig) {
    this.config = config;
  }

  /**
   * Setup window with minimal interference
   */
  async setupWindow(): Promise<Window> {
    try {
      // Create happy-dom window with basic settings
      this.window = new Window({
        url: 'https://example.com',
        width: this.config.viewport.width,
        height: this.config.viewport.height
      });

      // Let happy-dom complete its initialization
      await new Promise(resolve => setTimeout(resolve, 10));

      // Configure Chrome properties after happy-dom is ready
      this.configureChromeLikeProperties();

      return this.window;
    } catch (error) {
      throw new EmulationError(
        `Failed to setup safe window: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'initialization',
        'SafeDOMManager'
      );
    }
  }

  /**
   * Configure document safely
   */
  configureDocument(): any {
    if (!this.window) {
      throw new EmulationError(
        'Window not initialized',
        'runtime',
        'SafeDOMManager'
      );
    }

    this.document = this.window.document;

    // Set basic document properties that are safe to modify
    try {
      this.document.title = 'Chrome Emulation Environment';
    } catch (error) {
      console.log('Could not set document title:', error);
    }

    return this.document;
  }

  /**
   * Configure Chrome-like properties safely
   */
  private configureChromeLikeProperties(): void {
    if (!this.window) return;

    try {
      // Add Chrome object
      (this.window as any).chrome = {
        runtime: {
          onConnect: { addListener: () => { } },
          onMessage: { addListener: () => { } }
        },
        app: {
          isInstalled: false
        }
      };

      // Install Chrome-like Performance API via emulator (overrides/augments)
      const perfEmu = new ChromePerformanceEmulator(this.config);
      perfEmu.install(this.window);

      // Try to configure navigator properties safely
      this.configureNavigatorSafely();

      // Inject Audio API (AudioContext / webkitAudioContext)
      this.injectAudioAPI();

    } catch (error) {
      console.log('Some Chrome properties could not be configured:', error);
    }
  }

  /**
   * Configure navigator properties with maximum safety
   */
  private configureNavigatorSafely(): void {
    if (!this.window) return;

    const navigator = this.window.navigator;

    // Try to set properties, but don't fail if they're read-only
    const props = [
      { name: 'userAgent', value: this.config.userAgent },
      { name: 'platform', value: this.config.platform },
      { name: 'vendor', value: 'Google Inc.' },
      { name: 'webdriver', value: undefined },
      { name: 'languages', value: ['en-US', 'en'] },
      { name: 'hardwareConcurrency', value: 8 },
      { name: 'deviceMemory', value: 8 }
    ];

    props.forEach(prop => {
      try {
        // Try to define property
        Object.defineProperty(navigator, prop.name, {
          value: prop.value,
          writable: false,
          configurable: true
        });
      } catch (error) {
        try {
          // Fallback: try direct assignment
          (navigator as any)[prop.name] = prop.value;
        } catch (fallbackError) {
          // If both fail, just log and continue
          console.log(`Could not set navigator.${prop.name}:`, fallbackError);
        }
      }
    });
  }

  /**
   * Inject a Chrome-like Audio API that is deterministic for fingerprinting
   */
  private injectAudioAPI(): void {
    if (!this.window) return;

    try {
      const emulator = new ChromeAudioEmulator(this.config);

      const AudioContextShim = class {
        constructor() {
          // Return the emulator-provided context instance
          return emulator.createAudioContext();
        }
      } as unknown as { new(): any };

      // Define on window
      (this.window as any).AudioContext = AudioContextShim;
      (this.window as any).webkitAudioContext = AudioContextShim;
    } catch (error) {
      console.log('Could not inject Audio API:', error);
    }
  }

  /**
   * Get window instance
   */
  getWindow(): Window | null {
    return this.window;
  }

  /**
   * Get document instance
   */
  getDocument(): any | null {
    return this.document;
  }

  /**
   * Cleanup safely
   */
  cleanup(): void {
    try {
      this.window = null;
      this.document = null;
    } catch (error) {
      console.warn('Error during safe cleanup:', error);
    }
  }
}