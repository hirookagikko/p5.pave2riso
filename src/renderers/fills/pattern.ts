/**
 * パターンFillレンダラー
 */

import type { PatternFillConfig } from '../../types/fill.js'
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js'
import { createInkDepth } from '../../utils/inkDepth.js'
import { applyFilters, applyEffects, ensurePTNAvailable } from '../../channels/operations.js'

/**
 * パターンFillをレンダリング
 *
 * @param fill - パターンFill設定
 * @param pipeline - GraphicsPipeline
 */
export const renderPatternFill = (
  fill: PatternFillConfig,
  pipeline: GraphicsPipeline
): void => {
  ensurePTNAvailable()

  const options = pipeline.getOptions()
  const { channels, filter, halftone, dither, mode } = options
  const path = options.path
  const gPos = pipeline.getPosition()
  const gSize = pipeline.getSize()

  // パターングラフィックスの作成
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const patG = pipeline.createGraphics(gSize[0] as number, gSize[1] as number)
  patG.background(255)
  patG.noStroke()
  patG.patternAngle(fill.patternAngle ?? 0)
  const patternFn = PTN[fill.PTN]
  if (!patternFn) {
    throw new Error(`Pattern '${fill.PTN}' not found in PTN object`)
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
  patG.pattern(patternFn(...fill.patternArgs))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  patG.rectPattern(0, 0, gSize[0] as number, gSize[1] as number)

  // フィルター適用
  const filteredPatG = applyFilters(patG, filter)

  // ベースグラフィックスにパターンを適用
  let baseG = pipeline.getBaseGraphics()
  pipeline.drawPathToCanvas(path, baseG.drawingContext)
  baseG.drawingContext.clip()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  baseG.image(filteredPatG, gPos[0] as number, gPos[1] as number)

  // エフェクト適用
  baseG = applyEffects(baseG, halftone, dither)
  pipeline.setBaseGraphics(baseG)

  // joinモードの場合は全チャンネルから削除
  if (mode === 'join') {
    channels.forEach((channel) => {
      channel.push()
      channel.blendMode(REMOVE)
      channel.image(baseG, 0, 0)
      channel.pop()
    })
  }

  // 各チャンネルに適用
  channels.forEach((channel, i) => {
    const channelVal = fill.channelVals?.[i]
    if (channelVal !== undefined && channelVal > 0) {
      channel.push()
      channel.fill(createInkDepth(channelVal))
      channel.image(baseG, 0, 0)
      channel.pop()
    }
  })
}
