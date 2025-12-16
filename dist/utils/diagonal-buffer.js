/**
 * Diagonal buffer calculation utilities
 *
 * When applying halftone/dither effects with rotation, use a diagonal-sized buffer
 * to prevent canvas clipping.
 */
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
export const calculateDiagonalBuffer = (canvasSize, halftone, dither) => {
    const usesDiagonalBuffer = !!(halftone ?? dither);
    if (!usesDiagonalBuffer) {
        return {
            usesDiagonalBuffer: false,
            diagonal: 0,
            offsetX: 0,
            offsetY: 0,
            bufferWidth: canvasSize[0],
            bufferHeight: canvasSize[1],
            drawX: 0,
            drawY: 0
        };
    }
    const diagonal = Math.ceil(Math.sqrt(canvasSize[0] ** 2 + canvasSize[1] ** 2));
    const offsetX = Math.floor((diagonal - canvasSize[0]) / 2);
    const offsetY = Math.floor((diagonal - canvasSize[1]) / 2);
    return {
        usesDiagonalBuffer: true,
        diagonal,
        offsetX,
        offsetY,
        bufferWidth: diagonal,
        bufferHeight: diagonal,
        drawX: -offsetX,
        drawY: -offsetY
    };
};
//# sourceMappingURL=diagonal-buffer.js.map