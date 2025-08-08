/**
 * Core emulation types and interfaces
 */

export interface EmulationConfig {
  chromeVersion: string;
  platform: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  webgl: {
    vendor: string;
    renderer: string;
    version: string;
  };
  audio: {
    sampleRate: number;
    maxChannelCount: number;
  };
  performance: {
    enableRealisticTiming: boolean;
    baseLatency: number;
    nowResolutionMs?: number;
    jitterMs?: number;
  };
}

export interface ChromeEmulator {
  initialize(): Promise<void>;
  setupEnvironment(): void;
  runCreepJS(): Promise<CreepJSResults>;
  generateReport(): EmulationReport;
}



export interface CreepJSResults {
  fingerprint: string;
  confidence: number;
  detectedBrowser: string;
  detectedOS: string;
  tests: {
    [testName: string]: {
      passed: boolean;
      value: any;
      confidence: number;
    };
  };
  warnings: string[];
  errors: string[];
}

export interface EmulationReport {
  timestamp: Date;
  config: EmulationConfig;
  results: CreepJSResults;
  performance: {
    totalTime: number;
    testTimes: { [testName: string]: number };
  };
  success: boolean;
  recommendations: string[];
}