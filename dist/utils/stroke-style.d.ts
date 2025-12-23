/**
 * Stroke style conversion utilities
 *
 * Shared functions for converting stroke cap and join values
 * between different formats (p5.js constants and Canvas API)
 */
import type { StrokeCap, StrokeJoin } from '../types/stroke.js';
/**
 * Convert strokeCap string to p5.js constant
 *
 * @param cap - StrokeCap value ('round' | 'square' | 'butt')
 * @returns p5.js constant string (ROUND, SQUARE)
 *
 * @example
 * strokeCap(getStrokeCapConstant('round'))  // Uses ROUND
 */
export declare const getStrokeCapConstant: (cap: StrokeCap | undefined) => string;
/**
 * Convert strokeJoin string to p5.js constant
 *
 * @param join - StrokeJoin value ('miter' | 'bevel' | 'round')
 * @returns p5.js constant string (MITER, BEVEL, ROUND)
 *
 * @example
 * strokeJoin(getStrokeJoinConstant('miter'))  // Uses MITER
 */
export declare const getStrokeJoinConstant: (join: StrokeJoin | undefined) => string;
/**
 * Convert strokeCap string to Canvas API lineCap value
 *
 * @param cap - StrokeCap value ('round' | 'square' | 'butt')
 * @returns CanvasLineCap value
 *
 * @example
 * ctx.lineCap = getCanvasLineCap('round')
 */
export declare const getCanvasLineCap: (cap: StrokeCap | undefined) => CanvasLineCap;
/**
 * Convert strokeJoin string to Canvas API lineJoin value
 *
 * @param join - StrokeJoin value ('miter' | 'bevel' | 'round')
 * @returns CanvasLineJoin value
 *
 * @example
 * ctx.lineJoin = getCanvasLineJoin('miter')
 */
export declare const getCanvasLineJoin: (join: StrokeJoin | undefined) => CanvasLineJoin;
//# sourceMappingURL=stroke-style.d.ts.map