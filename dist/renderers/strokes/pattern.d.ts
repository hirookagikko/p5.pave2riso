/**
 * パターンStrokeレンダラー
 */
import type { PatternStrokeConfig } from '../../types/stroke.js';
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js';
/**
 * パターンStrokeをレンダリング
 *
 * destination-in 方式:
 * 1. パターングラフィックスを作成（全面にパターン描画）
 * 2. destination-in でストローク形状に切り抜き
 * 3. 各チャンネルに転送
 *
 * @param stroke - パターンStroke設定
 * @param pipeline - GraphicsPipeline
 */
export declare const renderPatternStroke: (stroke: PatternStrokeConfig, pipeline: GraphicsPipeline) => void;
//# sourceMappingURL=pattern.d.ts.map