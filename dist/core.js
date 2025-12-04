/**
 * pave2Riso メイン関数
 *
 * Pave pathをRisographチャンネルに変換する
 */
import { validateOptions } from './validation/validate.js';
import { GraphicsPipeline } from './graphics/GraphicsPipeline.js';
import { applyMode, applyStrokeModePreprocess } from './modes/modes.js';
import { renderSolidFill } from './renderers/fills/solid.js';
import { renderPatternFill } from './renderers/fills/pattern.js';
import { renderGradientFill } from './renderers/fills/gradient.js';
import { renderImageFill } from './renderers/fills/image.js';
import { renderSolidStroke } from './renderers/strokes/solid.js';
import { renderDashedStroke } from './renderers/strokes/dashed.js';
import { renderPatternStroke } from './renderers/strokes/pattern.js';
import { renderGradientStroke } from './renderers/strokes/gradient.js';
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
export const pave2Riso = (options) => {
    // 入力バリデーション
    validateOptions(options);
    // GraphicsPipelineの初期化
    const pipeline = new GraphicsPipeline(options);
    try {
        // クリッピングパスの設定
        pipeline.setupClipping();
        // レンダリングモードの適用
        applyMode(options.mode, pipeline);
        // Fill処理
        if (options.fill) {
            switch (options.fill.type) {
                case 'solid':
                    renderSolidFill(options.fill, pipeline);
                    break;
                case 'pattern':
                    renderPatternFill(options.fill, pipeline);
                    break;
                case 'gradient':
                    renderGradientFill(options.fill, pipeline);
                    break;
                case 'image':
                    renderImageFill(options.fill, pipeline);
                    break;
                default: {
                    const _exhaustiveCheck = options.fill;
                    throw new TypeError(`Unknown fill type: ${_exhaustiveCheck.type}. ` +
                        `Supported types: solid, pattern, gradient, image`);
                }
            }
        }
        // Stroke処理
        if (options.stroke) {
            // cutout/joinモードの前処理
            if (options.stroke.type === 'dashed') {
                applyStrokeModePreprocess(options.mode, pipeline, options.stroke.strokeWeight, options.stroke.dashArgs, options.stroke.strokeCap, options.stroke.strokeJoin);
            }
            else if (options.stroke.type === 'solid') {
                applyStrokeModePreprocess(options.mode, pipeline, options.stroke.strokeWeight, undefined, // dashArgs
                options.stroke.strokeCap, options.stroke.strokeJoin);
            }
            else if (options.stroke.type === 'pattern') {
                // joinモードの場合はパターンレンダラー内で処理（柄だけを消去）
                // cutoutモードの場合のみ前処理で消去
                if (options.mode !== 'join') {
                    applyStrokeModePreprocess(options.mode, pipeline, options.stroke.strokeWeight, options.stroke.dashArgs, options.stroke.strokeCap, options.stroke.strokeJoin);
                }
            }
            else if (options.stroke.type === 'gradient') {
                // cutoutモード: patternと同様に前処理でerase
                // （透明部分はレンダラー内でsolidGを使って白で埋める）
                if (options.mode === 'cutout') {
                    applyStrokeModePreprocess(options.mode, pipeline, options.stroke.strokeWeight, options.stroke.dashArgs, options.stroke.strokeCap, options.stroke.strokeJoin);
                }
                // joinモード: レンダラー内でgradGを使ってREMOVE
            }
            // Strokeレンダリング
            switch (options.stroke.type) {
                case 'solid':
                    renderSolidStroke(options.stroke, pipeline);
                    break;
                case 'dashed':
                    renderDashedStroke(options.stroke, pipeline);
                    break;
                case 'pattern':
                    renderPatternStroke(options.stroke, pipeline);
                    break;
                case 'gradient':
                    renderGradientStroke(options.stroke, pipeline);
                    break;
                default: {
                    const _exhaustiveCheck = options.stroke;
                    throw new TypeError(`Unknown stroke type: ${_exhaustiveCheck.type}. ` +
                        `Supported types: solid, dashed, pattern, gradient`);
                }
            }
        }
        // クリッピングパスの解除
        pipeline.releaseClipping();
    }
    finally {
        // リソースのクリーンアップ
        pipeline.cleanup();
    }
};
//# sourceMappingURL=core.js.map