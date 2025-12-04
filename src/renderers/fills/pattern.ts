/**
 * パターンFillレンダラー
 */

import type { PatternFillConfig } from '../../types/fill.js'
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js'
import { createInkDepth } from '../../utils/inkDepth.js'
import { applyFilters, applyEffects, ensurePTNAvailable } from '../../channels/operations.js'
import { degreesToRadians } from '../../utils/angleConverter.js'
import { mergeEffects } from '../../utils/effect-merge.js'

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
  const { channels, mode } = options
  const path = options.path

  // トップレベルとfill内のエフェクトをマージ（fill内が優先）
  const { filter, halftone, dither } = mergeEffects(
    { filter: options.filter, halftone: options.halftone, dither: options.dither },
    { filter: fill.filter, halftone: fill.halftone, dither: fill.dither }
  )
  // Vec2 array index access - external library interface (linearly)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const gPos = pipeline.getPosition()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const gSize = pipeline.getSize()

  // Vec2 array index access - external library interface (linearly)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const gSizeWidth = gSize[0]
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const gSizeHeight = gSize[1]
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const gPosX = gPos[0]
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const gPosY = gPos[1]

  // パターングラフィックスの作成
  const patG = pipeline.createGraphics(gSizeWidth, gSizeHeight)
  patG.background(255)
  patG.noStroke()
  // patternAngleは度数法で指定されているのでラジアンに変換
  patG.patternAngle(degreesToRadians(fill.patternAngle ?? 0))
  const patternFn = PTN[fill.PTN]
  if (!patternFn) {
    throw new Error(`Pattern '${fill.PTN}' not found in PTN object`)
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
  patG.pattern(patternFn(...fill.patternArgs))
  patG.rectPattern(0, 0, gSizeWidth, gSizeHeight)

  // ベースグラフィックスにパターンを適用（クリップ後にfilter適用するためここではfilterなし）
  let baseG = pipeline.getBaseGraphics()
  baseG.drawingContext.save()
  pipeline.drawPathToCanvas(path, baseG.drawingContext)
  baseG.drawingContext.clip()
  baseG.image(patG, gPosX, gPosY)
  baseG.drawingContext.restore()

  // フィルター適用（クリップ後の結果に対して適用することでblurが境界を超えて広がる）
  baseG = applyFilters(baseG, filter)

  // エフェクト適用
  // halftone/dither使用時は対角線サイズのバッファを使用（角度付き回転でのクリップ防止）
  let drawX = 0
  let drawY = 0
  if (halftone || dither) {
    const { canvasSize } = options
    const diagonal = Math.ceil(Math.sqrt(canvasSize[0] ** 2 + canvasSize[1] ** 2))
    const offsetX = Math.floor((diagonal - canvasSize[0]) / 2)
    const offsetY = Math.floor((diagonal - canvasSize[1]) / 2)
    const fullG = pipeline.createGraphics(diagonal, diagonal)
    fullG.background(255)
    fullG.image(baseG, offsetX, offsetY)
    baseG = applyEffects(fullG, halftone, dither)
    drawX = -offsetX
    drawY = -offsetY
  }
  pipeline.setBaseGraphics(baseG)

  // joinモードの場合は全チャンネルから削除
  if (mode === 'join') {
    channels.forEach((channel) => {
      channel.push()
      channel.blendMode(REMOVE)
      channel.image(baseG, drawX, drawY)
      channel.pop()
    })
  }

  // 各チャンネルに適用
  channels.forEach((channel, i) => {
    const channelVal = fill.channelVals?.[i]
    if (channelVal !== undefined && channelVal > 0) {
      channel.push()
      channel.fill(createInkDepth(channelVal))
      channel.image(baseG, drawX, drawY)
      channel.pop()
    }
  })
}
