/**
 * 破線Strokeレンダラー
 */

import type { DashedStrokeConfig, StrokeJoin, StrokeCap } from '../../types/stroke.js'
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js'
import { createInkDepth } from '../../utils/inkDepth.js'
import { applyFilters, applyEffects } from '../../channels/operations.js'

/**
 * strokeCap文字列をCanvas API用の値に変換
 */
const getCanvasLineCap = (cap: StrokeCap | undefined): CanvasLineCap => {
  switch (cap) {
    case 'round':
      return 'round'
    case 'square':
      return 'square'
    case 'butt':
      return 'butt'
    default:
      return 'round'  // デフォルトはround
  }
}

/**
 * strokeJoin文字列をCanvas API用の値に変換
 */
const getCanvasLineJoin = (join: StrokeJoin | undefined): CanvasLineJoin => {
  switch (join) {
    case 'miter':
      return 'miter'
    case 'bevel':
      return 'bevel'
    case 'round':
      return 'round'
    default:
      return 'miter'  // デフォルトはmiter
  }
}

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

  // エフェクトが指定されているかチェック
  const hasEffects = stroke.filter || stroke.halftone || stroke.dither

  if (hasEffects) {
    // エフェクトあり: グラフィックスバッファ経由で処理

    // halftone/dither使用時は対角線サイズのバッファを使用（角度付き回転でのクリップ防止）
    const usesDiagonalBuffer = stroke.halftone || stroke.dither
    const diagonal = Math.ceil(Math.sqrt(canvasSize[0] ** 2 + canvasSize[1] ** 2))
    const bufferSize = usesDiagonalBuffer ? diagonal : canvasSize[0]
    const bufferHeight = usesDiagonalBuffer ? diagonal : canvasSize[1]
    const offsetX = usesDiagonalBuffer ? Math.floor((diagonal - canvasSize[0]) / 2) : 0
    const offsetY = usesDiagonalBuffer ? Math.floor((diagonal - canvasSize[1]) / 2) : 0

    // 黒ストロークで形状を描画（1回だけ作成）
    let strokeG = pipeline.createGraphics(bufferSize, bufferHeight)
    strokeG.background(255)
    strokeG.noFill()
    strokeG.stroke(0)  // 黒でストローク
    strokeG.strokeWeight(stroke.strokeWeight)
    strokeG.drawingContext.setLineDash(stroke.dashArgs)
    strokeG.drawingContext.lineCap = getCanvasLineCap(stroke.strokeCap)
    strokeG.drawingContext.lineJoin = getCanvasLineJoin(stroke.strokeJoin)
    // 対角線バッファ使用時はオフセットを適用
    if (usesDiagonalBuffer) {
      strokeG.drawingContext.save()
      strokeG.drawingContext.translate(offsetX, offsetY)
    }
    pipeline.drawPathToCanvas(path, strokeG.drawingContext)
    strokeG.drawingContext.stroke()
    strokeG.drawingContext.setLineDash([])  // リセット
    if (usesDiagonalBuffer) {
      strokeG.drawingContext.restore()
    }

    // フィルター適用
    strokeG = applyFilters(strokeG, stroke.filter)

    // ハーフトーン/ディザー適用
    strokeG = applyEffects(strokeG, stroke.halftone, stroke.dither)

    // 各チャンネルに転送（対角線バッファ使用時は負のオフセットで描画）
    const drawX = usesDiagonalBuffer ? -offsetX : 0
    const drawY = usesDiagonalBuffer ? -offsetY : 0
    channels.forEach((channel, i) => {
      const channelVal = stroke.channelVals[i]
      if (channelVal !== undefined && channelVal > 0) {
        channel.push()
        channel.fill(createInkDepth(channelVal))
        channel.image(strokeG, drawX, drawY)
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
        channel.drawingContext.setLineDash(stroke.dashArgs)
        channel.drawingContext.lineCap = getCanvasLineCap(stroke.strokeCap)
        channel.drawingContext.lineJoin = getCanvasLineJoin(stroke.strokeJoin)
        pipeline.drawPathToCanvas(path, channel.drawingContext)
        channel.drawingContext.stroke()
        channel.drawingContext.setLineDash([])  // リセット
        channel.pop()
      }
    })
  }
}
