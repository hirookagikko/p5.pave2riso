/**
 * グラデーションFillレンダラー
 */

import type { GradientFillConfig, GradientDirection } from '../../types/fill.js'
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js'
import { createInkDepth } from '../../utils/inkDepth.js'
import { mergeEffects } from '../../utils/effect-merge.js'
import { applyEffectPipeline } from '../shared/effect-pipeline.js'
import { extractSize, extractPosition } from '../../utils/vec2-access.js'

/**
 * グラデーション方向から座標を計算
 *
 * @param direction - グラデーション方向
 * @param width - 幅
 * @param height - 高さ
 * @returns [x1, y1, x2, y2]
 */
const getGradientCoords = (
  direction: GradientDirection | undefined,
  width: number,
  height: number
): [number, number, number, number] => {
  switch (direction) {
    case 'TD':
      return [width / 2, 0, width / 2, height]
    case 'DT':
      return [width / 2, height, width / 2, 0]
    case 'LR':
      return [0, height / 2, width, height / 2]
    case 'RL':
      return [width, height / 2, 0, height / 2]
    case 'LTRB':
      return [0, 0, width, height]
    case 'RTLB':
      return [width, 0, 0, height]
    case 'LBRT':
      return [0, height, width, 0]
    case 'RBLT':
      return [width, height, 0, 0]
    default:
      return [0, 0, width, height]
  }
}

/**
 * グラデーションFillをレンダリング
 *
 * @param fill - グラデーションFill設定
 * @param pipeline - GraphicsPipeline
 */
export const renderGradientFill = (
  fill: GradientFillConfig,
  pipeline: GraphicsPipeline
): void => {
  const options = pipeline.getOptions()
  const { channels, mode } = options
  const path = options.path

  // トップレベルとfill内のエフェクトをマージ（fill内が優先）
  const { filter, halftone, dither } = mergeEffects(
    { filter: options.filter, halftone: options.halftone, dither: options.dither },
    { filter: fill.filter, halftone: fill.halftone, dither: fill.dither }
  )

  // Vec2ヘルパーで座標を抽出
  const { width: gSizeWidth, height: gSizeHeight } = extractSize(pipeline)
  const { x: gPosX, y: gPosY } = extractPosition(pipeline)

  if (!fill.colorStops) return

  fill.colorStops.forEach((colorStop) => {
    // チャンネルインデックスの検証
    if (colorStop.channel < 0 || colorStop.channel >= channels.length) {
      console.warn(`Invalid channel index: ${colorStop.channel}`)
      return
    }

    // グラデーショングラフィックスの作成
    const gradBaseG = pipeline.createGraphics(options.canvasSize[0], options.canvasSize[1])
    const gradG = pipeline.createGraphics(gSizeWidth, gSizeHeight)
    gradBaseG.background(255)
    gradG.noStroke()
    gradG.background(255)

    // グラデーションの作成
    let grad: CanvasGradient

    switch (fill.gradientType) {
      case 'linear': {
        const coords = getGradientCoords(fill.gradientDirection, gSizeWidth, gSizeHeight)
        grad = gradG.drawingContext.createLinearGradient(...coords)
        break
      }
      case 'radial': {
        const cx = gSizeWidth / 2
        const cy = gSizeHeight / 2
        const innerRadius = gSizeWidth * 0.1
        const outerRadius = gSizeWidth / 2
        grad = gradG.drawingContext.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius)
        break
      }
      case 'conic': {
        const cx = gSizeWidth / 2
        const cy = gSizeHeight / 2
        grad = gradG.drawingContext.createConicGradient(0, cx, cy)
        break
      }
    }

    // カラーストップの追加
    colorStop.stops.forEach((stop) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const c = color(
        255 - createInkDepth(stop.depth),
        255 - createInkDepth(stop.depth),
        255 - createInkDepth(stop.depth)
      )
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      grad.addColorStop(stop.position / 100, c.toString())
    })

    // グラデーションを描画
    gradG.drawingContext.fillStyle = grad
    gradG.rect(0, 0, gSizeWidth, gSizeHeight)

    // クリッピングとエフェクト適用
    gradBaseG.drawingContext.save()
    pipeline.drawPathToCanvas(path, gradBaseG.drawingContext)
    gradBaseG.drawingContext.clip()
    gradBaseG.image(gradG, gPosX, gPosY)
    gradBaseG.drawingContext.restore()

    // エフェクトパイプライン適用（フィルター → 対角線バッファ → halftone/dither）
    const { canvasSize } = options
    const { graphics: processedG, drawX, drawY } = applyEffectPipeline(
      gradBaseG, filter, halftone, dither, canvasSize, pipeline
    )

    // JOINモードの場合は全チャンネルから削除
    if (mode === 'join') {
      channels.forEach((channel) => {
        channel.push()
        channel.blendMode(REMOVE)
        channel.image(processedG, drawX, drawY)
        channel.pop()
      })
    }

    // チャンネルに適用
    const channel = channels[colorStop.channel]
    if (channel) {
      channel.push()
      channel.image(processedG, drawX, drawY)
      channel.pop()
    }
  })
}
