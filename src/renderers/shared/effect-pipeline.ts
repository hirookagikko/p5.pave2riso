/**
 * Effect Pipeline Utility
 *
 * Consolidates the common effect application pattern used across all renderers:
 * 1. Apply filters (posterize, blur, etc.)
 * 2. Create diagonal buffer if halftone/dither is used (prevents clipping during rotation)
 * 3. Apply halftone/dither effects
 *
 * This eliminates ~200 lines of duplicated code across 8 renderer files.
 *
 * @module renderers/shared/effect-pipeline
 */

import type { FilterConfig, HalftoneConfig, DitherConfig } from '../../types/effects.js'
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js'
import { applyFilters, applyEffects } from '../../channels/operations.js'
import { calculateDiagonalBuffer, type DiagonalBufferConfig } from '../../utils/diagonal-buffer.js'

/**
 * Effect pipeline result
 */
export interface EffectPipelineResult {
  /** The processed graphics with filters and effects applied */
  graphics: p5.Graphics
  /** X coordinate for drawing (may be negative offset for diagonal buffer) */
  drawX: number
  /** Y coordinate for drawing (may be negative offset for diagonal buffer) */
  drawY: number
  /** Diagonal buffer configuration (for advanced use cases) */
  diag: DiagonalBufferConfig
}

/**
 * Apply the complete effect pipeline to a graphics object
 *
 * This function handles the common pattern of:
 * 1. Applying filters (posterize, blur, threshold, etc.)
 * 2. Creating a diagonal buffer if halftone/dither effects are used
 *    (necessary because halftoneImage rotates the canvas and may clip content)
 * 3. Applying halftone/dither effects
 *
 * @param baseG - Base graphics with content already drawn
 * @param filter - Filter configuration (or null/undefined)
 * @param halftone - Halftone configuration (or null/undefined)
 * @param dither - Dither configuration (or null/undefined)
 * @param canvasSize - Canvas dimensions [width, height]
 * @param pipeline - GraphicsPipeline for creating graphics objects
 * @returns Processed graphics and draw coordinates
 *
 * @example
 * ```typescript
 * // Create base graphics with content
 * const baseG = pipeline.createGraphics(width, height)
 * baseG.background(255)
 * // ... draw content ...
 *
 * // Apply effects
 * const { graphics, drawX, drawY } = applyEffectPipeline(
 *   baseG, filter, halftone, dither, canvasSize, pipeline
 * )
 *
 * // Draw to channel
 * channel.image(graphics, drawX, drawY)
 * ```
 */
export const applyEffectPipeline = (
  baseG: p5.Graphics,
  filter: FilterConfig | FilterConfig[] | null | undefined,
  halftone: HalftoneConfig | null | undefined,
  dither: DitherConfig | null | undefined,
  canvasSize: [number, number],
  pipeline: GraphicsPipeline
): EffectPipelineResult => {
  // Calculate diagonal buffer settings
  const diag = calculateDiagonalBuffer(canvasSize, halftone, dither)

  // Apply filters first
  let processedG = applyFilters(baseG, filter)

  // Apply halftone/dither with diagonal buffer if needed
  let drawX = 0
  let drawY = 0

  if (diag.usesDiagonalBuffer) {
    // Create diagonal-sized buffer to prevent clipping during rotation
    const fullG = pipeline.createGraphics(diag.diagonal, diag.diagonal)
    fullG.background(255)
    fullG.image(processedG, diag.offsetX, diag.offsetY)
    processedG = applyEffects(fullG, halftone, dither)
    drawX = diag.drawX
    drawY = diag.drawY
  }

  return {
    graphics: processedG,
    drawX,
    drawY,
    diag
  }
}

/**
 * Apply the effect pipeline with custom base position
 *
 * Used when the content is drawn at an offset position (e.g., stroke renderers
 * that draw content at gPosX, gPosY instead of 0, 0).
 *
 * @param baseG - Base graphics with content already drawn
 * @param filter - Filter configuration (or null/undefined)
 * @param halftone - Halftone configuration (or null/undefined)
 * @param dither - Dither configuration (or null/undefined)
 * @param canvasSize - Canvas dimensions [width, height]
 * @param pipeline - GraphicsPipeline for creating graphics objects
 * @param baseX - X position where content was drawn in baseG
 * @param baseY - Y position where content was drawn in baseG
 * @returns Processed graphics and draw coordinates
 *
 * @example
 * ```typescript
 * // For stroke renderers that draw at gPosX, gPosY
 * const { graphics, drawX, drawY } = applyEffectPipelineWithOffset(
 *   gradG, filter, halftone, dither, canvasSize, pipeline, gPosX, gPosY
 * )
 * ```
 */
export const applyEffectPipelineWithOffset = (
  baseG: p5.Graphics,
  filter: FilterConfig | FilterConfig[] | null | undefined,
  halftone: HalftoneConfig | null | undefined,
  dither: DitherConfig | null | undefined,
  canvasSize: [number, number],
  pipeline: GraphicsPipeline,
  baseX: number,
  baseY: number
): EffectPipelineResult => {
  // Calculate diagonal buffer settings
  const diag = calculateDiagonalBuffer(canvasSize, halftone, dither)

  // Apply filters first
  let processedG = applyFilters(baseG, filter)

  // Default draw position is the base position
  let drawX = baseX
  let drawY = baseY

  if (diag.usesDiagonalBuffer) {
    // Create diagonal-sized buffer with content at offset position
    const fullG = pipeline.createGraphics(diag.diagonal, diag.diagonal)
    fullG.background(255)
    fullG.image(processedG, baseX + diag.offsetX, baseY + diag.offsetY)
    processedG = applyEffects(fullG, halftone, dither)
    drawX = diag.drawX
    drawY = diag.drawY
  }

  return {
    graphics: processedG,
    drawX,
    drawY,
    diag
  }
}

/**
 * Check if any effects are specified
 *
 * Useful for renderers that have different code paths for
 * effects vs no-effects scenarios.
 *
 * @param filter - Filter configuration
 * @param halftone - Halftone configuration
 * @param dither - Dither configuration
 * @returns true if any effect is specified
 */
export const hasEffects = (
  filter: FilterConfig | FilterConfig[] | null | undefined,
  halftone: HalftoneConfig | null | undefined,
  dither: DitherConfig | null | undefined
): boolean => {
  return !!(filter ?? halftone ?? dither)
}
