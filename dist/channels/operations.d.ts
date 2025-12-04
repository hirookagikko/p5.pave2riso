/**
 * チャンネル操作ユーティリティ
 */
import type { FilterConfig, LegacyFilterConfig, HalftoneConfig, DitherConfig } from '../types/effects.js';
type AnyFilterConfig = FilterConfig | LegacyFilterConfig;
/**
 * Graphicsオブジェクトにフィルターを適用
 *
 * 新形式（Discriminated Union）と旧形式（filterArgs）の両方に対応
 *
 * @param graphics - フィルターを適用するGraphicsオブジェクト
 * @param filterConfig - フィルター設定（配列または単一）
 * @returns フィルター適用後のGraphicsオブジェクト（チェーン用）
 *
 * @example
 * // 新形式（推奨）
 * applyFilters(g, { filterType: 'posterize', levels: 4 })
 * applyFilters(g, { filterType: 'blur', radius: 3 })
 *
 * // 旧形式（後方互換）
 * applyFilters(g, { filterType: 'posterize', filterArgs: [4] })
 */
export declare const applyFilters: (graphics: p5.Graphics, filterConfig: AnyFilterConfig | AnyFilterConfig[] | null | undefined) => p5.Graphics;
/**
 * Check if the halftoneImage function is available
 *
 * @returns true if halftoneImage is available
 */
export declare const isHalftoneAvailable: () => boolean;
/**
 * Check if the ditherImage function is available
 *
 * @returns true if ditherImage is available
 */
export declare const isDitherAvailable: () => boolean;
/**
 * Graphicsオブジェクトにハーフトーン/ディザーエフェクトを適用
 *
 * Requires p5.riso.js to be loaded for halftone and dither effects.
 * If the required functions are not available and effects are requested,
 * a warning is logged and the graphics object is returned unchanged.
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
export {};
//# sourceMappingURL=operations.d.ts.map