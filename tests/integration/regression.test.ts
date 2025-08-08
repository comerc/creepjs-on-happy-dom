/**
 * Integration test for regression comparison
 */

import { describe, it, expect } from 'vitest';
import { BenchmarkRunner } from '@/test-runner/benchmark';
import { compareBenchmarkToBaseline, defaultBaseline } from '@/test-runner/regression';

describe('Regression baseline comparison', () => {
  it('should pass comparison against default baseline', async () => {
    const runner = new BenchmarkRunner();
    const report = await runner.run({ iterations: 60 });
    const baseline = defaultBaseline();
    const cmp = compareBenchmarkToBaseline(report, baseline);
    expect(cmp.pass).toBe(true);
    expect(Array.isArray(cmp.failures)).toBe(true);
  });
});


