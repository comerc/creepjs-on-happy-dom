/**
 * Audio API Emulator for Chrome compatibility
 * Provides a deterministic Web Audio API surface suitable for fingerprinting tests
 */

import { EmulationConfig } from '@/types/emulation-types';
import { EmulationError } from '@/types/error-types';

export interface AudioEmulator {
  createAudioContext(): any;
  createOfflineAudioContext(numberOfChannels: number, length: number, sampleRate: number): any;
}

type MockOscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

interface MockAudioBuffer {
  readonly sampleRate: number;
  readonly length: number;
  readonly duration: number;
  readonly numberOfChannels: number;
  getChannelData(channel: number): Float32Array;
}

interface MockAnalyserNode {
  fftSize: number;
  readonly frequencyBinCount: number;
  smoothingTimeConstant: number;
  connect: (destination: unknown) => unknown;
  getByteFrequencyData: (array: Uint8Array) => void;
  getByteTimeDomainData: (array: Uint8Array) => void;
}

interface MockOscillatorNode {
  type: MockOscillatorType;
  frequency: { value: number };
  detune: { value: number };
  connect: (destination: unknown) => unknown;
  start: (_when?: number) => void;
  stop: (_when?: number) => void;
  onended: null | (() => void);
}

interface MockAudioDestinationNode {
  maxChannelCount: number;
}

interface MockAudioContext {
  readonly sampleRate: number;
  readonly baseLatency: number;
  readonly outputLatency: number;
  readonly destination: MockAudioDestinationNode;
  readonly state: 'suspended' | 'running' | 'closed';
  onstatechange: null | (() => void);
  readonly currentTime: number;
  resume: () => Promise<void>;
  suspend: () => Promise<void>;
  close: () => Promise<void>;
  createAnalyser: () => MockAnalyserNode;
  createOscillator: () => MockOscillatorNode;
  createBuffer: (numberOfChannels: number, length: number, sampleRate: number) => MockAudioBuffer;
  decodeAudioData: (_data: ArrayBuffer) => Promise<MockAudioBuffer>;
  getOutputTimestamp: () => { contextTime: number; performanceTime: number };
  audioWorklet?: { addModule: (_url: string) => Promise<void> };
}

interface MockGainNode {
  gain: { value: number };
  connect: (destination: unknown) => unknown;
}

interface MockBiquadFilterNode {
  type: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
  frequency: { value: number };
  Q: { value: number };
  connect: (destination: unknown) => unknown;
}

interface MockDynamicsCompressorNode {
  threshold: { value: number };
  ratio: { value: number };
  connect: (destination: unknown) => unknown;
}

interface MockChannelMergerNode { connect: (destination: unknown) => unknown; }
interface MockChannelSplitterNode { connect: (destination: unknown) => unknown; }

interface MockOfflineAudioContext {
  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  // Graph construction
  createGain: () => MockGainNode;
  createBiquadFilter: () => MockBiquadFilterNode;
  createDynamicsCompressor: () => MockDynamicsCompressorNode;
  createChannelMerger: (_n?: number) => MockChannelMergerNode;
  createChannelSplitter: (_n?: number) => MockChannelSplitterNode;
  createBuffer: (numberOfChannels: number, length: number, sampleRate: number) => MockAudioBuffer;
  // Offline render
  startRendering: () => Promise<MockAudioBuffer>;
}

export class ChromeAudioEmulator implements AudioEmulator {
  private config: EmulationConfig;
  private globalGraphSignature: number = 0;

  constructor(config: EmulationConfig) {
    this.config = config;
  }

