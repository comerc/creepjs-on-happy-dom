import { EmulationConfig } from '@/types/emulation-types';
// Built-in TS profiles are deprecated; prefer JSON in root config/chrome-profiles
import fs from 'fs';
import path from 'path';

export interface ChromeProfile {
  name: string;
  description: string;
  config: EmulationConfig;
}

export class ChromeProfileManager {
  private profiles: Map<string, ChromeProfile> = new Map();

  constructor() {
    this.initializeDefaultProfiles();
  }

  getProfile(name: string): ChromeProfile | undefined {
    return this.profiles.get(name);
  }

  getAllProfiles(): ChromeProfile[] {
    return Array.from(this.profiles.values());
  }

  addProfile(profile: ChromeProfile): void {
    this.profiles.set(profile.name, profile);
  }

  exportProfile(name: string, filePath: string): void {
    const profile = this.getProfile(name);
    if (!profile) throw new Error(`Profile not found: ${name}`);
    const out = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    const dir = path.dirname(out);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(out, JSON.stringify(profile, null, 2), 'utf8');
  }

  loadProfilesFromFile(filePath: string): number {
    const resolved = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    if (!fs.existsSync(resolved)) throw new Error(`Profiles file not found: ${resolved}`);
    const raw = fs.readFileSync(resolved, 'utf8');
    const parsed = JSON.parse(raw);
    return this.ingestProfiles(parsed);
  }

  async loadProfilesFromUrl(url: string): Promise<number> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch profiles from URL: ${url} (${res.status})`);
    const parsed = await res.json();
    return this.ingestProfiles(parsed);
  }

  loadProfilesFromDirectory(dirPath: string): number {
    const resolved = path.isAbsolute(dirPath) ? dirPath : path.join(process.cwd(), dirPath);
    if (!fs.existsSync(resolved)) return 0;
    const files = fs.readdirSync(resolved).filter(f => f.endsWith('.json'));
    let total = 0;
    for (const file of files) {
      try {
        total += this.loadProfilesFromFile(path.join(resolved, file));
      } catch { }
    }
    return total;
  }

  loadUserProfiles(): number {
    return this.loadProfilesFromDirectory(this.getUserProfilesDir());
  }

  private ingestProfiles(json: any): number {
    let count = 0;
    const list: ChromeProfile[] = Array.isArray(json) ? json : [json];
    for (const item of list) {
      if (!this.validateProfileObject(item)) continue;
      const profile: ChromeProfile = {
        name: String(item.name),
        description: String(item.description || ''),
        config: item.config as EmulationConfig
      };
      this.addProfile(profile);
      count++;
    }
    return count;
  }

  private validateProfileObject(obj: any): obj is ChromeProfile {
    if (!obj || typeof obj !== 'object') return false;
    if (typeof obj.name !== 'string') return false;
    if (!obj.config || typeof obj.config !== 'object') return false;
    const cfg = obj.config;
    if (typeof cfg.chromeVersion !== 'string') return false;
    if (typeof cfg.platform !== 'string') return false;
    if (typeof cfg.userAgent !== 'string') return false;
    if (!cfg.viewport || typeof cfg.viewport.width !== 'number' || typeof cfg.viewport.height !== 'number') return false;
    if (!cfg.webgl || typeof cfg.webgl.vendor !== 'string' || typeof cfg.webgl.renderer !== 'string' || typeof cfg.webgl.version !== 'string') return false;
    if (!cfg.audio || typeof cfg.audio.sampleRate !== 'number' || typeof cfg.audio.maxChannelCount !== 'number') return false;
    if (!cfg.performance || typeof cfg.performance.baseLatency !== 'number') return false;
    return true;
  }

  private getUserProfilesDir(): string {
    const override = process.env.CREEPJS_PROFILES_DIR;
    if (override && override.length > 0) return override;
    return path.join(process.cwd(), '.creepjs-on-happy-dom', 'profiles');
  }

  private initializeDefaultProfiles(): void {
    // Load defaults from root config/chrome-profiles JSONs, if any
    try {
      const rootDir = path.join(process.cwd(), 'config', 'chrome-profiles');
      if (fs.existsSync(rootDir)) {
        const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
          const raw = fs.readFileSync(path.join(rootDir, file), 'utf8');
          try {
            const parsed = JSON.parse(raw);
            this.ingestProfiles(parsed);
          } catch { }
        }
      }
    } catch { }

    // Load user profiles directory
    try {
      this.loadUserProfiles();
    } catch { }
  }
}

export type { EmulationConfig };


