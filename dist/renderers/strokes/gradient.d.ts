/**
 * グラデーションStrokeレンダラー
 */
import type { GradientStrokeConfig } from '../../types/stroke.js';
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js';
/**
 * グラデーションStrokeをレンダリング
 *
 * pattern strokeと同様の構造:
 * 1. ソリッドストローク画像を作成（cutout/join用）
 * 2. 各colorStopのグラデーション画像を作成
 * 3. cutoutモード: 全チャンネルからソリッドでREMOVE
 * 4. joinモード: 全チャンネルからソリッドでREMOVE
 * 5. 各colorStopのグラデーションを対象チャンネルに転送
 *
 * @param stroke - グラデーションStroke設定
 * @param pipeline - GraphicsPipeline
 */
export declare const renderGradientStroke: (stroke: GradientStrokeConfig, pipeline: GraphicsPipeline) => void;
//# sourceMappingURL=gradient.d.ts.map