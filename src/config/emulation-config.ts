/**
 * Emulation configuration management
 */

import { EmulationConfig } from '@/types/emulation-types';
import { EmulationError } from '@/types/error-types';
import fs from 'fs';
import path from 'path';

export class EmulationConfigManager {
  private config: EmulationConfig | null = null;

  /**
   * Load configuration from file or use default
   */
  async loadConfig(configPath?: string): Promise<EmulationConfig> {
    try {
      if (configPath) {
        const resolved = path.isAbsolute(configPath)
          ? configPath
          : path.join(process.cwd(), configPath);

        if (!fs.existsSync(resolved)) {
          throw new EmulationError(
            `Configuration file not found: ${resolved}`,
            'initialization',
            'EmulationConfigManager'
          );
        }

        const raw = fs.readFileSync(resolved, 'utf8');
        const parsed = JSON.parse(raw) as Partial<EmulationConfig>;
        const merged = this.mergeWithDefaults(parsed);
        this.validateConfig(merged);
        this.config = merged;
        return this.config;
      }

      this.config = this.getDefaultConfig();
      return this.config;
    } catch (error) {
      throw new EmulationError(
        `Failed to load configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'initialization',
        'EmulationConfigManager'
      );
    }
  }

  /**
   * Validate configuration object
   */
  validateConfig(config: EmulationConfig): boolean {
    try {
      // Validate required fields
      if (!config.chromeVersion || !config.platform || !config.userAgent) {
        throw new Error('Missing required configuration fields');
      }

      // Validate viewport
      if (!config.viewport || config.viewport.width <= 0 || config.viewport.height <= 0) {
        throw new Error('Invalid viewport configuration');
      }

      // Validate WebGL config
      if (!config.webgl || !config.webgl.vendor || !config.webgl.renderer) {
        throw new Error('Invalid WebGL configuration');
      }

      // Validate audio config
      if (!config.audio || config.audio.sampleRate <= 0 || config.audio.maxChannelCount <= 0) {
        throw new Error('Invalid audio configuration');
      }

      // Validate performance config
      if (!config.performance || config.performance.baseLatency < 0) {
        throw new Error('Invalid performance configuration');
      }

      return true;
    } catch (error) {
      throw new EmulationError(
        `Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'initialization',
        'EmulationConfigManager'
      );
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): EmulationConfig {
    if (!this.config) {
      throw new EmulationError(
        'Configuration not loaded',
        'runtime',
        'EmulationConfigManager'
      );
    }
    return this.config;
  }

  /**
   * Get default Chrome configuration (Latest Chrome 139)
   */
  private getDefaultConfig(): EmulationConfig {
    return {
      chromeVersion: '139.0.7258.67',
      platform: 'Win32',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
      viewport: {
        width: 1920,
        height: 1080
      },
      webgl: {
        vendor: 'Google Inc. (Intel)',
        renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 620 (0x00005917) Direct3D11 vs_5_0 ps_5_0, D3D11)',
        version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)'
      },
      audio: {
        sampleRate: 48000,
        maxChannelCount: 2
      },
      performance: {
        enableRealisticTiming: true,
        baseLatency: 0.1
      }
    };
  }

  /**
   * Merge partial config with defaults, filling missing fields
   */
  private mergeWithDefaults(partial: Partial<EmulationConfig>): EmulationConfig {
    const def = this.getDefaultConfig();
    return {
      chromeVersion: partial.chromeVersion ?? def.chromeVersion,
      platform: partial.platform ?? def.platform,
      userAgent: partial.userAgent ?? def.userAgent,
      viewport: {
        width: partial.viewport?.width ?? def.viewport.width,
        height: partial.viewport?.height ?? def.viewport.height
      },
      webgl: {
        vendor: partial.webgl?.vendor ?? def.webgl.vendor,
        renderer: partial.webgl?.renderer ?? def.webgl.renderer,
        version: partial.webgl?.version ?? def.webgl.version
      },
      audio: {
        sampleRate: partial.audio?.sampleRate ?? def.audio.sampleRate,
        maxChannelCount: partial.audio?.maxChannelCount ?? def.audio.maxChannelCount
      },
      performance: {
        enableRealisticTiming: partial.performance?.enableRealisticTiming ?? def.performance.enableRealisticTiming,
        baseLatency: partial.performance?.baseLatency ?? def.performance.baseLatency
      }
    } as EmulationConfig;
  }
}