import { ChromeEmulatorImpl } from '@/emulators/chrome-emulator';

export interface BenchmarkOptions {
  iterations?: number;
  profileName?: string;
  configPath?: string;
}

export interface BenchmarkReport {
  performanceNow: {
    iterations: number;
    minDeltaMs: number;
    maxDeltaMs: number;
    avgDeltaMs: number;
  };
  navigationTiming: any[];
  resourceTimingCount: number;
}

export class BenchmarkRunner {
  async run(options: BenchmarkOptions = {}): Promise<BenchmarkReport> {
    const iterations = Math.max(50, options.iterations ?? 200);

    const emulator = new ChromeEmulatorImpl();
    await emulator.initialize(options.configPath, options.profileName);
    const wnd: any = emulator.getWindow();

    // Performance.now() deltas
    const deltas: number[] = [];
    let prev = wnd.performance.now();
    for (let i = 0; i < iterations; i++) {
      const cur = wnd.performance.now();
      deltas.push(cur - prev);
      prev = cur;
    }
    const minDeltaMs = Math.min(...deltas);
    const maxDeltaMs = Math.max(...deltas);
    const avgDeltaMs = deltas.reduce((a, b) => a + b, 0) / deltas.length;

    // Timing entries
    const nav = wnd.performance.getEntriesByType('navigation');
    const res = wnd.performance.getEntriesByType('resource');

    await emulator.cleanup();

    return {
      performanceNow: {
        iterations,
        minDeltaMs,
        maxDeltaMs,
        avgDeltaMs
      },
      navigationTiming: nav,
      resourceTimingCount: res.length
    };
  }
}


