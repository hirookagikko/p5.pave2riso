/**
 * Effect configuration type definitions for filters, halftone, and dither
 */
/**
 * Filter type
 */
export type FilterType = 'posterize' | 'blur' | 'threshold' | 'gray' | 'opaque' | 'invert' | 'dilate' | 'erode';
/**
 * Posterize filter configuration
 * Reduces the number of colors in the image
 */
export interface PosterizeFilter {
    filterType: 'posterize';
    /** Number of color levels (2-255) */
    levels: number;
}
/**
 * Blur filter configuration
 * Applies Gaussian blur
 */
export interface BlurFilter {
    filterType: 'blur';
    /** Blur radius in pixels (default: 4) */
    radius?: number;
}
/**
 * Threshold filter configuration
 * Converts to binary based on threshold value
 */
export interface ThresholdFilter {
    filterType: 'threshold';
    /** Threshold value (0.0-1.0, default: 0.5) */
    threshold?: number;
}
/**
 * No-argument filter configuration
 * gray, opaque, invert, dilate, erode
 */
export interface NoArgFilter {
    filterType: 'gray' | 'opaque' | 'invert' | 'dilate' | 'erode';
}
/**
 * Filter configuration (Discriminated Union)
 *
 * Type-safe specification of arguments for each filter type
 *
 * @example
 * // Posterize: reduce color count
 * { filterType: 'posterize', levels: 4 }
 *
 * // Blur: apply blur
 * { filterType: 'blur', radius: 3 }
 *
 * // Threshold: binarize
 * { filterType: 'threshold', threshold: 0.5 }
 *
 * // No-argument filters
 * { filterType: 'gray' }
 * { filterType: 'invert' }
 */
export type FilterConfig = PosterizeFilter | BlurFilter | ThresholdFilter | NoArgFilter;
/**
 * Legacy compatible: old format filter configuration
 * @deprecated Use FilterConfig Discriminated Union instead
 */
export interface LegacyFilterConfig {
    filterType: FilterType;
    filterArgs?: number[];
}
/**
 * Converts from Legacy format to Discriminated Union format
 * Used for backward compatibility
 */
export declare const normalizeFilterConfig: (config: FilterConfig | LegacyFilterConfig) => FilterConfig;
/**
 * Halftone configuration
 */
export interface HalftoneConfig {
    /**
     * Arguments for halftone function
     * Typically [dotSize, angle, density] etc.
     * Arguments passed to p5.riso.js halftoneImage()
     */
    halftoneArgs: (string | number)[];
}
/**
 * Dither configuration
 */
export interface DitherConfig {
    /**
     * Arguments for dither function
     * Arguments passed to p5.riso.js ditherImage()
     * Example: ['floydSteinberg', 128] may include strings
     */
    ditherArgs: (string | number)[];
}
//# sourceMappingURL=effects.d.ts.map