/**
 * Rendering mode implementation
 *
 * This module handles different rendering modes for Risograph printing:
 * - **overprint**: All colors print on top of each other (default)
 * - **cutout**: The shape is erased from all channels before rendering
 * - **join**: Similar to cutout, but with edge blending
 *
 * @module modes/modes
 */

import type { RenderMode } from '../types/core.js'
import type { GraphicsPipeline } from '../graphics/GraphicsPipeline.js'
import { applyFilters, applyEffects } from '../channels/operations.js'

/**
 * Applies rendering mode
 *
 * This function applies pre-processing based on the render mode.
 * It does NOT handle the actual fill/stroke rendering - that is done
 * by the respective renderers. This function only handles:
 *
 * 1. **overprint**: No pre-processing (colors layer on top)
 * 2. **cutout**: Erases the path shape from all channels
 *    - If filters are specified, applies them to the cutout mask
 *    - Uses REMOVE blend mode to erase the filtered shape
 * 3. **join**: Pre-processing is handled in fill/stroke renderers
 *
 * @param mode - Rendering mode
 * @param pipeline - GraphicsPipeline
 */
export const applyMode = (mode: RenderMode, pipeline: GraphicsPipeline): void => {
  const options = pipeline.getOptions()
  const { channels, filter, halftone, dither } = options
  const path = options.path

  switch (mode) {
    case 'overprint':
      // overprintモードでは何もしない（デフォルト動作）
      break

    case 'cutout': {
      if (filter) {
        // Filter-aware cutout path:
        // 1. Create a mask buffer with the path filled in black on white
        // 2. Apply filters (posterize, blur, etc.) to the mask
        // 3. Apply halftone/dither effects if specified
        // 4. Use REMOVE blend mode to erase the filtered mask from all channels
        //
        // This allows for soft-edged cutouts when using blur filters,
        // or patterned cutouts when using halftone/dither effects.
        let cutoutG = pipeline.createGraphics(options.canvasSize[0], options.canvasSize[1])
        cutoutG.background(255)
        cutoutG.fill(0)
        cutoutG.noStroke()
        pipeline.drawPathToCanvas(path, cutoutG.drawingContext)
        cutoutG.drawingContext.fill()

        // Apply filter chain: filters first, then effects
        // This order ensures filters modify the base mask before
        // halftone/dither patterns are applied
        cutoutG = applyFilters(cutoutG, filter)
        cutoutG = applyEffects(cutoutG, halftone, dither)

        channels.forEach((channel) => {
          channel.push()
          channel.fill(255)
          channel.noStroke()
          // REMOVE blend mode: dark areas in cutoutG erase the channel
          channel.blendMode(REMOVE)
          channel.image(cutoutG, 0, 0)
          channel.blendMode(BLEND)
          channel.pop()
        })
      } else {
        // Simple cutout: directly erase the path shape from all channels
        // Uses p5.js erase() mode for clean, hard-edged cutouts
        channels.forEach((channel) => {
          channel.push()
          channel.fill(255)
          channel.erase()
          channel.noStroke()
          pipeline.drawPathToCanvas(path, channel.drawingContext)
          channel.drawingContext.fill()
          channel.noErase()
          channel.pop()
        })
      }
      break
    }

    case 'join':
      // joinモードはfill/strokeレンダラー内で処理される
      break

    default: {
      // Exhaustive check: この行が実行されることは型システム上あり得ない
      const _exhaustiveCheck: never = mode
      console.warn(`Unknown mode: ${String(_exhaustiveCheck)}. Using overprint.`)
      break
    }
  }
}

/**
 * Pre-processing for cutout/join mode on strokes
 *
 * @param mode - Rendering mode
 * @param pipeline - GraphicsPipeline
 * @param strokeWeight - Stroke weight
 * @param dashArgs - Dash pattern (for dashed strokes)
 * @param strokeCap - Stroke cap style
 * @param strokeJoin - Stroke join style
 */
export const applyStrokeModePreprocess = (
  mode: RenderMode,
  pipeline: GraphicsPipeline,
  strokeWeight: number,
  dashArgs?: number[],
  strokeCap?: string,
  strokeJoin?: string
): void => {
  if (mode === 'cutout' || mode === 'join') {
    const options = pipeline.getOptions()
    const { channels } = options
    const path = options.path

    channels.forEach((channel) => {
      channel.push()
      channel.erase()
      channel.noFill()
      channel.stroke(255)
      channel.strokeWeight(strokeWeight)

      // strokeCapとstrokeJoinを適用
      if (strokeCap) {
        channel.strokeCap(strokeCap)
      }
      if (strokeJoin) {
        channel.strokeJoin(strokeJoin)
      }

      // 破線の場合はCanvas APIで設定
      if (dashArgs) {
        channel.drawingContext.setLineDash(dashArgs)
        if (strokeCap) {
          channel.drawingContext.lineCap = strokeCap as CanvasLineCap
        }
        if (strokeJoin) {
          channel.drawingContext.lineJoin = strokeJoin as CanvasLineJoin
        }
      }

      pipeline.drawPathToCanvas(path, channel.drawingContext)
      channel.drawingContext.stroke()
      channel.noErase()
      channel.pop()
    })
  }
}
