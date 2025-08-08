import type { BenchmarkReport } from '@/test-runner/benchmark';
import fs from 'fs';
import path from 'path';

export interface BenchmarkBaseline {
  performanceNow: {
    avgDeltaMs: { min: number; max: number };
    maxDeltaMs: { max: number };
  };
  resourceTimingCount: { min: number };
}

export interface RegressionComparison {
  pass: boolean;
  failures: string[];
}

export function loadBaseline(filePath: string): BenchmarkBaseline {
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  const raw = fs.readFileSync(resolved, 'utf8');
  return JSON.parse(raw) as BenchmarkBaseline;
}

export function compareBenchmarkToBaseline(report: BenchmarkReport, baseline: BenchmarkBaseline): RegressionComparison {
  const failures: string[] = [];

  const avg = report.performanceNow.avgDeltaMs;
  const max = report.performanceNow.maxDeltaMs;

  if (avg < baseline.performanceNow.avgDeltaMs.min || avg > baseline.performanceNow.avgDeltaMs.max) {
    failures.push(`avgDeltaMs out of range: ${avg} not in [${baseline.performanceNow.avgDeltaMs.min}, ${baseline.performanceNow.avgDeltaMs.max}]`);
  }

  if (max > baseline.performanceNow.maxDeltaMs.max) {
    failures.push(`maxDeltaMs too high: ${max} > ${baseline.performanceNow.maxDeltaMs.max}`);
  }

  if (report.resourceTimingCount < baseline.resourceTimingCount.min) {
    failures.push(`resourceTimingCount too low: ${report.resourceTimingCount} < ${baseline.resourceTimingCount.min}`);
  }

  return { pass: failures.length === 0, failures };
}

export function defaultBaseline(): BenchmarkBaseline {
  // Conservative defaults for this emulator
  return {
    performanceNow: {
      avgDeltaMs: { min: 0, max: 0.2 },
      maxDeltaMs: { max: 1.0 }
    },
    resourceTimingCount: { min: 2 }
  };
}


