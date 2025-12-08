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
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js';
/**
 * JOIN mode configuration for graphics-based removal
 *
 * Used when content has been processed into a p5.Graphics buffer
 * (e.g., with effects, patterns, gradients, images)
 */
export interface JoinModeGraphicsConfig {
    /** Discriminator for type safety */
    type: 'graphics';
    /** Processed graphics to remove from all channels */
    graphics: p5.Graphics;
    /** X coordinate for drawing */
    drawX: number;
    /** Y coordinate for drawing */
    drawY: number;
}
/**
 * JOIN mode configuration for direct path drawing removal
 *
 * Used when content can be drawn directly without intermediate buffer
 * (e.g., solid fill without effects)
 */
export interface JoinModeDirectConfig {
    /** Discriminator for type safety */
    type: 'direct';
    /** GraphicsPipeline for path drawing utilities */
    pipeline: GraphicsPipeline;
}
/**
 * JOIN mode configuration union type
 */
export type JoinModeConfig = JoinModeGraphicsConfig | JoinModeDirectConfig;
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
export declare const handleJoinMode: (channels: p5.Graphics[], config: JoinModeConfig) => void;
//# sourceMappingURL=join-handler.d.ts.map