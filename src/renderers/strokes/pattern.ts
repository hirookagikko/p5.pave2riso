/**
 * パターンStrokeレンダラー
 */

import type { PatternStrokeConfig } from '../../types/stroke.js'
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js'
import { ensurePTNAvailable } from '../../channels/operations.js'

/**
 * パターンStrokeをレンダリング
 *
 * @param stroke - パターンStroke設定
 * @param pipeline - GraphicsPipeline
 */
export const renderPatternStroke = (
  stroke: PatternStrokeConfig,
  pipeline: GraphicsPipeline
): void => {
  ensurePTNAvailable()

  const options = pipeline.getOptions()
  const path = options.path
  const gPos = pipeline.getPosition()
  const gSize = pipeline.getSize()
  const baseG = pipeline.getBaseGraphics()

  // パターングラフィックスの作成
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const patG = pipeline.createGraphics(gSize[0] as number, gSize[1] as number)
  patG.noFill()
  patG.strokeWeight(stroke.strokeWeight)
  patG.patternAngle(stroke.patternAngle ?? 0)
  const patternFn = PTN[stroke.PTN]
  if (!patternFn) {
    throw new Error(`Pattern '${stroke.PTN}' not found in PTN object`)
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
  patG.pattern(patternFn(...stroke.patternArgs))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  patG.rectPattern(0, 0, gSize[0] as number, gSize[1] as number)

  // ベースグラフィックスにパターンを適用
  pipeline.drawPathToCanvas(path, baseG.drawingContext)
  baseG.drawingContext.clip()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  baseG.image(patG, gPos[0] as number, gPos[1] as number)
}
