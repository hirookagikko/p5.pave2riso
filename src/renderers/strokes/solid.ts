/**
 * ベタ塗りStrokeレンダラー
 *
 * Refactored to use applyEffectPipeline for consistent effect handling.
 */

import type { SolidStrokeConfig } from '../../types/stroke.js'
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js'
import { createInkDepth } from '../../utils/inkDepth.js'
import { mergeEffects } from '../../utils/effect-merge.js'
import { getStrokeCapConstant, getStrokeJoinConstant } from '../../utils/stroke-style.js'
import { applyEffectPipeline, hasEffects } from '../shared/effect-pipeline.js'

/**
 * ベタ塗りStrokeをレンダリング
 *
 * @param stroke - ベタ塗りStroke設定
 * @param pipeline - GraphicsPipeline
 */
export const renderSolidStroke = (
  stroke: SolidStrokeConfig,
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
    baseG.strokeCap(getStrokeCapConstant(stroke.strokeCap))
    baseG.strokeJoin(getStrokeJoinConstant(stroke.strokeJoin))
    pipeline.drawPathToCanvas(path, baseG.drawingContext)
    baseG.drawingContext.stroke()

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
        channel.strokeCap(getStrokeCapConstant(stroke.strokeCap))
        channel.strokeJoin(getStrokeJoinConstant(stroke.strokeJoin))
        pipeline.drawPathToCanvas(path, channel.drawingContext)
        channel.drawingContext.stroke()
        channel.pop()
      }
    })
  }
}
