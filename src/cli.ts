#!/usr/bin/env node
import { ChromeEmulatorImpl } from '@/emulators/chrome-emulator';
import { CreepJSTestRunner } from '@/test-runner/creepjs-runner';
import { ResultAnalyzer } from '@/test-runner/result-analyzer';
import { ReportGenerator } from '@/test-runner/report-generator';
import { ChromeProfileManager } from '@/config/chrome-profiles';

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      args[k] = v === undefined ? true : v;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const configPath = (args['config'] as string) || undefined;
  const profileName = (args['profile'] as string) || undefined;
  const mode = (args['mode'] as string) || 'run';

  if (mode === 'run') {
    const runner = new CreepJSTestRunner();
    // Suppress noisy logs from emulator to keep stdout as clean JSON
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      // forward to stderr to not break JSON stdout consumers
      console.error(...args);
    };
    try {
      const runOpts: Record<string, any> = {};
      if (configPath !== undefined) runOpts.configPath = configPath;
      if (profileName !== undefined) runOpts.profileName = profileName;
      const result = await runner.run(runOpts);
      const analyzer = new ResultAnalyzer();
      const summary = analyzer.analyze(result.fingerprint);
      const reporter = new ReportGenerator();
      const report = reporter.generate(summary);
      const format = (args['format'] as string) || 'json';
      // Write only the selected format to stdout
      if (format === 'md' || format === 'markdown') {
        const md = reporter.generateMarkdown(report);
        process.stdout.write(md);
      } else {
        process.stdout.write(JSON.stringify({ result, report }, null, 2));
      }
      process.exit(result.success ? 0 : 1);
    } finally {
      console.log = originalLog;
    }
    return;
  }

  if (mode === 'init') {
    const emulator = new ChromeEmulatorImpl();
    await emulator.initialize(configPath, profileName);
    console.log('Environment initialized');
    await emulator.cleanup();
    return;
  }

  if (mode === 'benchmark') {
    const { BenchmarkRunner } = await import('@/test-runner/benchmark.js');
    const iterations = args['iterations'] ? Number(args['iterations']) : undefined;
    const runner = new BenchmarkRunner();
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      console.error(...args);
    };
    try {
      const benchOpts: Record<string, any> = {};
      if (typeof iterations === 'number') benchOpts.iterations = iterations;
      if (profileName !== undefined) benchOpts.profileName = profileName;
      if (configPath !== undefined) benchOpts.configPath = configPath;
      const report = await runner.run(benchOpts);
      const format = (args['format'] as string) || 'json';
      if (format === 'md' || format === 'markdown') {
        await import('@/test-runner/report-generator.js');
        // Minimal markdown from benchmark report
        const md = `# Benchmark Report\n\n- Iterations: ${report.performanceNow.iterations}\n- avgDeltaMs: ${report.performanceNow.avgDeltaMs.toFixed(3)}\n- maxDeltaMs: ${report.performanceNow.maxDeltaMs.toFixed(3)}\n- navigation entries: ${report.navigationTiming.length}\n- resource entries: ${report.resourceTimingCount}\n`;
        process.stdout.write(md);
      } else {
        process.stdout.write(JSON.stringify(report, null, 2));
      }
    } finally {
      console.log = originalLog;
    }
    return;
  }

  if (mode === 'list-profiles') {
    const mgr = new ChromeProfileManager();
    const list = mgr.getAllProfiles().map(p => ({ name: p.name, description: p.description }));
    console.log(JSON.stringify(list, null, 2));
    return;
  }

  if (mode === 'export-profile') {
    const name = (args['profile'] as string);
    const out = (args['out'] as string);
    if (!name || !out) {
      console.error('Usage: --mode=export-profile --profile=<name> --out=<file>');
      process.exit(2);
    }
    const mgr = new ChromeProfileManager();
    mgr.exportProfile(name, out);
    console.log(`Profile '${name}' exported to ${out}`);
    return;
  }

  if (mode === 'import-profiles') {
    const file = (args['file'] as string) || undefined;
    const url = (args['url'] as string) || undefined;
    const mgr = new ChromeProfileManager();
    let count = 0;
    if (file) count += mgr.loadProfilesFromFile(file);
    if (url) count += await mgr.loadProfilesFromUrl(url);
    // also auto-load from user profiles dir
    count += mgr.loadUserProfiles();
    console.log(JSON.stringify({ added: count }, null, 2));
    return;
  }

  console.error('Unknown mode. Use --mode=run|init|benchmark|list-profiles|export-profile|import-profiles');
  process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


