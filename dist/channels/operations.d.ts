/**
 * チャンネル操作ユーティリティ
 */
import type { FilterConfig, HalftoneConfig, DitherConfig } from '../types/effects.js';
/**
 * Graphicsオブジェクトにフィルターを適用
 *
 * @param graphics - フィルターを適用するGraphicsオブジェクト
 * @param filterConfig - フィルター設定（配列または単一）
 * @returns フィルター適用後のGraphicsオブジェクト（チェーン用）
 */
export declare const applyFilters: (graphics: p5.Graphics, filterConfig: FilterConfig | FilterConfig[] | null | undefined) => p5.Graphics;
/**
 * Graphicsオブジェクトにハーフトーン/ディザーエフェクトを適用
 *
 * @param graphics - エフェクトを適用するGraphicsオブジェクト
 * @param halftone - ハーフトーン設定
 * @param dither - ディザー設定
 * @returns エフェクト適用後のGraphicsオブジェクト
 */
export declare const applyEffects: (graphics: p5.Graphics, halftone: HalftoneConfig | null | undefined, dither: DitherConfig | null | undefined) => p5.Graphics;
/**
 * グローバルなPTNオブジェクトの存在チェック
 *
 * @throws {ReferenceError} PTNオブジェクトが存在しない場合
 */
export declare const ensurePTNAvailable: () => void;
//# sourceMappingURL=operations.d.ts.map