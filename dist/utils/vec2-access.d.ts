/**
 * Vec2アクセスヘルパー関数
 *
 * Linearly.jsのVec2型は配列インデックスでアクセスするが、
 * TypeScriptの型推論では適切に認識されないため、
 * eslint-disableの注釈をこのファイルに集約する。
 *
 * @see https://github.com/baku89/linearly
 */
import type { GraphicsPipeline } from '../graphics/GraphicsPipeline.js';
import type { Vec2 } from '../types/linearly.js';
/**
 * Vec2から座標を抽出
 *
 * @param vec - Vec2オブジェクト
 * @returns x, y座標
 * @throws Error if vec is null/undefined or doesn't have valid numeric values
 */
export declare const extractVec2: (vec: Vec2) => {
    x: number;
    y: number;
};
/**
 * GraphicsPipelineからサイズを抽出
 *
 * @param pipeline - GraphicsPipeline
 * @returns width, height
 */
export declare const extractSize: (pipeline: GraphicsPipeline) => {
    width: number;
    height: number;
};
/**
 * GraphicsPipelineから位置を抽出
 *
 * @param pipeline - GraphicsPipeline
 * @returns x, y座標
 */
export declare const extractPosition: (pipeline: GraphicsPipeline) => {
    x: number;
    y: number;
};
/**
 * GraphicsPipelineからストローク用のサイズと位置を抽出
 * （strokeWeight分のパディングを含む）
 *
 * @param pipeline - GraphicsPipeline
 * @param strokeWeight - ストローク幅
 * @returns 位置とサイズ（strokeWeight分のパディング込み）
 */
export declare const extractStrokeBounds: (pipeline: GraphicsPipeline, strokeWeight: number) => {
    x: number;
    y: number;
    width: number;
    height: number;
};
//# sourceMappingURL=vec2-access.d.ts.map