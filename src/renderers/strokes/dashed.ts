/**
 * 破線Strokeレンダラー
 *
 * Refactored to use applyEffectPipeline for consistent effect handling.
 */

import type { DashedStrokeConfig } from '../../types/stroke.js'
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js'
import { createInkDepth } from '../../utils/inkDepth.js'
import { mergeEffects } from '../../utils/effect-merge.js'
import { getCanvasLineCap, getCanvasLineJoin } from '../../utils/stroke-style.js'
import { applyEffectPipeline, hasEffects } from '../shared/effect-pipeline.js'

/**
 * 破線Strokeをレンダリング
 *
 * @param stroke - 破線Stroke設定
 * @param pipeline - GraphicsPipeline
 */
export const renderDashedStroke = (
  stroke: DashedStrokeConfig,
  pipeline: GraphicsPipeline
): void => {
  const options = pipeline.getOptions()
  const { channels, canvasSize } = options
  const path = options.path

  // トップレベルとstroke内のエフェクトをマージ（stroke内が優先）
  const { filter, halftone, dither } = mergeEffects(
    { filter: options.filter, halftone: options.halftone, dither: options.dither },
    { filter: stroke.filter, halftone: stroke.halftone, dither: stroke.dither }
  )

  // エフェクトが指定されているかチェック
  const effectsPresent = hasEffects(filter, halftone, dither)

  if (effectsPresent) {
    // エフェクトあり: グラフィックスバッファ経由で処理
    const baseG = pipeline.createGraphics(canvasSize[0], canvasSize[1])
    baseG.background(255)
    baseG.noFill()
    baseG.stroke(0)
    baseG.strokeWeight(stroke.strokeWeight)
    baseG.drawingContext.setLineDash(stroke.dashArgs)
    baseG.drawingContext.lineCap = getCanvasLineCap(stroke.strokeCap)
    baseG.drawingContext.lineJoin = getCanvasLineJoin(stroke.strokeJoin)
    pipeline.drawPathToCanvas(path, baseG.drawingContext)
    baseG.drawingContext.stroke()
    baseG.drawingContext.setLineDash([])

    // エフェクトパイプライン適用
    const { graphics: processedG, drawX, drawY } = applyEffectPipeline(
      baseG, filter, halftone, dither, canvasSize, pipeline
    )

    // 各チャンネルに転送
    channels.forEach((channel, i) => {
      const channelVal = stroke.channelVals[i]
      if (channelVal !== undefined && channelVal > 0) {
        channel.push()
        channel.fill(createInkDepth(channelVal))
        channel.image(processedG, drawX, drawY)
        channel.pop()
      }
    })
  } else {
    // エフェクトなし: 直接描画
    channels.forEach((channel, i) => {
      const channelVal = stroke.channelVals[i]
      if (channelVal !== undefined && channelVal > 0) {
        channel.push()
        channel.stroke(createInkDepth(channelVal))
        channel.strokeWeight(stroke.strokeWeight)
        channel.drawingContext.setLineDash(stroke.dashArgs)
        channel.drawingContext.lineCap = getCanvasLineCap(stroke.strokeCap)
        channel.drawingContext.lineJoin = getCanvasLineJoin(stroke.strokeJoin)
        pipeline.drawPathToCanvas(path, channel.drawingContext)
        channel.drawingContext.stroke()
        channel.drawingContext.setLineDash([])
        channel.pop()
      }
    })
  }
}
