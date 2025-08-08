/**
 * Integration tests for ChromeProfileManager persistence and import/export
 */

import { describe, it, expect } from 'vitest';
import { ChromeProfileManager } from '@/config/chrome-profiles';
import fs from 'fs';
import path from 'path';

describe('ChromeProfileManager I/O', () => {
  it('should export and import profiles via JSON file', async () => {
    const mgr = new ChromeProfileManager();
    const tmpDir = path.join(process.cwd(), 'tmp');
    const outFile = path.join(tmpDir, 'profile.json');

    // Export existing profile
    mgr.exportProfile('chrome-139-windows', outFile);
    expect(fs.existsSync(outFile)).toBe(true);

    // Load back as custom
    const added = mgr.loadProfilesFromFile(outFile);
    expect(added).toBeGreaterThan(0);

    // Clean up
    fs.unlinkSync(outFile);
    fs.rmdirSync(tmpDir);
  });

  it('should load profiles from URL (mocked fetch)', async () => {
    const mgr = new ChromeProfileManager();
    // mock fetch
    const originalFetch = global.fetch;
    (global as any).fetch = async () => ({
      ok: true, json: async () => ([{
        name: 'custom-profile', description: 'Custom', config: mgr.getProfile('chrome-139-windows')!.config
      }])
    });

    try {
      const added = await mgr.loadProfilesFromUrl('https://example.com/profiles.json');
      expect(added).toBeGreaterThan(0);
      expect(mgr.getProfile('custom-profile')).toBeDefined();
    } finally {
      (global as any).fetch = originalFetch;
    }
  });
});


