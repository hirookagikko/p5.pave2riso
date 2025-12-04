/**
 * ベタ塗りFillレンダラー
 */

import type { SolidFillConfig } from '../../types/fill.js'
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js'
import { createInkDepth } from '../../utils/inkDepth.js'
import { applyFilters, applyEffects } from '../../channels/operations.js'
import { mergeEffects } from '../../utils/effect-merge.js'

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
  const { channels, mode } = options
  const path = options.path

  // トップレベルとfill内のエフェクトをマージ（fill内が優先）
  const { filter, halftone, dither } = mergeEffects(
    { filter: options.filter, halftone: options.halftone, dither: options.dither },
    { filter: fill.filter, halftone: fill.halftone, dither: fill.dither }
  )

  // halftone/dither使用時の対角線バッファ計算（角度付き回転でのクリップ防止）
  const { canvasSize } = options
  const usesDiagonalBuffer = halftone || dither
  const diagonal = usesDiagonalBuffer ? Math.ceil(Math.sqrt(canvasSize[0] ** 2 + canvasSize[1] ** 2)) : 0
  const diagonalOffsetX = usesDiagonalBuffer ? Math.floor((diagonal - canvasSize[0]) / 2) : 0
  const diagonalOffsetY = usesDiagonalBuffer ? Math.floor((diagonal - canvasSize[1]) / 2) : 0

  // JOINモードの場合は全チャンネルから削除
  if (mode === 'join') {
    if (filter) {
      // フィルター適用パス
      let eraseG = pipeline.createGraphics(canvasSize[0], canvasSize[1])
      eraseG.background(255)
      eraseG.fill(0)
      eraseG.noStroke()
      pipeline.drawPathToCanvas(path, eraseG.drawingContext)
      eraseG.drawingContext.fill()
      eraseG = applyFilters(eraseG, filter)

      // halftone/dither使用時は対角線バッファを使用
      let drawX = 0
      let drawY = 0
      if (usesDiagonalBuffer) {
        const fullG = pipeline.createGraphics(diagonal, diagonal)
        fullG.background(255)
        fullG.image(eraseG, diagonalOffsetX, diagonalOffsetY)
        eraseG = applyEffects(fullG, halftone, dither)
        drawX = -diagonalOffsetX
        drawY = -diagonalOffsetY
      }

      channels.forEach((channel) => {
        channel.push()
        channel.fill(255)
        channel.noStroke()
        channel.blendMode(REMOVE)
        channel.image(eraseG, drawX, drawY)
        channel.blendMode(BLEND)
        channel.pop()
      })
    } else if (halftone && typeof window.halftoneImage === 'function') {
      // ハーフトーン適用パス - 対角線バッファを使用
      const eraseG = pipeline.createGraphics(diagonal, diagonal)
      eraseG.push()
      eraseG.background(255)
      eraseG.noStroke()
      eraseG.fill(0)
      eraseG.drawingContext.save()
      eraseG.drawingContext.translate(diagonalOffsetX, diagonalOffsetY)
      pipeline.drawPathToCanvas(path, eraseG.drawingContext)
      eraseG.drawingContext.fill()
      eraseG.drawingContext.restore()
      eraseG.pop()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const halftoned = window.halftoneImage(eraseG, ...halftone.halftoneArgs)

      channels.forEach((channel) => {
        channel.push()
        channel.blendMode(REMOVE)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        channel.image(halftoned, -diagonalOffsetX, -diagonalOffsetY)
        channel.blendMode(BLEND)
        channel.pop()
      })
    } else if (dither && typeof window.ditherImage === 'function') {
      // ディザー適用パス - 対角線バッファを使用
      const eraseG = pipeline.createGraphics(diagonal, diagonal)
      eraseG.push()
      eraseG.background(255)
      eraseG.noStroke()
      eraseG.fill(0)
      eraseG.drawingContext.save()
      eraseG.drawingContext.translate(diagonalOffsetX, diagonalOffsetY)
      pipeline.drawPathToCanvas(path, eraseG.drawingContext)
      eraseG.drawingContext.fill()
      eraseG.drawingContext.restore()
      eraseG.pop()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const dithered = window.ditherImage(eraseG, ...dither.ditherArgs)

      channels.forEach((channel) => {
        channel.push()
        channel.blendMode(REMOVE)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        channel.image(dithered, -diagonalOffsetX, -diagonalOffsetY)
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
  }

  if (filter) {
    // フィルター適用パス
    let baseG = pipeline.getBaseGraphics()
    baseG.push()
    baseG.noStroke()
    baseG.fill(0)
    pipeline.drawPathToCanvas(path, baseG.drawingContext)
    baseG.drawingContext.fill()
    baseG.pop()
    baseG = applyFilters(baseG, filter)

    // halftone/dither使用時は対角線バッファを使用
    let drawX = 0
    let drawY = 0
    if (usesDiagonalBuffer) {
      const fullG = pipeline.createGraphics(diagonal, diagonal)
      fullG.background(255)
      fullG.image(baseG, diagonalOffsetX, diagonalOffsetY)
      baseG = applyEffects(fullG, halftone, dither)
      drawX = -diagonalOffsetX
      drawY = -diagonalOffsetY
    }
    pipeline.setBaseGraphics(baseG)

    channels.forEach((channel, i) => {
      const channelVal = fill.channelVals[i]
      if (channelVal !== undefined && channelVal > 0) {
        channel.push()
        channel.fill(createInkDepth(channelVal))
        channel.image(baseG, drawX, drawY)
        channel.pop()
      }
    })
  } else if (halftone && typeof window.halftoneImage === 'function') {
    // ハーフトーン専用パス - 対角線バッファを使用
    const solidG = pipeline.createGraphics(diagonal, diagonal)
    solidG.push()
    solidG.background(255)
    solidG.noStroke()
    solidG.fill(0)
    solidG.drawingContext.save()
    solidG.drawingContext.translate(diagonalOffsetX, diagonalOffsetY)
    pipeline.drawPathToCanvas(path, solidG.drawingContext)
    solidG.drawingContext.fill()
    solidG.drawingContext.restore()
    solidG.pop()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const halftoned = window.halftoneImage(solidG, ...halftone.halftoneArgs)

    channels.forEach((channel, i) => {
      const channelVal = fill.channelVals[i]
      if (channelVal !== undefined && channelVal > 0) {
        channel.push()
        channel.fill(createInkDepth(channelVal))
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        channel.image(halftoned, -diagonalOffsetX, -diagonalOffsetY)
        channel.pop()
      }
    })
  } else if (dither && typeof window.ditherImage === 'function') {
    // ディザー専用パス - 対角線バッファを使用
    const solidG = pipeline.createGraphics(diagonal, diagonal)
    solidG.push()
    solidG.background(255)
    solidG.noStroke()
    solidG.fill(0)
    solidG.drawingContext.save()
    solidG.drawingContext.translate(diagonalOffsetX, diagonalOffsetY)
    pipeline.drawPathToCanvas(path, solidG.drawingContext)
    solidG.drawingContext.fill()
    solidG.drawingContext.restore()
    solidG.pop()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const dithered = window.ditherImage(solidG, ...dither.ditherArgs)

    channels.forEach((channel, i) => {
      const channelVal = fill.channelVals[i]
      if (channelVal !== undefined && channelVal > 0) {
        channel.push()
        channel.fill(createInkDepth(channelVal))
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        channel.image(dithered, -diagonalOffsetX, -diagonalOffsetY)
        channel.pop()
      }
    })
  } else {
    // 通常パス（エフェクトなし）
    channels.forEach((channel, i) => {
      const channelVal = fill.channelVals[i]
      if (channelVal !== undefined && channelVal > 0) {
        channel.push()
        channel.fill(createInkDepth(channelVal))
        pipeline.drawPathToCanvas(path, channel.drawingContext)
        channel.drawingContext.fill()
        channel.pop()
      }
    })
  }
}
