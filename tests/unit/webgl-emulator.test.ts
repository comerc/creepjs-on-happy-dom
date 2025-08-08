/**
 * Unit tests for WebGL Emulator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChromeWebGLEmulator } from '@/emulators/webgl-emulator';
import { EmulationConfig } from '@/types/emulation-types';

describe('ChromeWebGLEmulator', () => {
  let emulator: ChromeWebGLEmulator;
  let config: EmulationConfig;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    config = {
      chromeVersion: '139.0.7258.67',
      platform: 'Win32',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      viewport: { width: 1920, height: 1080 },
      webgl: {
        vendor: 'Google Inc. (Intel)',
        renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 620 (0x00005917) Direct3D11 vs_5_0 ps_5_0, D3D11)',
        version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)'
      },
      audio: { sampleRate: 44100, maxChannelCount: 2 },
      performance: { enableRealisticTiming: true, baseLatency: 0.1 }
    };

    emulator = new ChromeWebGLEmulator(config);

    // Mock canvas element
    mockCanvas = {
      width: 300,
      height: 150,
      getContext: () => null
    } as unknown as HTMLCanvasElement;
  });

  describe('createContext', () => {
    it('should create a WebGL context', () => {
      const context = emulator.createContext(mockCanvas);

      expect(context).toBeDefined();
      expect(context.canvas).toBe(mockCanvas);
    });

    it('should setup Chrome-specific parameters', () => {
      const context = emulator.createContext(mockCanvas);

      // Test vendor parameter
      expect(context.getParameter(context.VENDOR)).toBe(config.webgl.vendor);

      // Test renderer parameter
      expect(context.getParameter(context.RENDERER)).toBe(config.webgl.renderer);

      // Test version parameter
      expect(context.getParameter(context.VERSION)).toBe(config.webgl.version);
    });

    it('should configure Chrome extensions', () => {
      const context = emulator.createContext(mockCanvas);

      const supportedExtensions = context.getSupportedExtensions();

      // Check for key Chrome extensions
      expect(supportedExtensions).toContain('WEBGL_debug_renderer_info');
      expect(supportedExtensions).toContain('OES_texture_float');
      expect(supportedExtensions).toContain('ANGLE_instanced_arrays');
      expect(supportedExtensions).toContain('WEBGL_lose_context');
    });

    it('should provide working extension objects', () => {
      const context = emulator.createContext(mockCanvas);

      // Test debug renderer info extension
      const debugExt = context.getExtension('WEBGL_debug_renderer_info');
      expect(debugExt).toBeDefined();
      expect(debugExt.UNMASKED_VENDOR_WEBGL).toBe(0x9245);
      expect(debugExt.UNMASKED_RENDERER_WEBGL).toBe(0x9246);

      // Test lose context extension
      const loseContextExt = context.getExtension('WEBGL_lose_context');
      expect(loseContextExt).toBeDefined();
      expect(typeof loseContextExt.loseContext).toBe('function');
      expect(typeof loseContextExt.restoreContext).toBe('function');
    });
  });

  describe('Chrome-specific parameters', () => {
    let context: WebGLRenderingContext;

    beforeEach(() => {
      context = emulator.createContext(mockCanvas);
    });

    it('should return Chrome-like viewport dimensions', () => {
      const maxViewport = context.getParameter(context.MAX_VIEWPORT_DIMS);
      expect(maxViewport).toEqual(new Int32Array([16384, 16384]));
    });

    it('should return Chrome-like texture size limits', () => {
      expect(context.getParameter(context.MAX_TEXTURE_SIZE)).toBe(16384);
      expect(context.getParameter(context.MAX_CUBE_MAP_TEXTURE_SIZE)).toBe(16384);
    });

    it('should return Chrome-like vertex attributes', () => {
      expect(context.getParameter(context.MAX_VERTEX_ATTRIBS)).toBe(16);
      expect(context.getParameter(context.MAX_VERTEX_UNIFORM_VECTORS)).toBe(1024);
      expect(context.getParameter(context.MAX_VARYING_VECTORS)).toBe(30);
    });

    it('should return Chrome-like fragment shader limits', () => {
      expect(context.getParameter(context.MAX_FRAGMENT_UNIFORM_VECTORS)).toBe(1024);
      expect(context.getParameter(context.MAX_TEXTURE_IMAGE_UNITS)).toBe(16);
    });

    it('should return Chrome-like color and depth bits', () => {
      expect(context.getParameter(context.RED_BITS)).toBe(8);
      expect(context.getParameter(context.GREEN_BITS)).toBe(8);
      expect(context.getParameter(context.BLUE_BITS)).toBe(8);
      expect(context.getParameter(context.ALPHA_BITS)).toBe(8);
      expect(context.getParameter(context.DEPTH_BITS)).toBe(24);
      expect(context.getParameter(context.STENCIL_BITS)).toBe(8);
    });

    it('should return Chrome-like aliased ranges', () => {
      const lineRange = context.getParameter(context.ALIASED_LINE_WIDTH_RANGE);
      expect(lineRange).toEqual(new Float32Array([1, 1]));

      const pointRange = context.getParameter(context.ALIASED_POINT_SIZE_RANGE);
      expect(pointRange).toEqual(new Float32Array([1, 1024]));
    });
  });

  describe('WebGL methods', () => {
    let context: WebGLRenderingContext;

    beforeEach(() => {
      context = emulator.createContext(mockCanvas);
    });

    it('should provide shader creation methods', () => {
      const shader = context.createShader(context.VERTEX_SHADER || 0x8B31);
      expect(shader).toBeDefined();
      expect(typeof shader).toBe('object');
    });

    it('should provide program creation methods', () => {
      const program = context.createProgram();
      expect(program).toBeDefined();
      expect(typeof program).toBe('object');
    });

    it('should provide buffer creation methods', () => {
      const buffer = context.createBuffer();
      expect(buffer).toBeDefined();
      expect(typeof buffer).toBe('object');
    });

    it('should provide texture creation methods', () => {
      const texture = context.createTexture();
      expect(texture).toBeDefined();
      expect(typeof texture).toBe('object');
    });

    it('should not report errors by default', () => {
      expect(context.getError()).toBe(0); // GL_NO_ERROR
    });

    it('should not be in lost context state', () => {
      expect(context.isContextLost()).toBe(false);
    });
  });

  describe('Extension functionality', () => {
    let context: WebGLRenderingContext;

    beforeEach(() => {
      context = emulator.createContext(mockCanvas);
    });

    it('should provide vertex array object extension', () => {
      const vaoExt = context.getExtension('OES_vertex_array_object');
      expect(vaoExt).toBeDefined();
      expect(typeof vaoExt.createVertexArrayOES).toBe('function');
      expect(typeof vaoExt.bindVertexArrayOES).toBe('function');

      const vao = vaoExt.createVertexArrayOES();
      expect(vao).toBeDefined();
    });

    it('should provide instanced arrays extension', () => {
      const instancedExt = context.getExtension('ANGLE_instanced_arrays');
      expect(instancedExt).toBeDefined();
      expect(typeof instancedExt.drawArraysInstancedANGLE).toBe('function');
      expect(typeof instancedExt.drawElementsInstancedANGLE).toBe('function');
    });

    it('should return null for unsupported extensions', () => {
      const unsupportedExt = context.getExtension('UNSUPPORTED_EXTENSION');
      expect(unsupportedExt).toBeNull();
    });
  });

  describe('Fingerprinting resistance', () => {
    let context: WebGLRenderingContext;

    beforeEach(() => {
      context = emulator.createContext(mockCanvas);
    });

    it('should provide consistent shader compilation results', () => {
      const vertexShader = context.createShader(0x8B31); // VERTEX_SHADER
      const fragmentShader = context.createShader(0x8B30); // FRAGMENT_SHADER

      context.shaderSource(vertexShader, 'vertex shader source');
      context.shaderSource(fragmentShader, 'fragment shader source');

      context.compileShader(vertexShader);
      context.compileShader(fragmentShader);

      // Should always report successful compilation
      expect(context.getShaderParameter(vertexShader, 0x8B81)).toBe(true); // COMPILE_STATUS
      expect(context.getShaderParameter(fragmentShader, 0x8B81)).toBe(true);

      // Should have no compilation errors
      expect(context.getShaderInfoLog(vertexShader)).toBe('');
      expect(context.getShaderInfoLog(fragmentShader)).toBe('');
    });

    it('should provide consistent program linking results', () => {
      const program = context.createProgram();
      const vertexShader = context.createShader(0x8B31);
      const fragmentShader = context.createShader(0x8B30);

      context.attachShader(program, vertexShader);
      context.attachShader(program, fragmentShader);
      context.linkProgram(program);

      // Should always report successful linking
      expect(context.getProgramParameter(program, 0x8B82)).toBe(true); // LINK_STATUS
      expect(context.getProgramInfoLog(program)).toBe('');

      // Should have consistent attribute and uniform counts
      expect(context.getProgramParameter(program, 0x8B87)).toBe(16); // ACTIVE_ATTRIBUTES
      expect(context.getProgramParameter(program, 0x8B86)).toBe(8);  // ACTIVE_UNIFORMS
    });

    it('should provide consistent attribute and uniform locations', () => {
      const program = context.createProgram();

      // Attribute locations should be consistent
      const attr1 = context.getAttribLocation(program, 'position');
      const attr2 = context.getAttribLocation(program, 'position');
      expect(attr1).toBe(attr2);

      // Uniform locations should be consistent
      const uniform1 = context.getUniformLocation(program, 'mvpMatrix');
      const uniform2 = context.getUniformLocation(program, 'mvpMatrix');
      expect(uniform1.id).toBe(uniform2.id);
    });

    it('should provide consistent rendering results', () => {
      const pixels1 = new Uint8Array(4);
      const pixels2 = new Uint8Array(4);

      context.readPixels(0, 0, 1, 1, 0x1908, 0x1401, pixels1); // RGBA, UNSIGNED_BYTE
      context.readPixels(0, 0, 1, 1, 0x1908, 0x1401, pixels2);

      // Should return consistent pixel data
      expect(pixels1).toEqual(pixels2);
    });

    it('should provide consistent shader precision formats', () => {
      if (context.getShaderPrecisionFormat) {
        const vertexHighFloat = context.getShaderPrecisionFormat(0x8B31, 0x8DF2); // VERTEX_SHADER, HIGH_FLOAT
        const fragmentHighFloat = context.getShaderPrecisionFormat(0x8B30, 0x8DF2); // FRAGMENT_SHADER, HIGH_FLOAT

        expect(vertexHighFloat.rangeMin).toBe(127);
        expect(vertexHighFloat.rangeMax).toBe(127);
        expect(vertexHighFloat.precision).toBe(23);

        expect(fragmentHighFloat.rangeMin).toBe(127);
        expect(fragmentHighFloat.rangeMax).toBe(127);
        expect(fragmentHighFloat.precision).toBe(23);
      }
    });

    it('should provide consistent extension objects with constants', () => {
      const drawBuffersExt = context.getExtension('WEBGL_draw_buffers');
      expect(drawBuffersExt).toBeDefined();
      expect(drawBuffersExt.COLOR_ATTACHMENT0_WEBGL).toBe(0x8CE0);
      expect(drawBuffersExt.MAX_COLOR_ATTACHMENTS_WEBGL).toBe(0x8CDF);

      const timerExt = context.getExtension('EXT_disjoint_timer_query');
      expect(timerExt).toBeDefined();
      expect(timerExt.TIME_ELAPSED_EXT).toBe(0x88BF);
      expect(typeof timerExt.createQueryEXT).toBe('function');
    });

    it('should generate consistent IDs across multiple calls', () => {
      const emulator2 = new ChromeWebGLEmulator(config);
      const context2 = emulator2.createContext(mockCanvas);

      const shader1 = context.createShader(0x8B31);
      const shader2 = context2.createShader(0x8B31);

      // Same configuration should produce same IDs
      expect(shader1.id).toBe(shader2.id);
    });
  });
});
