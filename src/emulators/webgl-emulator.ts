/**
 * WebGL Context Emulator for Chrome compatibility
 * Provides WebGL rendering context that mimics Chrome behavior
 */

import { EmulationConfig } from '@/types/emulation-types';
import { EmulationError } from '@/types/error-types';

export interface WebGLEmulator {
  createContext(canvas: HTMLCanvasElement): WebGLRenderingContext;
  setupChromeParameters(): void;
  configureExtensions(): void;
  setupRenderer(): void;
}

export class ChromeWebGLEmulator implements WebGLEmulator {
  private config: EmulationConfig;
  private context: WebGLRenderingContext | null = null;
  private extensions: Map<string, any> = new Map();
  private parameters: Map<number, any> = new Map();
  private shaderCache: Map<string, any> = new Map();
  private consistentResults: Map<string, any> = new Map();

  constructor(config: EmulationConfig) {
    this.config = config;
    this.initializeChromeExtensions();
    this.initializeChromeParameters();
    this.initializeConsistentResults();
  }

  /**
   * Create WebGL rendering context with Chrome characteristics
   */
  createContext(canvas: HTMLCanvasElement): WebGLRenderingContext {
    try {
      // Create mock WebGL context
      const context = this.createMockWebGLContext(canvas);
      this.context = context;

      // Setup Chrome-specific behavior
      this.setupChromeParameters();
      this.configureExtensions();
      this.setupRenderer();

      return context;
    } catch (error) {
      throw new EmulationError(
        `Failed to create WebGL context: ${error}`,
        'emulation',
        'WebGLEmulator'
      );
    }
  }

  /**
   * Setup Chrome-specific WebGL parameters
   */
  setupChromeParameters(): void {
    if (!this.context) return;

    // Chrome-specific parameter values
    const chromeParams = {
      [this.context.VERSION]: this.config.webgl.version,
      [this.context.VENDOR]: this.config.webgl.vendor,
      [this.context.RENDERER]: this.config.webgl.renderer,
      [this.context.SHADING_LANGUAGE_VERSION]: 'WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)',

      // Viewport and buffer parameters
      [this.context.MAX_VIEWPORT_DIMS]: new Int32Array([16384, 16384]),
      [this.context.MAX_TEXTURE_SIZE]: 16384,
      [this.context.MAX_CUBE_MAP_TEXTURE_SIZE]: 16384,
      [this.context.MAX_RENDERBUFFER_SIZE]: 16384,

      // Vertex attributes
      [this.context.MAX_VERTEX_ATTRIBS]: 16,
      [this.context.MAX_VERTEX_UNIFORM_VECTORS]: 1024,
      [this.context.MAX_VARYING_VECTORS]: 30,
      [this.context.MAX_VERTEX_TEXTURE_IMAGE_UNITS]: 16,

      // Fragment shader
      [this.context.MAX_FRAGMENT_UNIFORM_VECTORS]: 1024,
      [this.context.MAX_TEXTURE_IMAGE_UNITS]: 16,

      // Combined
      [this.context.MAX_COMBINED_TEXTURE_IMAGE_UNITS]: 32,

      // Aliased ranges
      [this.context.ALIASED_LINE_WIDTH_RANGE]: new Float32Array([1, 1]),
      [this.context.ALIASED_POINT_SIZE_RANGE]: new Float32Array([1, 1024]),

      // Color bits
      [this.context.RED_BITS]: 8,
      [this.context.GREEN_BITS]: 8,
      [this.context.BLUE_BITS]: 8,
      [this.context.ALPHA_BITS]: 8,
      [this.context.DEPTH_BITS]: 24,
      [this.context.STENCIL_BITS]: 8,

      // Subpixel bits
      [this.context.SUBPIXEL_BITS]: 4,

      // Sample buffers
      [this.context.SAMPLES]: 0,
      [this.context.SAMPLE_BUFFERS]: 0
    };

    // Store parameters for getParameter calls
    Object.entries(chromeParams).forEach(([key, value]) => {
      this.parameters.set(parseInt(key), value);
    });
  }