  createAudioContext(): MockAudioContext {
    try {
      const seed = this.hashConfig();
      let internalState: 'suspended' | 'running' | 'closed' = 'suspended';
      const createdAt = Date.now();
      const baseLatency = Math.max(0, this.config.performance.baseLatency);
      const outputLatency = baseLatency + 0.0125; // Chrome typical overhead ~12.5ms

      const destination: MockAudioDestinationNode = {
        maxChannelCount: Math.max(1, this.config.audio.maxChannelCount)
      };

      // Simple connection graph; we only need to track for analyser output determinism
      const connections = new Set<unknown>();

      const thisArg = this;
      const context: MockAudioContext = {
        get sampleRate() { return thisArg.config.audio.sampleRate; },
        get baseLatency() { return baseLatency; },
        get outputLatency() { return outputLatency; },
        destination,
        get state() { return internalState; },
        onstatechange: null,
        get currentTime() {
          const elapsed = (Date.now() - createdAt) / 1000;
          // Add stable offset derived from seed to mimic clock skew but keep deterministic
          const skew = (seed % 7) * 0.0001;
          return Math.max(0, elapsed + skew);
        },
        async resume() { internalState = 'running'; if ((this as any).onstatechange) (this as any).onstatechange(); },
        async suspend() { internalState = 'suspended'; if ((this as any).onstatechange) (this as any).onstatechange(); },
        async close() { internalState = 'closed'; if ((this as any).onstatechange) (this as any).onstatechange(); },
        createAnalyser: () => this.createAnalyserNode(seed, connections),
        createOscillator: () => this.createOscillatorNode(connections),
        createBuffer: (channels: number, length: number, sampleRate: number) => this.createBuffer(seed, channels, length, sampleRate),
        decodeAudioData: async (data: ArrayBuffer) => {
          // Deterministic pseudo-decoder: produce buffer sized by data length
          const length = Math.max(1, Math.min(48000, Math.floor(data.byteLength / 4)));
          return this.createBuffer(seed, 2, length, this.config.audio.sampleRate);
        },
        getOutputTimestamp: () => ({ contextTime: (Date.now() - createdAt) / 1000, performanceTime: performance.now() }),
        audioWorklet: {
          addModule: async (_url: string) => { /* no-op mock */ }
        }
      } as unknown as MockAudioContext;

      return context;
    } catch (error) {
      throw new EmulationError(
        `Failed to create AudioContext: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'emulation',
        'AudioEmulator'
      );
    }
  }

  createOfflineAudioContext(numberOfChannels: number, length: number, sampleRate: number): MockOfflineAudioContext {
    const channels = Math.max(1, numberOfChannels);
    const rate = sampleRate || this.config.audio.sampleRate;
    const seed = this.hashConfig() + channels * 31 + length * 7;

    // Graph signature evolves with created nodes/params via closures below
    let graphSignature = (this.globalGraphSignature += 123);
    const connections = new Set<unknown>();

    const connect = (dest: unknown) => { connections.add(dest); graphSignature += 17; return dest; };

    const oac: MockOfflineAudioContext = {
      length,
      numberOfChannels: channels,
      sampleRate: rate,
      createGain: () => ({
        gain: { value: 1.0 },
        connect
      }),
      createBiquadFilter: () => ({
        type: 'lowpass',
        frequency: { value: 1000 },
        Q: { value: 1 },
        connect
      }),
      createDynamicsCompressor: () => ({
        threshold: { value: -24 },
        ratio: { value: 12 },
        connect
      }),
      createChannelMerger: (_n?: number) => ({ connect }),
      createChannelSplitter: (_n?: number) => ({ connect }),
      createBuffer: (n: number, l: number, sr: number) => this.createBuffer(seed, n, l, sr),
      startRendering: async () => {
        // Deterministic rendering: generate buffer based on seed + graphSignature
        const buf = this.createBuffer(seed + graphSignature, channels, length, rate);
        return buf;
      }
    };

    return oac;
  }

  private createBuffer(seed: number, numberOfChannels: number, length: number, sampleRate: number): MockAudioBuffer {
    const channels = Math.max(1, Math.min(numberOfChannels, this.config.audio.maxChannelCount));
    const rate = sampleRate || this.config.audio.sampleRate;
    const dataPerChannel: Float32Array[] = [];

    for (let ch = 0; ch < channels; ch++) {
      const arr = new Float32Array(length);
      // Deterministic pseudo-signal: low-amplitude noise with seed and channel index
      let value = (seed + ch * 17) % 9973;
      for (let i = 0; i < length; i++) {
        value = (value * 1103515245 + 12345) & 0x7fffffff;
        arr[i] = ((value % 2000) / 2000 - 0.5) * 0.002; // within [-0.001, 0.001]
      }
      dataPerChannel.push(arr);
    }

    const buffer: MockAudioBuffer = {
      sampleRate: rate,
      length,
      get duration() { return length / rate; },
      numberOfChannels: channels,
      getChannelData: (channel: number) => {
        if (channel < 0 || channel >= channels) {
          throw new RangeError('Channel index out of range');
        }
        return dataPerChannel[channel];
      }
    };

    return buffer;
  }

  private createAnalyserNode(seed: number, connections: Set<unknown>): MockAnalyserNode {
    let fftSize = 2048;
    let smoothing = 0.8;

    const analyser: MockAnalyserNode = {
      get fftSize() { return fftSize; },
      set fftSize(val: number) {
        // Enforce power-of-two between 32 and 32768 as in spec
        const allowed = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
        fftSize = allowed.includes(val) ? val : 2048;
      },
      get frequencyBinCount() { return Math.floor(fftSize / 2); },
      get smoothingTimeConstant() { return smoothing; },
      set smoothingTimeConstant(v: number) { smoothing = Math.min(1, Math.max(0, v)); },
      connect: (destination: unknown) => {
        connections.add(destination);
        return destination;
      },
      getByteFrequencyData: (array: Uint8Array) => {
        const len = Math.min(array.length, Math.floor(fftSize / 2));
        // Deterministic spectrum based on seed and bin index with smoothing
        let prev = 0;
        for (let i = 0; i < len; i++) {
          const base = (seed * 131 + i * 977) % 256;
          const v = Math.round(smoothing * prev + (1 - smoothing) * base);
          array[i] = v;
          prev = v;
        }
        for (let i = len; i < array.length; i++) array[i] = 0;
      },
      getByteTimeDomainData: (array: Uint8Array) => {
        const len = Math.min(array.length, Math.floor(fftSize / 2));
        for (let i = 0; i < len; i++) {
          // Centered around 128 to mimic oscilloscope view
          const v = 128 + ((seed + i * 31) % 64) - 32;
          array[i] = v;
        }
        for (let i = len; i < array.length; i++) array[i] = 128;
      }
    } as unknown as MockAnalyserNode;

    return analyser;
  }

  private createOscillatorNode(connections: Set<unknown>): MockOscillatorNode {
    const osc: MockOscillatorNode = {
      type: 'sine',
      frequency: { value: 440 },
      detune: { value: 0 },
      connect: (destination: unknown) => { connections.add(destination); return destination; },
      start: (_when?: number) => { /* no-op in deterministic mock */ },
      stop: (_when?: number) => { if (osc.onended) osc.onended(); },
      onended: null
    } as unknown as MockOscillatorNode;

    return osc;
  }

  /**
   * Hash configuration for deterministic audio results
   */
  private hashConfig(): number {
    const str = `${this.config.audio.sampleRate}|${this.config.performance.baseLatency}|${this.config.chromeVersion}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}


