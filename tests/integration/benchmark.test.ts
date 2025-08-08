/**
 * Integration test for BenchmarkRunner
 */

import { describe, it, expect } from 'vitest';
import { BenchmarkRunner } from '@/test-runner/benchmark';

describe('BenchmarkRunner', () => {
  it('should produce consistent performance metrics shape', async () => {
    const runner = new BenchmarkRunner();
    const report = await runner.run({ iterations: 60, profileName: 'chrome-139-windows' });
    expect(report.performanceNow.iterations).toBe(60);
    expect(report.performanceNow.minDeltaMs).toBeGreaterThanOrEqual(0);
    expect(report.performanceNow.maxDeltaMs).toBeGreaterThanOrEqual(report.performanceNow.minDeltaMs);
    expect(report.performanceNow.avgDeltaMs).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(report.navigationTiming)).toBe(true);
    expect(report.resourceTimingCount).toBeGreaterThanOrEqual(0);
  });
});


