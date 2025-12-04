/**
 * レンダリングモード実装
 *
 * This module handles different rendering modes for Risograph printing:
 * - **overprint**: All colors print on top of each other (default)
 * - **cutout**: The shape is erased from all channels before rendering
 * - **join**: Similar to cutout, but with edge blending
 *
 * @module modes/modes
 */
import type { RenderMode } from '../types/core.js';
import type { GraphicsPipeline } from '../graphics/GraphicsPipeline.js';
/**
 * レンダリングモードを適用
 *
 * This function applies pre-processing based on the render mode.
 * It does NOT handle the actual fill/stroke rendering - that is done
 * by the respective renderers. This function only handles:
 *
 * 1. **overprint**: No pre-processing (colors layer on top)
 * 2. **cutout**: Erases the path shape from all channels
 *    - If filters are specified, applies them to the cutout mask
 *    - Uses REMOVE blend mode to erase the filtered shape
 * 3. **join**: Pre-processing is handled in fill/stroke renderers
 *
 * @param mode - レンダリングモード
 * @param pipeline - GraphicsPipeline
 */
export declare const applyMode: (mode: RenderMode, pipeline: GraphicsPipeline) => void;
/**
 * Stroke用のcutout/joinモード前処理
 *
 * @param mode - レンダリングモード
 * @param pipeline - GraphicsPipeline
 * @param strokeWeight - ストロークの太さ
 * @param dashArgs - 破線パターン（dashedの場合）
 * @param strokeCap - ストロークキャップ
 * @param strokeJoin - ストロークジョイン
 */
export declare const applyStrokeModePreprocess: (mode: RenderMode, pipeline: GraphicsPipeline, strokeWeight: number, dashArgs?: number[], strokeCap?: string, strokeJoin?: string) => void;
//# sourceMappingURL=modes.d.ts.map