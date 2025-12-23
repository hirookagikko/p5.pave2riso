/**
 * Diagonal buffer calculation utilities
 *
 * When applying halftone/dither effects with rotation, use a diagonal-sized buffer
 * to prevent canvas clipping.
 */
import type { HalftoneConfig, DitherConfig } from '../types/effects.js';
/**
 * Diagonal buffer calculation result
 */
export interface DiagonalBufferConfig {
    /** Whether diagonal buffer is used */
    usesDiagonalBuffer: boolean;
    /** Diagonal size (0 if not used) */
    diagonal: number;
    /** X offset for centering */
    offsetX: number;
    /** Y offset for centering */
    offsetY: number;
    /** Buffer width (diagonal or canvasSize[0]) */
    bufferWidth: number;
    /** Buffer height (diagonal or canvasSize[1]) */
    bufferHeight: number;
    /** Draw X position (negative offset) */
    drawX: number;
    /** Draw Y position (negative offset) */
    drawY: number;
}
/**
 * Calculate diagonal buffer configuration
 *
 * Uses a diagonal-sized buffer when halftone/dither is enabled,
 * otherwise uses the canvas size directly.
 *
 * @param canvasSize - Canvas size [width, height]
 * @param halftone - Halftone configuration (null/undefined to disable)
 * @param dither - Dither configuration (null/undefined to disable)
 * @returns Diagonal buffer configuration
 *
 * @example
 * const config = calculateDiagonalBuffer(canvasSize, halftone, dither)
 * const buffer = pipeline.createGraphics(config.bufferWidth, config.bufferHeight)
 * // ... drawing operations ...
 * channel.image(buffer, config.drawX, config.drawY)
 */
export declare const calculateDiagonalBuffer: (canvasSize: [number, number], halftone: HalftoneConfig | null | undefined, dither: DitherConfig | null | undefined) => DiagonalBufferConfig;
//# sourceMappingURL=diagonal-buffer.d.ts.map