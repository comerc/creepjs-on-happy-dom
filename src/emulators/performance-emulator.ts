/**
 * Performance API Emulator for Chrome-like timing characteristics
 */

import { EmulationConfig } from '@/types/emulation-types';

type PerformanceEntryType = 'navigation' | 'resource' | 'mark' | 'measure';

interface BaseEntry {
  name: string;
  entryType: PerformanceEntryType;
  startTime: number;
  duration: number;
}

interface NavigationEntry extends BaseEntry {
  entryType: 'navigation';
  type: 'navigate' | 'reload' | 'back_forward' | 'prerender';
  redirectCount: number;
  unloadEventStart: number;
  unloadEventEnd: number;
  domInteractive: number;
  domContentLoadedEventStart: number;
  domContentLoadedEventEnd: number;
  domComplete: number;
  loadEventStart: number;
  loadEventEnd: number;
  responseStart: number;
  responseEnd: number;
  requestStart: number;
  connectStart: number;
  connectEnd: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  fetchStart: number;
  redirectStart: number;
  redirectEnd: number;
  workerStart: number;
  activationStart: number;
}

interface ResourceEntry extends BaseEntry {
  entryType: 'resource';
  initiatorType: string;
  nextHopProtocol: string;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
  serverTiming: PerformanceServerTiming[];
  workerStart: number;
  redirectStart: number;
  redirectEnd: number;
  fetchStart: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  secureConnectionStart: number;
  connectEnd: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
}

interface MarkEntry extends BaseEntry { entryType: 'mark'; }
interface MeasureEntry extends BaseEntry { entryType: 'measure'; }

interface PerformanceServerTiming {
  name: string;
  duration: number;
  description?: string;
}

export class ChromePerformanceEmulator {
  private readonly config: EmulationConfig;
  private readonly createdEpochMs: number;
  private lastNowMs: number = 0;
  private readonly seed: number;

  private navigationEntries: NavigationEntry[] = [];
  private resourceEntries: ResourceEntry[] = [];
  private markEntries: MarkEntry[] = [];
  private measureEntries: MeasureEntry[] = [];
  private resourceBufferSize: number = 250;

  constructor(config: EmulationConfig) {
    this.config = config;
    this.createdEpochMs = Date.now();
    this.seed = this.hashConfig();

    // Seed default entries
    this.generateDefaultNavigationEntry();
    this.generateDefaultResourceEntries();
  }

