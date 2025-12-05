/**
 * ベタ塗りFillレンダラー
 *
 * Refactored to eliminate code duplication between JOIN mode and normal mode
 * by extracting common patterns into helper functions.
 */

import type { SolidFillConfig } from '../../types/fill.js'
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js'
import { createInkDepth } from '../../utils/inkDepth.js'
import { mergeEffects } from '../../utils/effect-merge.js'
import { applyEffectPipeline, hasEffects } from '../shared/effect-pipeline.js'

/**
 * JOINモードでチャンネルから削除（エフェクトあり）
 */
const applyJoinModeWithGraphics = (
  channels: p5.Graphics[],
  processedG: p5.Graphics,
  drawX: number,
  drawY: number
): void => {
  channels.forEach((channel) => {
    channel.push()
    channel.blendMode(REMOVE)
    channel.image(processedG, drawX, drawY)
    channel.blendMode(BLEND)
    channel.pop()
  })
}

/**
 * JOINモードでチャンネルから削除（直接描画）
 */
const applyJoinModeDirect = (
  channels: p5.Graphics[],
  pipeline: GraphicsPipeline
): void => {
  const path = pipeline.getOptions().path
  channels.forEach((channel) => {
    channel.push()
    channel.erase()
    channel.noStroke()
    pipeline.drawPathToCanvas(path, channel.drawingContext)
    channel.drawingContext.fill()
    channel.noErase()
    channel.pop()
  })
}

/**
 * チャンネルにインクを適用（エフェクトあり）
 */
const applyToChannelsWithGraphics = (
  channels: p5.Graphics[],
  channelVals: number[],
  processedG: p5.Graphics,
  drawX: number,
  drawY: number
): void => {
  channels.forEach((channel, i) => {
    const channelVal = channelVals[i]
    if (channelVal !== undefined && channelVal > 0) {
      channel.push()
      channel.fill(createInkDepth(channelVal))
      channel.image(processedG, drawX, drawY)
      channel.pop()
    }
  })
}

/**
 * チャンネルにインクを適用（直接描画）
 */
const applyToChannelsDirect = (
  channels: p5.Graphics[],
  channelVals: number[],
  pipeline: GraphicsPipeline
): void => {
  const path = pipeline.getOptions().path
  channels.forEach((channel, i) => {
    const channelVal = channelVals[i]
    if (channelVal !== undefined && channelVal > 0) {
      channel.push()
      channel.fill(createInkDepth(channelVal))
      channel.noStroke()
      pipeline.drawPathToCanvas(path, channel.drawingContext)
      channel.drawingContext.fill()
      channel.pop()
    }
  })
}

/**
 * ベタ塗りFillをレンダリング
 *
 * @param fill - ベタ塗りFill設定
 * @param pipeline - GraphicsPipeline
 */
export const renderSolidFill = (
  fill: SolidFillConfig,
  pipeline: GraphicsPipeline
): void => {
  const options = pipeline.getOptions()
  const { channels, mode, canvasSize } = options
  const path = options.path

  // トップレベルとfill内のエフェクトをマージ（fill内が優先）
  const { filter, halftone, dither } = mergeEffects(
    { filter: options.filter, halftone: options.halftone, dither: options.dither },
    { filter: fill.filter, halftone: fill.halftone, dither: fill.dither }
  )

  // エフェクトが指定されているかチェック
  const effectsPresent = hasEffects(filter, halftone, dither)

  if (effectsPresent) {
    // エフェクトあり: グラフィックスバッファ経由で処理
    const baseG = pipeline.createGraphics(canvasSize[0], canvasSize[1])
    baseG.background(255)
    baseG.noStroke()
    baseG.fill(0)
    pipeline.drawPathToCanvas(path, baseG.drawingContext)
    baseG.drawingContext.fill()

    // エフェクトパイプライン適用
    const { graphics: processedG, drawX, drawY } = applyEffectPipeline(
      baseG, filter, halftone, dither, canvasSize, pipeline
    )

    // JOINモード処理
    if (mode === 'join') {
      applyJoinModeWithGraphics(channels, processedG, drawX, drawY)
    }

    // 各チャンネルに適用
    applyToChannelsWithGraphics(channels, fill.channelVals, processedG, drawX, drawY)
  } else {
    // エフェクトなし: 直接描画

    // JOINモード処理
    if (mode === 'join') {
      applyJoinModeDirect(channels, pipeline)
    }

    // 各チャンネルに適用
    applyToChannelsDirect(channels, fill.channelVals, pipeline)
  }
}
