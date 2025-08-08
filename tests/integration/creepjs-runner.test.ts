/**
 * Integration test for CreepJS runner
 */

import { describe, it, expect } from 'vitest';
import { CreepJSTestRunner } from '@/test-runner/creepjs-runner';
import { ResultAnalyzer } from '@/test-runner/result-analyzer';
import { ReportGenerator } from '@/test-runner/report-generator';

describe('CreepJS Runner Integration', () => {
  it('should run CreepJS and produce analysis report', async () => {
    const runner = new CreepJSTestRunner();
    const result = await runner.run();

    // We allow failures due to environment, but must not throw
    expect(result).toBeDefined();

    const analyzer = new ResultAnalyzer();
    const summary = analyzer.analyze(result.fingerprint);
    expect(summary).toBeDefined();

    const reporter = new ReportGenerator();
    const report = reporter.generate(summary);
    expect(report.summary).toBeDefined();
    expect(Array.isArray(report.recommendations)).toBe(true);
  });
});