  install(targetWindow: any): void {
    const self = this;
    const timeOrigin = this.createdEpochMs;

    const performanceLike = {
      get timeOrigin() { return timeOrigin; },
      now(): number {
        return self.computeNow();
      },
      // Resource Timing
      getEntriesByType(type: PerformanceEntryType): Array<NavigationEntry | ResourceEntry | MarkEntry | MeasureEntry> {
        if (type === 'navigation') return [...self.navigationEntries];
        if (type === 'resource') return [...self.resourceEntries];
        if (type === 'mark') return [...self.markEntries];
        if (type === 'measure') return [...self.measureEntries];
        return [] as any;
      },
      getEntries(): Array<NavigationEntry | ResourceEntry | MarkEntry | MeasureEntry> {
        return [
          ...self.navigationEntries,
          ...self.resourceEntries,
          ...self.markEntries,
          ...self.measureEntries
        ];
      },
      clearResourceTimings(): void {
        self.resourceEntries = [];
      },
      setResourceTimingBufferSize(size: number): void {
        if (typeof size === 'number' && size > 0) {
          self.resourceBufferSize = Math.floor(size);
          if (self.resourceEntries.length > self.resourceBufferSize) {
            self.resourceEntries = self.resourceEntries.slice(-self.resourceBufferSize);
          }
        }
      },
      // User Timing
      mark(name: string, options?: { startTime?: number }): void {
        const start = typeof options?.startTime === 'number' ? options.startTime : self.computeNow();
        self.markEntries.push({ name, entryType: 'mark', startTime: start, duration: 0 });
      },
      measure(name: string, startOrOptions?: string | { start?: string; end?: string; startTime?: number; endTime?: number }, endMark?: string): void {
        let startTime: number;
        let endTime: number;

        if (typeof startOrOptions === 'string') {
          const startMarkName = startOrOptions;
          const endMarkName = endMark;
          const startMark = startMarkName ? self.findLastMark(startMarkName) : undefined;
          const endMarkEntry = endMarkName ? self.findLastMark(endMarkName) : undefined;
          startTime = startMark ? startMark.startTime : 0;
          endTime = endMarkEntry ? endMarkEntry.startTime : self.computeNow();
        } else {
          const opts = startOrOptions || {};
          if (opts.start !== undefined) {
            const m = self.findLastMark(opts.start);
            startTime = m ? m.startTime : 0;
          } else {
            startTime = typeof opts.startTime === 'number' ? opts.startTime : 0;
          }
          if (opts.end !== undefined) {
            const m = self.findLastMark(opts.end);
            endTime = m ? m.startTime : self.computeNow();
          } else {
            endTime = typeof opts.endTime === 'number' ? opts.endTime : self.computeNow();
          }
        }
        const duration = Math.max(0, endTime - startTime);
        self.measureEntries.push({ name, entryType: 'measure', startTime, duration });
      },
      clearMarks(name?: string): void {
        if (!name) self.markEntries = [];
        else self.markEntries = self.markEntries.filter(m => m.name !== name);
      },
      clearMeasures(name?: string): void {
        if (!name) self.measureEntries = [];
        else self.measureEntries = self.measureEntries.filter(m => m.name !== name);
      },
      getEntriesByName(name: string, type?: PerformanceEntryType): Array<any> {
        const all = this.getEntries();
        return all.filter((e: any) => e.name === name && (!type || e.entryType === type));
      },
      memory: {
        usedJSHeapSize: 16 * 1024 * 1024,
        totalJSHeapSize: 32 * 1024 * 1024,
        jsHeapSizeLimit: 2 * 1024 * 1024 * 1024
      }
    };

    // Install on window
    targetWindow.performance = performanceLike;
  }

  addResourceTiming(entry: Partial<ResourceEntry> & { name: string }): void {
    const base = entry.startTime ?? this.computeNow();
    // Construct ordered milestones
    const workerStart = 0; // not using workers by default
    const redirectStart = 0;
    const redirectEnd = 0;
    const fetchStart = base + 0;
    const domainLookupStart = fetchStart + 2;
    const domainLookupEnd = domainLookupStart + 6;
    const connectStart = domainLookupEnd + 1;
    const secureConnectionStart = connectStart + 1;
    const connectEnd = connectStart + 10;
    const requestStart = connectEnd + 2;
    const responseStart = requestStart + 15;
    const responseEnd = responseStart + (entry.duration ?? this.randomRange(5, 40));

    const duration = responseEnd - fetchStart;
    const encodedBodySize = entry.encodedBodySize ?? this.randomRange(1024, 64 * 1024);
    const decodedBodySize = entry.decodedBodySize ?? Math.floor(encodedBodySize * 1.1);
    const transferSize = entry.transferSize ?? (encodedBodySize + this.randomRange(300, 1200));

    const resource: ResourceEntry = {
      name: entry.name,
      entryType: 'resource',
      initiatorType: entry.initiatorType ?? 'script',
      nextHopProtocol: entry.nextHopProtocol ?? 'h2',
      startTime: fetchStart,
      duration,
      transferSize,
      encodedBodySize,
      decodedBodySize,
      serverTiming: this.generateServerTiming(entry.name),
      workerStart,
      redirectStart,
      redirectEnd,
      fetchStart,
      domainLookupStart,
      domainLookupEnd,
      connectStart,
      secureConnectionStart,
      connectEnd,
      requestStart,
      responseStart,
      responseEnd
    };

    this.resourceEntries.push(resource);
    if (this.resourceEntries.length > this.resourceBufferSize) {
      this.resourceEntries.shift();
    }
  }

