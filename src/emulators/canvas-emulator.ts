/**
 * Canvas API Emulator for Chrome compatibility
 * Provides Canvas 2D rendering context that mimics Chrome behavior
 */

import { EmulationConfig } from '@/types/emulation-types';
import { EmulationError } from '@/types/error-types';

export interface CanvasEmulator {
  create2DContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D;
  setupFontRendering(): void;
  configureImageData(): void;
  setupTextMetrics(): void;
}

export class ChromeCanvasEmulator implements CanvasEmulator {
  private config: EmulationConfig;
  private context: CanvasRenderingContext2D | null = null;
  private fontMetrics: Map<string, any> = new Map();
  private consistentResults: Map<string, any> = new Map();
  private imageDataCache: Map<string, ImageData> = new Map();

  constructor(config: EmulationConfig) {
    this.config = config;
    this.initializeFontMetrics();
    this.initializeConsistentResults();
  }

  /**
   * Create Canvas 2D rendering context with Chrome characteristics
   */
  create2DContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    try {
      // Create mock Canvas 2D context
      const context = this.createMockCanvas2DContext(canvas);
      this.context = context;

      // Setup Chrome-specific behavior
      this.setupFontRendering();
      this.configureImageData();
      this.setupTextMetrics();

      return context;
    } catch (error) {
      throw new EmulationError(
        `Failed to create Canvas 2D context: ${error}`,
        'emulation',
        'CanvasEmulator'
      );
    }
  }

  /**
   * Setup Chrome-specific font rendering behavior
   */
  setupFontRendering(): void {
    if (!this.context) return;

    // Chrome default font settings
    const chromeDefaults = {
      font: '10px sans-serif',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      direction: 'inherit',
      fontKerning: 'auto',
      fontStretch: 'normal',
      fontVariantCaps: 'normal',
      textRendering: 'auto',
      wordSpacing: '0px',
      letterSpacing: 'normal'
    };

    // Store default font settings
    Object.entries(chromeDefaults).forEach(([key, value]) => {
      this.fontMetrics.set(key, value);
    });
  }

  /**
   * Configure image data processing to match Chrome
   */
  configureImageData(): void {
    // Chrome-specific image data processing settings
    const chromeImageSettings = {
      colorSpace: 'srgb',
      storageFormat: 'uint8',
      alpha: 'premultiplied',
      pixelFormat: 'rgba'
    };

    this.consistentResults.set('imageSettings', chromeImageSettings);
  }

  /**
   * Setup text metrics to match Chrome measurements
   */
  setupTextMetrics(): void {
    // Chrome-specific text measurement behavior
    const chromeTextSettings = {
      measurementPrecision: 0.1,
      baselineOffset: 0,
      fontSizeMultiplier: 1.0,
      kerningEnabled: true
    };

    this.consistentResults.set('textSettings', chromeTextSettings);
  }

  /**
   * Initialize consistent fingerprinting results
   */
  private initializeConsistentResults(): void {
    // Consistent canvas fingerprint data
    this.consistentResults.set('canvasFingerprint', this.generateConsistentCanvasFingerprint());
    this.consistentResults.set('textFingerprint', this.generateConsistentTextFingerprint());
    this.consistentResults.set('shapeFingerprint', this.generateConsistentShapeFingerprint());
  }

  /**
   * Initialize Chrome font metrics
   */
  private initializeFontMetrics(): void {
    // Chrome font family mappings
    const chromeFonts = {
      'serif': 'Times New Roman',
      'sans-serif': 'Arial',
      'monospace': 'Consolas',
      'cursive': 'Comic Sans MS',
      'fantasy': 'Impact'
    };

    Object.entries(chromeFonts).forEach(([generic, specific]) => {
      this.fontMetrics.set(generic, specific);
    });
  }

  /**
   * Generate consistent canvas fingerprint
   */
  private generateConsistentCanvasFingerprint(): string {
    const seed = this.hashConfig();
    const canvas = this.createVirtualCanvas(200, 50);
    const ctx = canvas.getContext('2d')!;

    // Draw consistent pattern for fingerprinting
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = `rgb(${(seed * 123) % 256}, ${(seed * 456) % 256}, ${(seed * 789) % 256})`;
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = '#069';
    ctx.fillText('Canvas fingerprint', 2, 15);

    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Canvas fingerprint', 4, 17);

    // Generate consistent data URL
    return canvas.toDataURL();
  }

  /**
   * Generate consistent text fingerprint
   */
  private generateConsistentTextFingerprint(): any {
    const seed = this.hashConfig();
    return {
      width: 120 + (seed % 10),
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: 120 + (seed % 10),
      actualBoundingBoxAscent: 11 + (seed % 3),
      actualBoundingBoxDescent: 3 + (seed % 2),
      fontBoundingBoxAscent: 14,
      fontBoundingBoxDescent: 4,
      alphabeticBaseline: 0,
      hangingBaseline: -11,
      ideographicBaseline: 3
    };
  }

  /**
   * Generate consistent shape fingerprint
   */
  private generateConsistentShapeFingerprint(): ImageData {
    const seed = this.hashConfig();
    const width = 100;
    const height = 100;
    const data = new Uint8ClampedArray(width * height * 4);

    // Generate consistent shape pattern
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const pixel = (x + y + seed) % 256;

        data[index] = (pixel * 123) % 256;     // Red
        data[index + 1] = (pixel * 456) % 256; // Green
        data[index + 2] = (pixel * 789) % 256; // Blue
        data[index + 3] = 255;                 // Alpha
      }
    }

    return { data, width, height, colorSpace: 'srgb' } as ImageData;
  }

  /**
   * Hash configuration for consistent results
   */
  private hashConfig(): number {
    const str = `${this.config.chromeVersion}${this.config.platform}${this.config.viewport.width}x${this.config.viewport.height}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Create virtual canvas for consistent rendering
   */
  private createVirtualCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = {
      width,
      height,
      getContext: (contextType: string) => {
        if (contextType === '2d') {
          return this.createMockCanvas2DContext(canvas as any);
        }
        return null;
      },
      toDataURL: (type?: string, quality?: number) => {
        return this.createChromeDataURL(canvas as any, type, quality);
      }
    };

    return canvas as unknown as HTMLCanvasElement;
  }

  /**
   * Generate deterministic Canvas rendering results
   */
  private generateDeterministicCanvasData(width: number, height: number, operations: string[]): ImageData {
    const seed = this.hashConfig();
    const data = new Uint8ClampedArray(width * height * 4);

    // Create deterministic pattern based on operations and config
    const operationHash = operations.join('').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const combinedSeed = seed + operationHash;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const pixel = (x + y + combinedSeed) % 256;

        // Chrome-like pixel rendering with slight variations
        data[index] = (pixel * 123 + combinedSeed) % 256;     // Red
        data[index + 1] = (pixel * 456 + combinedSeed) % 256; // Green
        data[index + 2] = (pixel * 789 + combinedSeed) % 256; // Blue
        data[index + 3] = 255;                                // Alpha
      }
    }

    return { data, width, height, colorSpace: 'srgb' } as ImageData;
  }

  /**
   * Create Chrome-compatible toDataURL result
   */
  private createChromeDataURL(canvas: HTMLCanvasElement, type?: string, quality?: number): string {
    const seed = this.hashConfig();
    const typeStr = type || 'image/png';
    const qualityStr = quality ? quality.toString() : '1.0';

    // Generate consistent base64 that mimics Chrome's PNG encoding
    const canvasData = `${canvas.width}x${canvas.height}_${this.config.chromeVersion}_${seed}_q${qualityStr}`;
    const base64Data = this.generateChromeCompatibleBase64(canvasData, typeStr);

    return `data:${typeStr};base64,${base64Data}`;
  }

  /**
   * Generate Chrome-compatible base64 encoding
   */
  private generateChromeCompatibleBase64(data: string, mimeType: string): string {
    // Simulate Chrome's PNG encoding characteristics
    const seed = this.hashConfig();
    let result = '';

    // Chrome PNG header simulation
    if (mimeType === 'image/png' || !mimeType.includes('/')) {
      result += 'iVBORw0KGgoAAAANSUhEUgAA'; // PNG signature start
    } else if (mimeType === 'image/jpeg') {
      result += '/9j/4AAQSkZJRgABAQAAAQABAAD'; // JPEG signature start
    }

    // Add deterministic content based on data and seed
    const contentHash = data.split('').reduce((acc, char) => acc + char.charCodeAt(0), seed);
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    for (let i = 0; i < 32; i++) {
      const index = (contentHash + i * 123) % base64Chars.length;
      result += base64Chars[index];
    }

    return result;
  }

  /**
   * Render text with Chrome-specific characteristics
   */
  private renderTextChrome(text: string, x: number, y: number, font: string): void {
    // Chrome text rendering simulation
    const seed = this.hashConfig();
    const textHash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Store rendering operation for deterministic results
    const operation = `text_${text}_${x}_${y}_${font}_${seed}_${textHash}`;
    this.consistentResults.set(`render_${operation}`, {
      type: 'text',
      text,
      x,
      y,
      font,
      hash: textHash + seed
    });
  }

  /**
   * Render shapes with Chrome-specific characteristics
   */
  private renderShapeChrome(type: string, params: number[]): void {
    const seed = this.hashConfig();
    const paramsHash = params.reduce((acc, param) => acc + param, 0);

    // Store rendering operation for deterministic results
    const operation = `shape_${type}_${paramsHash}_${seed}`;
    this.consistentResults.set(`render_${operation}`, {
      type: 'shape',
      shapeType: type,
      params,
      hash: paramsHash + seed
    });
  }

  /**
   * Create mock Canvas 2D rendering context
   */
  private createMockCanvas2DContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const mockContext = {
      canvas,

      // Drawing state
      globalAlpha: 1.0,
      globalCompositeOperation: 'source-over',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'low',
      strokeStyle: '#000000',
      fillStyle: '#000000',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowBlur: 0,
      shadowColor: 'rgba(0, 0, 0, 0)',
      filter: 'none',

      // Line styles
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
      miterLimit: 10,
      lineDashOffset: 0,

      // Text styles
      font: '10px sans-serif',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      direction: 'inherit',

      // State management
      save: () => {
        // Save current state to stack
      },
      restore: () => {
        // Restore state from stack
      },

      // Transformations
      scale: (x: number, y: number) => { this.renderShapeChrome('scale', [x, y]); },
      rotate: (angle: number) => { this.renderShapeChrome('rotate', [angle]); },
      translate: (x: number, y: number) => { this.renderShapeChrome('translate', [x, y]); },
      transform: (a: number, b: number, c: number, d: number, e: number, f: number) => { this.renderShapeChrome('transform', [a, b, c, d, e, f]); },
      setTransform: (a: number, b: number, c: number, d: number, e: number, f: number) => { this.renderShapeChrome('setTransform', [a, b, c, d, e, f]); },
      resetTransform: () => { },

      // Compositing
      createLinearGradient: (x0: number, y0: number, x1: number, y1: number) => {
        void x0; void y0; void x1; void y1;
        return {
          addColorStop: (offset: number, color: string) => { void offset; void color; }
        };
      },
      createRadialGradient: (x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) => {
        void x0; void y0; void r0; void x1; void y1; void r1;
        return {
          addColorStop: (offset: number, color: string) => { void offset; void color; }
        };
      },
      createPattern: (image: any, repetition: string) => {
        void image; void repetition;
        return {};
      },

      // Rectangles with Chrome-specific rendering
      clearRect: (x: number, y: number, w: number, h: number) => {
        this.renderShapeChrome('clearRect', [x, y, w, h]);
      },
      fillRect: (x: number, y: number, w: number, h: number) => {
        this.renderShapeChrome('fillRect', [x, y, w, h]);
      },
      strokeRect: (x: number, y: number, w: number, h: number) => {
        this.renderShapeChrome('strokeRect', [x, y, w, h]);
      },

      // Path API with Chrome-specific rendering
      beginPath: () => {
        this.renderShapeChrome('beginPath', []);
      },
      closePath: () => {
        this.renderShapeChrome('closePath', []);
      },
      moveTo: (x: number, y: number) => {
        this.renderShapeChrome('moveTo', [x, y]);
      },
      lineTo: (x: number, y: number) => {
        this.renderShapeChrome('lineTo', [x, y]);
      },
      bezierCurveTo: (cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => {
        this.renderShapeChrome('bezierCurveTo', [cp1x, cp1y, cp2x, cp2y, x, y]);
      },
      quadraticCurveTo: (cpx: number, cpy: number, x: number, y: number) => {
        this.renderShapeChrome('quadraticCurveTo', [cpx, cpy, x, y]);
      },
      arc: (x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean) => {
        this.renderShapeChrome('arc', [x, y, radius, startAngle, endAngle, counterclockwise ? 1 : 0]);
      },
      arcTo: (x1: number, y1: number, x2: number, y2: number, radius: number) => {
        this.renderShapeChrome('arcTo', [x1, y1, x2, y2, radius]);
      },
      ellipse: (x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean) => {
        this.renderShapeChrome('ellipse', [x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise ? 1 : 0]);
      },
      rect: (x: number, y: number, w: number, h: number) => {
        this.renderShapeChrome('rect', [x, y, w, h]);
      },

      // Drawing paths with Chrome-specific rendering
      fill: (fillRule?: CanvasFillRule) => {
        this.renderShapeChrome('fill', [fillRule === 'evenodd' ? 1 : 0]);
      },
      stroke: () => {
        this.renderShapeChrome('stroke', []);
      },
      clip: (fillRule?: CanvasFillRule) => {
        this.renderShapeChrome('clip', [fillRule === 'evenodd' ? 1 : 0]);
      },
      isPointInPath: (x: number, y: number, fillRule?: CanvasFillRule) => {
        // Return deterministic result based on coordinates and config
        const seed = this.hashConfig();
        return ((x + y + seed + (fillRule === 'evenodd' ? 1 : 0)) % 7) < 3;
      },
      isPointInStroke: (x: number, y: number) => {
        // Return deterministic result based on coordinates and config
        const seed = this.hashConfig();
        return ((x + y + seed) % 5) < 2;
      },

      // Text with Chrome-specific rendering
      fillText: (text: string, x: number, y: number, maxWidth?: number) => {
        void maxWidth;
        this.renderTextChrome(text, x, y, mockContext.font);
      },
      strokeText: (text: string, x: number, y: number, maxWidth?: number) => {
        void maxWidth;
        this.renderTextChrome(`stroke_${text}`, x, y, mockContext.font);
      },
      measureText: (text: string) => {
        return this.measureTextChrome(text);
      },

      // Images
      drawImage: (...args: any[]) => { void args; },

      // Image data
      createImageData: (sw: number, sh: number) => {
        const data = new Uint8ClampedArray(sw * sh * 4);
        return { data, width: sw, height: sh, colorSpace: 'srgb' } as ImageData;
      },
      getImageData: (sx: number, sy: number, sw: number, sh: number) => {
        // Return consistent image data for fingerprinting resistance
        const cacheKey = `${sx}_${sy}_${sw}_${sh}`;
        if (this.imageDataCache.has(cacheKey)) {
          return this.imageDataCache.get(cacheKey)!;
        }

        const imageData = this.getImageDataChrome(sx, sy, sw, sh);
        this.imageDataCache.set(cacheKey, imageData);
        return imageData;
      },
      putImageData: (imageData: ImageData, dx: number, dy: number, dirtyX?: number, dirtyY?: number, dirtyWidth?: number, dirtyHeight?: number) => { void imageData; void dx; void dy; void dirtyX; void dirtyY; void dirtyWidth; void dirtyHeight; },

      // Line dashes
      setLineDash: (segments: number[]) => { void segments; },
      getLineDash: () => [],

      // Canvas state
      getContextAttributes: () => {
        return {
          alpha: true,
          colorSpace: 'srgb',
          desynchronized: false,
          willReadFrequently: false
        };
      }
    };

    // Add toDataURL method to canvas if it doesn't exist
    if (!canvas.toDataURL) {
      (canvas as any).toDataURL = (type?: string, quality?: number) => {
        return this.createChromeDataURL(canvas, type, quality);
      };
    }

    return mockContext as unknown as CanvasRenderingContext2D;
  }

  /**
   * Enhanced getImageData with deterministic rendering results
   */
  private getImageDataChrome(sx: number, sy: number, sw: number, sh: number): ImageData {
    // Avoid unused parameter errors while keeping deterministic behavior
    void sx; void sy;

    // Get all rendering operations that affect this region
    const operations: string[] = [];
    for (const key of this.consistentResults.keys()) {
      if (key.startsWith('render_')) {
        operations.push(key);
      }
    }

    // Generate deterministic image data based on operations
    return this.generateDeterministicCanvasData(sw, sh, operations);
  }

  /**
   * Measure text with Chrome-like behavior
   */
  private measureTextChrome(text: string): TextMetrics {
    const seed = this.hashConfig();
    const baseWidth = text.length * 7; // Approximate character width
    const variation = (seed + text.charCodeAt(0)) % 5;

    const textFingerprint = this.consistentResults.get('textFingerprint');

    return {
      width: baseWidth + variation,
      actualBoundingBoxLeft: textFingerprint.actualBoundingBoxLeft,
      actualBoundingBoxRight: baseWidth + variation,
      actualBoundingBoxAscent: textFingerprint.actualBoundingBoxAscent,
      actualBoundingBoxDescent: textFingerprint.actualBoundingBoxDescent,
      fontBoundingBoxAscent: textFingerprint.fontBoundingBoxAscent,
      fontBoundingBoxDescent: textFingerprint.fontBoundingBoxDescent,
      alphabeticBaseline: textFingerprint.alphabeticBaseline,
      hangingBaseline: textFingerprint.hangingBaseline,
      ideographicBaseline: textFingerprint.ideographicBaseline
    } as TextMetrics;
  }

  /**
   * Create Chrome-compatible canvas fingerprint for toDataURL
   */
  createCanvasFingerprint(canvas: HTMLCanvasElement): string {
    return this.createChromeDataURL(canvas, 'image/png');
  }

  /**
   * Validate Canvas fingerprinting consistency
   */
  validateFingerprintConsistency(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement): boolean {
    const fingerprint1 = this.createCanvasFingerprint(canvas1);
    const fingerprint2 = this.createCanvasFingerprint(canvas2);

    return fingerprint1 === fingerprint2;
  }
}