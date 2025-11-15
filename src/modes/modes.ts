/**
 * レンダリングモード実装
 */

import type { RenderMode } from '../types/core.js'
import type { GraphicsPipeline } from '../graphics/GraphicsPipeline.js'
import { applyFilters, applyEffects } from '../channels/operations.js'

/**
 * レンダリングモードを適用
 *
 * @param mode - レンダリングモード
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
        // フィルター適用パス
        let cutoutG = pipeline.createGraphics(options.canvasSize[0], options.canvasSize[1])
        cutoutG.background(255)
        cutoutG.fill(0)
        cutoutG.noStroke()
        pipeline.drawPathToCanvas(path, cutoutG.drawingContext)
        cutoutG.drawingContext.fill()
        cutoutG = applyFilters(cutoutG, filter)
        cutoutG = applyEffects(cutoutG, halftone, dither)

        channels.forEach((channel) => {
          channel.push()
          channel.fill(255)
          channel.noStroke()
          channel.blendMode(REMOVE)
          channel.image(cutoutG, 0, 0)
          channel.blendMode(BLEND)
          channel.pop()
        })
      } else {
        // 通常のカットアウト
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
 * Stroke用のcutout/joinモード前処理
 *
 * @param mode - レンダリングモード
 * @param pipeline - GraphicsPipeline
 * @param strokeWeight - ストロークの太さ
 * @param dashArgs - 破線パターン（dashedの場合）
 * @param strokeCap - ストロークキャップ（dashedの場合）
 */
export const applyStrokeModePreprocess = (
  mode: RenderMode,
  pipeline: GraphicsPipeline,
  strokeWeight: number,
  dashArgs?: number[],
  strokeCap?: string
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

      if (dashArgs) {
        channel.drawingContext.setLineDash(dashArgs)
        if (strokeCap) {
          channel.drawingContext.lineCap = strokeCap as CanvasLineCap
        }
      }

      pipeline.drawPathToCanvas(path, channel.drawingContext)
      channel.drawingContext.stroke()
      channel.noErase()
      channel.pop()
    })
  }
}
