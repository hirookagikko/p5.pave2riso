/**
 * pave2Riso メイン関数
 *
 * Pave pathをRisographチャンネルに変換する
 */

import type { Pave2RisoOptions } from './types/core.js'
import { validateOptions } from './validation/validate.js'
import { GraphicsPipeline } from './graphics/GraphicsPipeline.js'
import { applyMode, applyStrokeModePreprocess } from './modes/modes.js'
import { renderSolidFill } from './renderers/fills/solid.js'
import { renderPatternFill } from './renderers/fills/pattern.js'
import { renderGradientFill } from './renderers/fills/gradient.js'
import { renderImageFill } from './renderers/fills/image.js'
import { renderSolidStroke } from './renderers/strokes/solid.js'
import { renderDashedStroke } from './renderers/strokes/dashed.js'
import { renderPatternStroke } from './renderers/strokes/pattern.js'
import { renderGradientStroke } from './renderers/strokes/gradient.js'

/**
 * Pave pathをRisographチャンネルに変換
 *
 * @param options - 変換オプション
 *
 * @example
 * pave2Riso({
 *   path: myPath,
 *   fill: { type: 'solid', channelVals: [100, 0, 0] },
 *   stroke: null,
 *   mode: 'overprint',
 *   canvasSize: [800, 600],
 *   channels: [channel1, channel2, channel3]
 * })
 */
export const pave2Riso = (options: Pave2RisoOptions): void => {
  // 入力バリデーション
  validateOptions(options)

  // GraphicsPipelineの初期化
  const pipeline = new GraphicsPipeline(options)

  try {
    // クリッピングパスの設定
    pipeline.setupClipping()

    // レンダリングモードの適用
    applyMode(options.mode, pipeline)

    // Fill処理
    if (options.fill) {
      switch (options.fill.type) {
        case 'solid':
          renderSolidFill(options.fill, pipeline)
          break
        case 'pattern':
          renderPatternFill(options.fill, pipeline)
          break
        case 'gradient':
          renderGradientFill(options.fill, pipeline)
          break
        case 'image':
          renderImageFill(options.fill, pipeline)
          break
        default: {
          const _exhaustiveCheck: never = options.fill
          console.warn(`Unknown fill type: ${(_exhaustiveCheck as { type: string }).type}`)
        }
      }
    }

    // Stroke処理
    if (options.stroke) {
      // cutout/joinモードの前処理
      if (options.stroke.type === 'dashed') {
        applyStrokeModePreprocess(
          options.mode,
          pipeline,
          options.stroke.strokeWeight,
          options.stroke.dashArgs,
          options.stroke.strokeCap
        )
      } else if (options.stroke.type === 'solid' || options.stroke.type === 'pattern') {
        applyStrokeModePreprocess(options.mode, pipeline, options.stroke.strokeWeight)
      }

      // Strokeレンダリング
      switch (options.stroke.type) {
        case 'solid':
          renderSolidStroke(options.stroke, pipeline)
          break
        case 'dashed':
          renderDashedStroke(options.stroke, pipeline)
          break
        case 'pattern':
          renderPatternStroke(options.stroke, pipeline)
          break
        case 'gradient':
          renderGradientStroke(options.stroke, pipeline)
          break
        default: {
          const _exhaustiveCheck: never = options.stroke
          console.warn(`Unknown stroke type: ${(_exhaustiveCheck as { type: string }).type}`)
        }
      }
    }

    // クリッピングパスの解除
    pipeline.releaseClipping()
  } finally {
    // リソースのクリーンアップ
    pipeline.cleanup()
  }
}