  /**
   * Configure WebGL extensions matching Chrome
   */
  configureExtensions(): void {
    if (!this.context) return;

    // Chrome-supported WebGL extensions
    const chromeExtensions = [
      'ANGLE_instanced_arrays',
      'EXT_blend_minmax',
      'EXT_color_buffer_half_float',
      'EXT_disjoint_timer_query',
      'EXT_float_blend',
      'EXT_frag_depth',
      'EXT_shader_texture_lod',
      'EXT_texture_compression_bptc',
      'EXT_texture_compression_rgtc',
      'EXT_texture_filter_anisotropic',
      'WEBKIT_EXT_texture_filter_anisotropic',
      'EXT_sRGB',
      'KHR_parallel_shader_compile',
      'OES_element_index_uint',
      'OES_fbo_render_mipmap',
      'OES_standard_derivatives',
      'OES_texture_float',
      'OES_texture_float_linear',
      'OES_texture_half_float',
      'OES_texture_half_float_linear',
      'OES_vertex_array_object',
      'WEBGL_color_buffer_float',
      'WEBGL_compressed_texture_s3tc',
      'WEBGL_compressed_texture_s3tc_srgb',
      'WEBGL_debug_renderer_info',
      'WEBGL_debug_shaders',
      'WEBGL_depth_texture',
      'WEBGL_draw_buffers',
      'WEBGL_lose_context'
    ];

    // Create mock extension objects
    chromeExtensions.forEach(extName => {
      this.extensions.set(extName, this.createMockExtension(extName));
    });
  }

  /**
   * Setup GPU renderer information
   */
  setupRenderer(): void {
    // Renderer info is handled in parameters setup
    // Additional renderer-specific setup can be added here
  }

  /**
   * Initialize consistent fingerprinting results
   */
  private initializeConsistentResults(): void {
    // Consistent shader compilation results
    this.consistentResults.set('vertexShaderPrecision', {
      rangeMin: 127,
      rangeMax: 127,
      precision: 23
    });

    this.consistentResults.set('fragmentShaderPrecision', {
      rangeMin: 127,
      rangeMax: 127,
      precision: 23
    });

    // Consistent rendering results for fingerprinting tests
    this.consistentResults.set('canvasFingerprint', this.generateConsistentCanvasData());
    this.consistentResults.set('webglFingerprint', this.generateConsistentWebGLData());
  }

  /**
   * Generate consistent canvas data for fingerprinting
   */
  private generateConsistentCanvasData(): ImageData {
    // Create deterministic image data that matches Chrome behavior
    const width = 256;
    const height = 128;
    const data = new Uint8ClampedArray(width * height * 4);

    // Generate consistent pattern based on config
    const seed = this.hashConfig();
    for (let i = 0; i < data.length; i += 4) {
      const pixel = (i / 4) + seed;
      data[i] = (pixel * 123) % 256;     // Red
      data[i + 1] = (pixel * 456) % 256; // Green
      data[i + 2] = (pixel * 789) % 256; // Blue
      data[i + 3] = 255;                 // Alpha
    }

    return { data, width, height, colorSpace: 'srgb' } as ImageData;
  }

  /**
   * Generate consistent WebGL fingerprint data
   */
  private generateConsistentWebGLData(): any {
    return {
      antialias: true,
      depth: true,
      failIfMajorPerformanceCaveat: false,
      powerPreference: 'default',
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      stencil: false,
      desynchronized: false
    };
  }

