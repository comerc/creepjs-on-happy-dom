/**
 * Integration tests for configuration loader and profiles
 */

import { describe, it, expect } from 'vitest';
import { EmulationConfigManager } from '@/config/emulation-config';
import fs from 'fs';
import path from 'path';

describe('Configuration Loader', () => {
  it('should load config from JSON file and merge with defaults', async () => {
    const manager = new EmulationConfigManager();
    const tempPath = path.join(process.cwd(), 'tmp-config.json');
    const partial = {
      platform: 'MacIntel',
      viewport: { width: 1280 },
      audio: { sampleRate: 48000 }
    };
    fs.writeFileSync(tempPath, JSON.stringify(partial));

    try {
      const cfg = await manager.loadConfig(tempPath);
      expect(cfg.platform).toBe('MacIntel');
      expect(cfg.viewport.width).toBe(1280);
      expect(cfg.viewport.height).toBeGreaterThan(0); // filled by defaults
      expect(cfg.audio.sampleRate).toBe(48000);
      expect(cfg.audio.maxChannelCount).toBeGreaterThan(0);
      expect(cfg.userAgent).toContain('Chrome');
    } finally {
      fs.unlinkSync(tempPath);
    }
  });
});


