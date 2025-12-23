/**
 * ベタ塗りStrokeレンダラー
 *
 * Refactored to use applyEffectPipeline for consistent effect handling.
 */
import type { SolidStrokeConfig } from '../../types/stroke.js';
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js';
/**
 * ベタ塗りStrokeをレンダリング
 *
 * @param stroke - ベタ塗りStroke設定
 * @param pipeline - GraphicsPipeline
 */
export declare const renderSolidStroke: (stroke: SolidStrokeConfig, pipeline: GraphicsPipeline) => void;
//# sourceMappingURL=solid.d.ts.map