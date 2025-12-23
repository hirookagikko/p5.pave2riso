/**
 * 破線Strokeレンダラー
 *
 * Refactored to use applyEffectPipeline for consistent effect handling.
 */
import type { DashedStrokeConfig } from '../../types/stroke.js';
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js';
/**
 * 破線Strokeをレンダリング
 *
 * @param stroke - 破線Stroke設定
 * @param pipeline - GraphicsPipeline
 */
export declare const renderDashedStroke: (stroke: DashedStrokeConfig, pipeline: GraphicsPipeline) => void;
//# sourceMappingURL=dashed.d.ts.map