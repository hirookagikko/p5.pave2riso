/**
 * ベタ塗りStrokeレンダラー
 */

import type { SolidStrokeConfig } from '../../types/stroke.js'
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js'
import { createInkDepth } from '../../utils/inkDepth.js'
import { applyFilters, applyEffects } from '../../channels/operations.js'
import { mergeEffects } from '../../utils/effect-merge.js'
import { getStrokeCapConstant, getStrokeJoinConstant } from '../../utils/stroke-style.js'
import { calculateDiagonalBuffer } from '../../utils/diagonal-buffer.js'

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
  const hasEffects = filter ?? halftone ?? dither

  if (hasEffects) {
    // エフェクトあり: グラフィックスバッファ経由で処理

    // halftone/dither使用時は対角線サイズのバッファを使用（角度付き回転でのクリップ防止）
    const diag = calculateDiagonalBuffer(canvasSize, halftone, dither)

    // 黒ストロークで形状を描画（1回だけ作成）
    let strokeG = pipeline.createGraphics(diag.bufferWidth, diag.bufferHeight)
    strokeG.background(255)
    strokeG.noFill()
    strokeG.stroke(0)  // 黒でストローク
    strokeG.strokeWeight(stroke.strokeWeight)
    strokeG.strokeCap(getStrokeCapConstant(stroke.strokeCap))
    strokeG.strokeJoin(getStrokeJoinConstant(stroke.strokeJoin))
    // 対角線バッファ使用時はオフセットを適用
    if (diag.usesDiagonalBuffer) {
      strokeG.drawingContext.save()
      strokeG.drawingContext.translate(diag.offsetX, diag.offsetY)
    }
    pipeline.drawPathToCanvas(path, strokeG.drawingContext)
    strokeG.drawingContext.stroke()
    if (diag.usesDiagonalBuffer) {
      strokeG.drawingContext.restore()
    }

    // フィルター適用
    strokeG = applyFilters(strokeG, filter)

    // ハーフトーン/ディザー適用
    strokeG = applyEffects(strokeG, halftone, dither)

    // 各チャンネルに転送（対角線バッファ使用時は負のオフセットで描画）
    channels.forEach((channel, i) => {
      const channelVal = stroke.channelVals[i]
      if (channelVal !== undefined && channelVal > 0) {
        channel.push()
        channel.fill(createInkDepth(channelVal))
        channel.image(strokeG, diag.drawX, diag.drawY)
        channel.pop()
      }
    })
  } else {
    // エフェクトなし: 直接描画（従来の処理）
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
