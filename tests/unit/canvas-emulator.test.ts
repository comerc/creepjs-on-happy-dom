/**
 * Unit tests for Canvas emulator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChromeCanvasEmulator } from '@/emulators/canvas-emulator';
import { EmulationConfig } from '@/types/emulation-types';

describe('ChromeCanvasEmulator', () => {
  let emulator: ChromeCanvasEmulator;
  let config: EmulationConfig;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    config = {
      chromeVersion: '139.0.7258.67',
      platform: 'Win32',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
      viewport: {
        width: 1920,
        height: 1080
      },
      webgl: {
        vendor: 'Google Inc. (Intel)',
        renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 620 (0x00005917) Direct3D11 vs_5_0 ps_5_0, D3D11)',
        version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)'
      },
      audio: {
        sampleRate: 44100,
        maxChannelCount: 2
      },
      performance: {
        enableRealisticTiming: true,
        baseLatency: 0.1
      }
    };

    emulator = new ChromeCanvasEmulator(config);

    // Mock canvas element
    mockCanvas = {
      width: 300,
      height: 150,
      getContext: () => null
    } as unknown as HTMLCanvasElement;
  });

  describe('create2DContext', () => {
    it('should create a Canvas 2D context', () => {
      const context = emulator.create2DContext(mockCanvas);

      expect(context).toBeDefined();
      expect(context.canvas).toBe(mockCanvas);
    });

    it('should have Chrome default properties', () => {
      const context = emulator.create2DContext(mockCanvas);

      expect(context.font).toBe('10px sans-serif');
      expect(context.textAlign).toBe('start');
      expect(context.textBaseline).toBe('alphabetic');
      expect(context.globalAlpha).toBe(1.0);
      expect(context.globalCompositeOperation).toBe('source-over');
    });

    it('should have all required Canvas 2D methods', () => {
      const context = emulator.create2DContext(mockCanvas);

      // Drawing methods
      expect(typeof context.fillRect).toBe('function');
      expect(typeof context.strokeRect).toBe('function');
      expect(typeof context.clearRect).toBe('function');

      // Path methods
      expect(typeof context.beginPath).toBe('function');
      expect(typeof context.closePath).toBe('function');
      expect(typeof context.moveTo).toBe('function');
      expect(typeof context.lineTo).toBe('function');
      expect(typeof context.arc).toBe('function');

      // Text methods
      expect(typeof context.fillText).toBe('function');
      expect(typeof context.strokeText).toBe('function');
      expect(typeof context.measureText).toBe('function');

      // Image methods
      expect(typeof context.drawImage).toBe('function');
      expect(typeof context.getImageData).toBe('function');
      expect(typeof context.putImageData).toBe('function');
      expect(typeof context.createImageData).toBe('function');
    });
  });

  describe('measureText', () => {
    it('should return consistent text metrics', () => {
      const context = emulator.create2DContext(mockCanvas);

      const metrics1 = context.measureText('Test text');
      const metrics2 = context.measureText('Test text');

      expect(metrics1.width).toBe(metrics2.width);
      expect(metrics1.actualBoundingBoxLeft).toBe(metrics2.actualBoundingBoxLeft);
      expect(metrics1.actualBoundingBoxRight).toBe(metrics2.actualBoundingBoxRight);
    });

    it('should return Chrome-like text metrics properties', () => {
      const context = emulator.create2DContext(mockCanvas);

      const metrics = context.measureText('Test');

      expect(typeof metrics.width).toBe('number');
      expect(typeof metrics.actualBoundingBoxLeft).toBe('number');
      expect(typeof metrics.actualBoundingBoxRight).toBe('number');
      expect(typeof metrics.actualBoundingBoxAscent).toBe('number');
      expect(typeof metrics.actualBoundingBoxDescent).toBe('number');
      expect(typeof metrics.fontBoundingBoxAscent).toBe('number');
      expect(typeof metrics.fontBoundingBoxDescent).toBe('number');
    });

    it('should vary width based on text length', () => {
      const context = emulator.create2DContext(mockCanvas);

      const shortMetrics = context.measureText('Hi');
      const longMetrics = context.measureText('Hello World');

      expect(longMetrics.width).toBeGreaterThan(shortMetrics.width);
    });
  });

  describe('getImageData', () => {
    it('should return consistent image data', () => {
      const context = emulator.create2DContext(mockCanvas);

      const imageData1 = context.getImageData(0, 0, 10, 10);
      const imageData2 = context.getImageData(0, 0, 10, 10);

      expect(imageData1.width).toBe(imageData2.width);
      expect(imageData1.height).toBe(imageData2.height);
      expect(imageData1.data.length).toBe(imageData2.data.length);

      // Check that data is identical
      for (let i = 0; i < imageData1.data.length; i++) {
        expect(imageData1.data[i]).toBe(imageData2.data[i]);
      }
    });

    it('should return proper ImageData structure', () => {
      const context = emulator.create2DContext(mockCanvas);

      const imageData = context.getImageData(0, 0, 5, 5);

      expect(imageData.width).toBe(5);
      expect(imageData.height).toBe(5);
      expect(imageData.data.length).toBe(5 * 5 * 4); // RGBA
      expect(imageData.colorSpace).toBe('srgb');
    });

    it('should cache image data for same coordinates', () => {
      const context = emulator.create2DContext(mockCanvas);

      const imageData1 = context.getImageData(10, 10, 20, 20);
      const imageData2 = context.getImageData(10, 10, 20, 20);

      // Should return the same cached instance
      expect(imageData1).toBe(imageData2);
    });
  });

  describe('createImageData', () => {
    it('should create ImageData with correct dimensions', () => {
      const context = emulator.create2DContext(mockCanvas);

      const imageData = context.createImageData(100, 50);

      expect(imageData.width).toBe(100);
      expect(imageData.height).toBe(50);
      expect(imageData.data.length).toBe(100 * 50 * 4);
      expect(imageData.colorSpace).toBe('srgb');
    });

    it('should initialize data array with zeros', () => {
      const context = emulator.create2DContext(mockCanvas);

      const imageData = context.createImageData(2, 2);

      // All pixels should be transparent black initially
      for (let i = 0; i < imageData.data.length; i++) {
        expect(imageData.data[i]).toBe(0);
      }
    });
  });

  describe('gradients and patterns', () => {
    it('should create linear gradients', () => {
      const context = emulator.create2DContext(mockCanvas);

      const gradient = context.createLinearGradient(0, 0, 100, 100);

      expect(gradient).toBeDefined();
      expect(typeof gradient.addColorStop).toBe('function');
    });

    it('should create radial gradients', () => {
      const context = emulator.create2DContext(mockCanvas);

      const gradient = context.createRadialGradient(0, 0, 10, 50, 50, 50);

      expect(gradient).toBeDefined();
      expect(typeof gradient.addColorStop).toBe('function');
    });

    it('should create patterns', () => {
      const context = emulator.create2DContext(mockCanvas);

      const pattern = context.createPattern({}, 'repeat');

      expect(pattern).toBeDefined();
    });
  });

  describe('context attributes', () => {
    it('should return Chrome-like context attributes', () => {
      const context = emulator.create2DContext(mockCanvas);

      const attributes = context.getContextAttributes();

      expect(attributes.alpha).toBe(true);
      expect(attributes.colorSpace).toBe('srgb');
      expect(attributes.desynchronized).toBe(false);
      expect(attributes.willReadFrequently).toBe(false);
    });
  });

  describe('line dash methods', () => {
    it('should handle line dash operations', () => {
      const context = emulator.create2DContext(mockCanvas);

      context.setLineDash([5, 10, 15]);
      const lineDash = context.getLineDash();

      expect(Array.isArray(lineDash)).toBe(true);
    });
  });

  describe('fingerprinting resistance', () => {
    it('should produce consistent results across multiple instances', () => {
      const emulator1 = new ChromeCanvasEmulator(config);
      const emulator2 = new ChromeCanvasEmulator(config);

      const context1 = emulator1.create2DContext(mockCanvas);
      const context2 = emulator2.create2DContext(mockCanvas);

      const metrics1 = context1.measureText('Fingerprint test');
      const metrics2 = context2.measureText('Fingerprint test');

      expect(metrics1.width).toBe(metrics2.width);

      const imageData1 = context1.getImageData(0, 0, 10, 10);
      const imageData2 = context2.getImageData(0, 0, 10, 10);

      for (let i = 0; i < imageData1.data.length; i++) {
        expect(imageData1.data[i]).toBe(imageData2.data[i]);
      }
    });

    it('should vary results based on configuration', () => {
      const config2 = { ...config, chromeVersion: '138.0.0.0' };
      const emulator2 = new ChromeCanvasEmulator(config2);

      const context1 = emulator.create2DContext(mockCanvas);
      const context2 = emulator2.create2DContext(mockCanvas);

      const imageData1 = context1.getImageData(0, 0, 10, 10);
      const imageData2 = context2.getImageData(0, 0, 10, 10);

      // Should be different due to different config
      let isDifferent = false;
      for (let i = 0; i < imageData1.data.length; i++) {
        if (imageData1.data[i] !== imageData2.data[i]) {
          isDifferent = true;
          break;
        }
      }
      expect(isDifferent).toBe(true);
    });

    describe('Canvas fingerprinting consistency', () => {
      it('should generate consistent toDataURL results', () => {
        const context = emulator.create2DContext(mockCanvas);

        // Perform some drawing operations
        context.fillRect(10, 10, 50, 50);
        context.fillText('Test', 20, 30);

        const dataURL1 = (mockCanvas as any).toDataURL();
        const dataURL2 = (mockCanvas as any).toDataURL();

        expect(dataURL1).toBe(dataURL2);
        expect(dataURL1).toMatch(/^data:image\/png;base64,/);
      });

      it('should generate different toDataURL for different MIME types', () => {
        const context = emulator.create2DContext(mockCanvas);

        const pngURL = (mockCanvas as any).toDataURL('image/png');
        const jpegURL = (mockCanvas as any).toDataURL('image/jpeg');

        expect(pngURL).not.toBe(jpegURL);
        expect(pngURL).toMatch(/^data:image\/png;base64,/);
        expect(jpegURL).toMatch(/^data:image\/jpeg;base64,/);
      });

      it('should create consistent canvas fingerprints', () => {
        const canvas1 = { ...mockCanvas };
        const canvas2 = { ...mockCanvas };

        const fingerprint1 = emulator.createCanvasFingerprint(canvas1 as any);
        const fingerprint2 = emulator.createCanvasFingerprint(canvas2 as any);

        expect(fingerprint1).toBe(fingerprint2);
      });

      it('should validate fingerprint consistency', () => {
        const canvas1 = { ...mockCanvas };
        const canvas2 = { ...mockCanvas };

        const isConsistent = emulator.validateFingerprintConsistency(canvas1 as any, canvas2 as any);

        expect(isConsistent).toBe(true);
      });

      it('should track rendering operations for deterministic results', () => {
        const context = emulator.create2DContext(mockCanvas);

        // Perform various operations
        context.fillRect(0, 0, 100, 100);
        context.strokeRect(10, 10, 80, 80);
        context.fillText('Hello', 25, 50);
        context.arc(50, 50, 20, 0, Math.PI * 2);
        context.fill();

        // Get image data multiple times - should be consistent
        const imageData1 = context.getImageData(0, 0, 100, 100);
        const imageData2 = context.getImageData(0, 0, 100, 100);

        expect(imageData1).toBe(imageData2); // Should be cached

        // Different region should be different but consistent
        const imageData3 = context.getImageData(10, 10, 50, 50);
        const imageData4 = context.getImageData(10, 10, 50, 50);

        expect(imageData3).toBe(imageData4); // Should be cached
        expect(imageData1).not.toBe(imageData3); // Different regions
      });

      it('should handle isPointInPath and isPointInStroke deterministically', () => {
        const context = emulator.create2DContext(mockCanvas);

        // Create a path
        context.beginPath();
        context.rect(10, 10, 50, 50);

        // Test same point multiple times
        const result1 = context.isPointInPath(35, 35);
        const result2 = context.isPointInPath(35, 35);
        const result3 = context.isPointInStroke(35, 35);
        const result4 = context.isPointInStroke(35, 35);

        expect(result1).toBe(result2);
        expect(result3).toBe(result4);
        expect(typeof result1).toBe('boolean');
        expect(typeof result3).toBe('boolean');
      });
    });
  }
  );
});