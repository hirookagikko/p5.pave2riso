/**
 * レンダリングモード実装
 */
import type { RenderMode } from '../types/core.js';
import type { GraphicsPipeline } from '../graphics/GraphicsPipeline.js';
/**
 * レンダリングモードを適用
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