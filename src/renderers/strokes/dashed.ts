/**
 * 破線Strokeレンダラー
 */

import type { DashedStrokeConfig } from '../../types/stroke.js'
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js'
import { createInkDepth } from '../../utils/inkDepth.js'

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
  const { channels } = options
  const path = options.path

  channels.forEach((channel, i) => {
    const channelVal = stroke.channelVals[i]
    if (channelVal !== undefined && channelVal > 0) {
      channel.push()
      channel.stroke(createInkDepth(channelVal))
      channel.strokeWeight(stroke.strokeWeight)
      channel.drawingContext.setLineDash(stroke.dashArgs)
      channel.drawingContext.lineCap = stroke.strokeCap as CanvasLineCap
      pipeline.drawPathToCanvas(path, channel.drawingContext)
      channel.drawingContext.stroke()
      channel.pop()
    }
  })
}
