/**
 * JOIN Mode Handler Utility
 *
 * Consolidates the JOIN mode processing logic used across all fill and stroke renderers.
 * JOIN mode removes content from all channels by using blendMode(REMOVE) or erase().
 *
 * Two variants are provided:
 * 1. Graphics mode - uses processedG image with blendMode(REMOVE) for effect-processed content
 * 2. Direct mode - uses erase()/noErase() for direct path drawing (solid fill only)
 *
 * This eliminates duplicated JOIN mode code and fixes the missing blendMode reset bug.
 *
 * @module renderers/shared/join-handler
 */
/**
 * Handle JOIN mode processing
 *
 * Removes content from all channels using one of two methods:
 * - Graphics mode: Uses blendMode(REMOVE) with a processed graphics buffer
 * - Direct mode: Uses erase()/noErase() to draw path directly
 *
 * **Bug fix:** This implementation properly resets blendMode(BLEND) after REMOVE,
 * which was missing in pattern.ts, image.ts, and gradient.ts fill renderers.
 *
 * @param channels - Array of channel graphics to modify
 * @param config - JOIN mode configuration (graphics or direct)
 *
 * @example
 * ```typescript
 * // Graphics mode (with effects)
 * handleJoinMode(channels, {
 *   type: 'graphics',
 *   graphics: processedG,
 *   drawX: 0,
 *   drawY: 0
 * })
 *
 * // Direct mode (no effects, solid fill)
 * handleJoinMode(channels, {
 *   type: 'direct',
 *   pipeline: pipeline
 * })
 * ```
 */
export const handleJoinMode = (channels, config) => {
    if (config.type === 'graphics') {
        // Graphics mode: Remove using blendMode(REMOVE) with image
        channels.forEach((channel) => {
            channel.push();
            channel.blendMode(REMOVE);
            channel.image(config.graphics, config.drawX, config.drawY);
            channel.blendMode(BLEND); // FIX: Reset blend mode
            channel.pop();
        });
    }
    else {
        // Direct mode: Remove using erase() with direct path drawing
        const path = config.pipeline.getOptions().path;
        channels.forEach((channel) => {
            channel.push();
            channel.erase();
            channel.noStroke();
            config.pipeline.drawPathToCanvas(path, channel.drawingContext);
            channel.drawingContext.fill();
            channel.noErase();
            channel.pop();
        });
    }
};
//# sourceMappingURL=join-handler.js.map