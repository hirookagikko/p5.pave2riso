/**
 * ベタ塗りFillレンダラー
 *
 * Refactored to eliminate code duplication between JOIN mode and normal mode
 * by extracting common patterns into helper functions.
 */
import type { SolidFillConfig } from '../../types/fill.js';
import type { GraphicsPipeline } from '../../graphics/GraphicsPipeline.js';
/**
 * ベタ塗りFillをレンダリング
 *
 * @param fill - ベタ塗りFill設定
 * @param pipeline - GraphicsPipeline
 */
export declare const renderSolidFill: (fill: SolidFillConfig, pipeline: GraphicsPipeline) => void;
//# sourceMappingURL=solid.d.ts.map