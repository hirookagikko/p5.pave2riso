/**
 * Discriminated Union type definitions for Stroke configuration
 */
import type { ColorStop, GradientType, GradientDirection } from './fill.js';
import type { FilterConfig, HalftoneConfig, DitherConfig } from './effects.js';
import type { DashPattern } from './branded.js';
/**
 * Stroke cap style (shape of line ends)
 */
export type StrokeCap = 'round' | 'square' | 'butt';
/**
 * Stroke join style (shape of line corners)
 */
export type StrokeJoin = 'miter' | 'bevel' | 'round';
/**
 * Solid stroke configuration
 */
export interface SolidStrokeConfig {
    type: 'solid';
    /**
     * Stroke weight (pixels)
     */
    strokeWeight: number;
    /**
     * Ink density for each channel (0-100)
     */
    channelVals: number[];
    /**
     * Stroke cap style (shape of line ends)
     */
    strokeCap?: StrokeCap;
    /**
     * Stroke join style (shape of line corners)
     */
    strokeJoin?: StrokeJoin;
    /**
     * Filter configuration
     */
    filter?: FilterConfig | FilterConfig[] | null;
    /**
     * Halftone configuration
     */
    halftone?: HalftoneConfig | null;
    /**
     * Dither configuration
     */
    dither?: DitherConfig | null;
}
/**
 * Dashed stroke configuration
 */
export interface DashedStrokeConfig {
    type: 'dashed';
    /**
     * Stroke weight (pixels)
     */
    strokeWeight: number;
    /**
     * Ink density for each channel (0-100)
     */
    channelVals: number[];
    /**
     * Dash pattern [lineLength, gapLength]
     * @example dashArgs: [10, 5] // 10px line, 5px gap
     */
    dashArgs: DashPattern;
    /**
     * Stroke cap style (shape of line ends)
     */
    strokeCap: StrokeCap;
    /**
     * Stroke join style (shape of line corners)
     */
    strokeJoin?: StrokeJoin;
    /**
     * Filter configuration
     */
    filter?: FilterConfig | FilterConfig[] | null;
    /**
     * Halftone configuration
     */
    halftone?: HalftoneConfig | null;
    /**
     * Dither configuration
     */
    dither?: DitherConfig | null;
}
/**
 * Pattern stroke configuration
 */
export interface PatternStrokeConfig {
    type: 'pattern';
    /**
     * Stroke weight (pixels)
     */
    strokeWeight: number;
    /**
     * Ink density for each channel (0-100)
     */
    channelVals: number[];
    /**
     * Pattern name (key in PTN object)
     */
    PTN: string;
    /**
     * Arguments for pattern function
     */
    patternArgs: unknown[];
    /**
     * Pattern rotation angle (in degrees)
     * @example
     * patternAngle: 45  // 45 degree rotation
     * patternAngle: 90  // 90 degree rotation
     */
    patternAngle?: number;
    /**
     * Dash pattern [lineLength, gapLength]
     * When specified, creates a dashed pattern stroke
     * @example dashArgs: [10, 5] // 10px line, 5px gap
     */
    dashArgs?: DashPattern;
    /**
     * Stroke cap style (shape of line ends)
     */
    strokeCap?: StrokeCap;
    /**
     * Stroke join style (shape of line corners)
     */
    strokeJoin?: StrokeJoin;
    /**
     * Filter configuration
     */
    filter?: FilterConfig | FilterConfig[] | null;
    /**
     * Halftone configuration
     */
    halftone?: HalftoneConfig | null;
    /**
     * Dither configuration
     */
    dither?: DitherConfig | null;
}
/**
 * Gradient stroke configuration
 */
export interface GradientStrokeConfig {
    type: 'gradient';
    /**
     * Stroke weight (pixels)
     */
    strokeWeight: number;
    /**
     * Gradient type
     */
    gradientType: GradientType;
    /**
     * Gradient direction (linear gradient only)
     */
    gradientDirection?: GradientDirection;
    /**
     * Color stops
     */
    colorStops: ColorStop[];
    /**
     * Dash pattern [lineLength, gapLength]
     * When specified, creates a dashed gradient stroke
     * @example dashArgs: [10, 5] // 10px line, 5px gap
     */
    dashArgs?: DashPattern;
    /**
     * Stroke cap style (shape of line ends)
     */
    strokeCap?: StrokeCap;
    /**
     * Stroke join style (shape of line corners)
     */
    strokeJoin?: StrokeJoin;
    /**
     * Filter configuration
     */
    filter?: FilterConfig | FilterConfig[] | null;
    /**
     * Halftone configuration
     */
    halftone?: HalftoneConfig | null;
    /**
     * Dither configuration
     */
    dither?: DitherConfig | null;
}
/**
 * Discriminated Union for Stroke configuration
 *
 * The type field determines the stroke method,
 * allowing TypeScript to properly narrow the type
 */
export type StrokeConfig = SolidStrokeConfig | DashedStrokeConfig | PatternStrokeConfig | GradientStrokeConfig;
//# sourceMappingURL=stroke.d.ts.map