  private generateServerTiming(resourceName: string): PerformanceServerTiming[] {
    const base = (this.seed + resourceName.length * 97) % 13;
    return [
      { name: 'cdn-cache', duration: 2 + base, description: 'HIT' },
      { name: 'edge', duration: 5 + (base % 3) },
      { name: 'origin', duration: 12 + (base % 5) }
    ];
  }

  /**
   * Find the last mark with the given name
   */
  private findLastMark(name: string): MarkEntry | undefined {
    for (let i = this.markEntries.length - 1; i >= 0; i--) {
      if (this.markEntries[i].name === name) {
        return this.markEntries[i];
      }
    }
    return undefined;
  }

  private computeNow(): number {
    const elapsedMs = Date.now() - this.createdEpochMs;
    const baseLatencyMs = Math.max(0, this.config.performance.baseLatency * 1000);
    const cfgJitter = this.config.performance.jitterMs ?? 0.06;
    const jitterMs = Math.min(5, Math.max(0, cfgJitter));
    // Deterministic bounded jitter
    const det = (this.seed % 7) * 0.01;
    let value = elapsedMs + baseLatencyMs + Math.min(jitterMs, det);

    // Emulate Chrome reduced time precision rounding (~0.05ms granularity typical on desktop)
    const resolution = Math.max(0.01, this.config.performance.nowResolutionMs ?? 0.05); // ms
    value = Math.round(value / resolution) * resolution;

    if (value < this.lastNowMs) {
      value = this.lastNowMs + resolution; // enforce monotonic increase
    }
    this.lastNowMs = value;
    return value;
  }

  private generateDefaultNavigationEntry(): void {
    // Construct a plausible navigation timeline in ms relative to timeOrigin
    const base = 0;
    const connect = 20 + (this.seed % 10);
    const request = connect + 5;
    const responseStart = request + 30;
    const responseEnd = responseStart + 10;
    const domInteractive = responseEnd + 35;
    const dclStart = domInteractive + 5;
    const dclEnd = dclStart + 3;
    const loadStart = dclEnd + 40;
    const loadEnd = loadStart + 5;
    const unloadStart = base + 0;
    const unloadEnd = unloadStart + 0;
    const domainLookupStart = connect - 10;
    const domainLookupEnd = connect - 5;
    const fetchStart = base + 1;
    const redirectStart = 0;
    const redirectEnd = 0;
    const workerStart = 0;
    const activationStart = base + 0;

    const nav: NavigationEntry = {
      name: 'https://example.com/',
      entryType: 'navigation',
      startTime: base,
      duration: loadEnd - base,
      type: 'navigate',
      redirectCount: 0,
      unloadEventStart: unloadStart,
      unloadEventEnd: unloadEnd,
      connectStart: connect - 5,
      connectEnd: connect,
      requestStart: request,
      responseStart,
      responseEnd,
      domainLookupStart,
      domainLookupEnd,
      fetchStart,
      redirectStart,
      redirectEnd,
      workerStart,
      activationStart,
      domInteractive,
      domContentLoadedEventStart: dclStart,
      domContentLoadedEventEnd: dclEnd,
      domComplete: loadEnd - 2,
      loadEventStart: loadStart,
      loadEventEnd: loadEnd
    };
    this.navigationEntries = [nav];
  }

  private generateDefaultResourceEntries(): void {
    // Seed with a CSS (cacheable) and JS (varying) resource entry, plus an image
    this.addResourceTiming({ name: 'https://example.com/styles.css', initiatorType: 'link', transferSize: 12345 });
    this.addResourceTiming({ name: 'https://example.com/app.js', initiatorType: 'script' });
    this.addResourceTiming({ name: 'https://example.com/logo.png', initiatorType: 'img' });
  }

  private hashConfig(): number {
    const str = `${this.config.chromeVersion}|${this.config.platform}|${this.config.performance.baseLatency}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private randomRange(min: number, max: number): number {
    // Deterministic pseudo-random based on seed
    const v = (this.seed * 1664525 + 1013904223) >>> 0;
    const frac = (v % 1000) / 1000;
    return Math.floor(min + (max - min) * frac);
  }
}


