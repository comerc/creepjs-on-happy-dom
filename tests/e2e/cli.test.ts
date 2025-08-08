/**
 * End-to-end tests for CLI
 */

import { describe, it, expect } from 'vitest';
import { spawn } from 'child_process';
import path from 'path';

function runCli(args: string[], timeoutMs = 20000): Promise<{ code: number; stdout: string; stderr: string; }> {
  return new Promise((resolve, reject) => {
    const cliPath = path.join(process.cwd(), 'src', 'cli.ts');
    const child = spawn(process.execPath, [path.join('node_modules', '.bin', 'tsx'), cliPath, ...args], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    const chunks: Buffer[] = [];
    const errChunks: Buffer[] = [];
    child.stdout.on('data', (d) => chunks.push(Buffer.from(d)));
    child.stderr.on('data', (d) => errChunks.push(Buffer.from(d)));
    const to = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('CLI timed out'));
    }, timeoutMs);
    child.on('close', (code) => {
      clearTimeout(to);
      resolve({ code: code ?? -1, stdout: Buffer.concat(chunks).toString('utf8'), stderr: Buffer.concat(errChunks).toString('utf8') });
    });
    child.on('error', reject);
  });
}

describe('CLI E2E', () => {
  it('should run CreepJS via CLI with a profile and return JSON report', async () => {
    const { code, stdout } = await runCli(['--mode=run', '--profile=chrome-139-windows']);
    expect(code).toBe(0);
    const obj = JSON.parse(stdout);
    expect(obj).toHaveProperty('result');
    expect(obj).toHaveProperty('report');
    expect(obj.report).toHaveProperty('summary');
  });

  it('should list available profiles as JSON array', async () => {
    const { code, stdout } = await runCli(['--mode=list-profiles']);
    expect(code).toBe(0);
    const arr = JSON.parse(stdout);
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.find((p: any) => p.name === 'chrome-139-windows')).toBeTruthy();
  });

  it('should initialize environment and exit successfully', async () => {
    const { code } = await runCli(['--mode=init', '--profile=chrome-139-macos']);
    expect(code).toBe(0);
  });

  it('should run benchmark and output JSON report', async () => {
    const { code, stdout } = await runCli(['--mode=benchmark', '--profile=chrome-139-windows', '--iterations=50']);
    expect(code).toBe(0);
    const obj = JSON.parse(stdout);
    expect(obj).toHaveProperty('performanceNow');
    expect(obj.performanceNow.iterations).toBe(50);
  });
});