  /**
   * Hash configuration for consistent results
   */
  private hashConfig(): number {
    const str = `${this.config.webgl.vendor}${this.config.webgl.renderer}${this.config.chromeVersion}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Create mock WebGL rendering context
   */
  private createMockWebGLContext(canvas: HTMLCanvasElement): WebGLRenderingContext {
    const mockContext = {
      canvas,

      // WebGL constants
      VERSION: 0x1F02,
      VENDOR: 0x1F00,
      RENDERER: 0x1F01,
      SHADING_LANGUAGE_VERSION: 0x8B8C,
      MAX_VIEWPORT_DIMS: 0x0D3A,
      MAX_TEXTURE_SIZE: 0x0D33,
      MAX_CUBE_MAP_TEXTURE_SIZE: 0x851C,
      MAX_RENDERBUFFER_SIZE: 0x84E8,
      MAX_VERTEX_ATTRIBS: 0x8869,
      MAX_VERTEX_UNIFORM_VECTORS: 0x8DFB,
      MAX_VARYING_VECTORS: 0x8DFC,
      MAX_VERTEX_TEXTURE_IMAGE_UNITS: 0x8B4C,
      MAX_FRAGMENT_UNIFORM_VECTORS: 0x8DFD,
      MAX_TEXTURE_IMAGE_UNITS: 0x8872,
      MAX_COMBINED_TEXTURE_IMAGE_UNITS: 0x8B4D,
      ALIASED_LINE_WIDTH_RANGE: 0x846E,
      ALIASED_POINT_SIZE_RANGE: 0x846D,
      RED_BITS: 0x0D52,
      GREEN_BITS: 0x0D53,
      BLUE_BITS: 0x0D54,
      ALPHA_BITS: 0x0D55,
      DEPTH_BITS: 0x0D56,
      STENCIL_BITS: 0x0D57,
      SUBPIXEL_BITS: 0x0D50,
      SAMPLES: 0x80A9,
      SAMPLE_BUFFERS: 0x80A8,

      // Core WebGL methods
      getParameter: (pname: number) => {
        return this.parameters.get(pname) || null;
      },

      getExtension: (name: string) => {
        return this.extensions.get(name) || null;
      },

      getSupportedExtensions: () => {
        return Array.from(this.extensions.keys());
      },

      // Shader methods with fingerprinting resistance
      createShader: (type: number) => {
        const shader = { type, id: this.generateConsistentId('shader', type) };
        return shader;
      },
      shaderSource: (shader: any, source: string) => {
        // Cache shader source for consistent compilation
        this.shaderCache.set(shader.id, source);
      },
      compileShader: (shader: any) => {
        // Always report successful compilation for consistency
        shader.compiled = true;
      },
      getShaderParameter: (shader: any, pname: number) => {
        void shader;
        // Return consistent shader parameters
        if (pname === 0x8B81) return true; // COMPILE_STATUS
        if (pname === 0x8B84) return 0;    // INFO_LOG_LENGTH
        return true;
      },
      getShaderInfoLog: () => '', // No compilation errors for consistency

      // Program methods with fingerprinting resistance
      createProgram: () => {
        const program = { id: this.generateConsistentId('program') };
        return program;
      },
      attachShader: (program: any, shader: any) => {
        if (!program.shaders) program.shaders = [];
        program.shaders.push(shader);
      },
      linkProgram: (program: any) => {
        // Always report successful linking
        program.linked = true;
      },
      getProgramParameter: (program: any, pname: number) => {
        // Return consistent program parameters
        void program;
        if (pname === 0x8B82) return true; // LINK_STATUS
        if (pname === 0x8B84) return 0;    // INFO_LOG_LENGTH
        if (pname === 0x8B87) return 16;   // ACTIVE_ATTRIBUTES
        if (pname === 0x8B86) return 8;    // ACTIVE_UNIFORMS
        return true;
      },
      getProgramInfoLog: () => '', // No linking errors for consistency
      useProgram: () => { },

      // Buffer methods
      createBuffer: () => ({ id: Math.random() }),
      bindBuffer: () => { },
      bufferData: () => { },

      // Texture methods
      createTexture: () => ({ id: Math.random() }),
      bindTexture: () => { },
      texImage2D: () => { },
      texParameteri: () => { },

      // Rendering methods with consistent results
      viewport: () => { },
      clear: () => { },
      clearColor: () => { },
      drawArrays: () => { },
      drawElements: () => { },
      readPixels: (x: number, y: number, width: number, height: number, format: number, type: number, pixels: ArrayBufferView) => {
        void x; void y; void width; void height; void format; void type;
        // Return consistent pixel data for fingerprinting resistance
        const consistentData = this.createConsistentRenderingResult();
        if (pixels instanceof Uint8Array) {
          pixels.set(consistentData.slice(0, pixels.length));
        }
      },

      // State methods
      enable: () => { },
      disable: () => { },
      blendFunc: () => { },
      depthFunc: () => { },

      // Attribute methods
      getAttribLocation: (program: any, name: string) => {
        // Return consistent attribute locations
        void program;
        const idStr = this.generateConsistentId('attr', name.charCodeAt(0));
        const num = Number(idStr.split('_')[1]) || 0;
        return num % 16;
      },
      enableVertexAttribArray: () => { },
      vertexAttribPointer: () => { },

      // Uniform methods with consistent locations
      getUniformLocation: (program: any, name: string) => {
        void program;
        return { id: this.generateConsistentId('uniform', name.charCodeAt(0)) };
      },
      uniform1f: () => { },
      uniform2f: () => { },
      uniform3f: () => { },
      uniform4f: () => { },
      uniformMatrix4fv: () => { },

      // Shader precision methods
      getShaderPrecisionFormat: (shaderType: number, precisionType: number) => {
        void precisionType;
        return this.getShaderPrecisionFormat(shaderType, precisionType);
      },

      // Error handling
      getError: () => 0, // GL_NO_ERROR

      // Additional methods for completeness
      flush: () => { },
      finish: () => { },
      isContextLost: () => false
    };

    return mockContext as unknown as WebGLRenderingContext;
  }

  /**
   * Create mock extension object
   */
  private createMockExtension(name: string): any {
    switch (name) {
      case 'WEBGL_debug_renderer_info':
        return {
          UNMASKED_VENDOR_WEBGL: 0x9245,
          UNMASKED_RENDERER_WEBGL: 0x9246
        };

      case 'WEBGL_lose_context':
        return {
          loseContext: () => { },
          restoreContext: () => { }
        };

      case 'OES_vertex_array_object':
        return {
          createVertexArrayOES: () => ({ id: this.generateConsistentId('vao') }),
          deleteVertexArrayOES: () => { },
          isVertexArrayOES: () => true,
          bindVertexArrayOES: () => { },
          VERTEX_ARRAY_BINDING_OES: 0x85B5
        };

      case 'ANGLE_instanced_arrays':
        return {
          drawArraysInstancedANGLE: () => { },
          drawElementsInstancedANGLE: () => { },
          vertexAttribDivisorANGLE: () => { },
          VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE: 0x88FE
        };

      case 'EXT_texture_filter_anisotropic':
      case 'WEBKIT_EXT_texture_filter_anisotropic':
        return {
          TEXTURE_MAX_ANISOTROPY_EXT: 0x84FE,
          MAX_TEXTURE_MAX_ANISOTROPY_EXT: 0x84FF
        };

      case 'WEBGL_draw_buffers':
        return {
          COLOR_ATTACHMENT0_WEBGL: 0x8CE0,
          COLOR_ATTACHMENT1_WEBGL: 0x8CE1,
          DRAW_BUFFER0_WEBGL: 0x8825,
          DRAW_BUFFER1_WEBGL: 0x8826,
          MAX_COLOR_ATTACHMENTS_WEBGL: 0x8CDF,
          MAX_DRAW_BUFFERS_WEBGL: 0x8824,
          drawBuffersWEBGL: () => { }
        };

      case 'OES_texture_float':
        return {};

      case 'OES_texture_half_float':
        return {
          HALF_FLOAT_OES: 0x8D61
        };

      case 'WEBGL_depth_texture':
        return {
          UNSIGNED_INT_24_8_WEBGL: 0x84FA
        };

      case 'EXT_disjoint_timer_query':
        return {
          QUERY_COUNTER_BITS_EXT: 0x8864,
          CURRENT_QUERY_EXT: 0x8865,
          QUERY_RESULT_EXT: 0x8866,
          QUERY_RESULT_AVAILABLE_EXT: 0x8867,
          TIME_ELAPSED_EXT: 0x88BF,
          TIMESTAMP_EXT: 0x8E28,
          GPU_DISJOINT_EXT: 0x8FBB,
          createQueryEXT: () => ({ id: this.generateConsistentId('query') }),
          deleteQueryEXT: () => { },
          isQueryEXT: () => true,
          beginQueryEXT: () => { },
          endQueryEXT: () => { },
          queryCounterEXT: () => { },
          getQueryEXT: () => null,
          getQueryObjectEXT: () => 0
        };

      default:
        return {};
    }
  }

  /**
   * Initialize Chrome-supported extensions
   */
  private initializeChromeExtensions(): void {
    // Extensions are initialized in configureExtensions()
  }

  /**
   * Initialize Chrome-specific parameters
   */
  private initializeChromeParameters(): void {
    // Parameters are initialized in setupChromeParameters()
  }

  /**
   * Generate consistent ID for WebGL objects
   */
  private generateConsistentId(type: string, subtype?: number): string {
    const seed = this.hashConfig();
    const typeHash = type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const subtypeHash = subtype || 0;
    const id = (seed + typeHash + subtypeHash) % 1000000;
    return `${type}_${id}`;
  }

  /**
   * Create consistent shader precision format
   */
  private getShaderPrecisionFormat(shaderType: number, precisionType: number): any {
    void precisionType;
    const precision = this.consistentResults.get(
      shaderType === 0x8B30 ? 'vertexShaderPrecision' : 'fragmentShaderPrecision'
    );

    return {
      rangeMin: precision.rangeMin,
      rangeMax: precision.rangeMax,
      precision: precision.precision
    };
  }

  /**
   * Create consistent rendering results
   */
  private createConsistentRenderingResult(): Uint8Array {
    // Generate consistent pixel data for readPixels
    const width = 1;
    const height = 1;
    const data = new Uint8Array(width * height * 4);

    const seed = this.hashConfig();
    data[0] = (seed * 123) % 256; // Red
    data[1] = (seed * 456) % 256; // Green
    data[2] = (seed * 789) % 256; // Blue
    data[3] = 255;                // Alpha

    return data;
  }
}