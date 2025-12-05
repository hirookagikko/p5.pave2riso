/**
 * Stroke前処理ヘルパー関数
 *
 * core.tsのStroke前処理ロジックを集約し、
 * if-else連鎖を解消する。
 */
import type { StrokeConfig, StrokeCap, StrokeJoin } from '../types/stroke.js';
import type { RenderMode } from '../types/core.js';
import type { DashPattern } from '../types/branded.js';
/**
 * Stroke前処理に必要な共通パラメータ
 */
export interface StrokePreprocessParams {
    strokeWeight: number;
    dashArgs?: DashPattern;
    strokeCap?: StrokeCap;
    strokeJoin?: StrokeJoin;
}
/**
 * Strokeタイプとモードに基づいて前処理が必要かどうかを判定
 *
 * 前処理ルール:
 * - solid/dashed: cutout/joinモードで常に前処理
 * - pattern: cutoutモードのみ前処理（joinはレンダラー内で処理）
 * - gradient: cutoutモードのみ前処理（joinはレンダラー内で処理）
 *
 * @param strokeType - Strokeタイプ
 * @param mode - レンダリングモード
 * @returns 前処理が必要な場合true
 */
export declare const shouldApplyStrokePreprocess: (strokeType: StrokeConfig["type"], mode: RenderMode) => boolean;
/**
 * StrokeConfigから前処理に必要なパラメータを抽出
 *
 * @param stroke - Stroke設定
 * @returns 前処理パラメータ
 */
export declare const extractStrokePreprocessParams: (stroke: StrokeConfig) => StrokePreprocessParams;
//# sourceMappingURL=stroke-preprocess.d.ts.map