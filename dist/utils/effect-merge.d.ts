/**
 * エフェクトマージユーティリティ
 *
 * トップレベルとローカル（fill/stroke内）のエフェクト設定をマージする
 * ローカル設定が優先される（nullish coalescing）
 */
import type { FilterConfig, HalftoneConfig, DitherConfig } from '../types/effects.js';
/**
 * エフェクト設定の型
 * undefinedを許容することで、オプショナルプロパティからの値を受け取れる
 */
export interface EffectConfig {
    filter?: FilterConfig | FilterConfig[] | null | undefined;
    halftone?: HalftoneConfig | null | undefined;
    dither?: DitherConfig | null | undefined;
}
/**
 * マージ結果の型
 */
export interface MergedEffects {
    filter: FilterConfig | FilterConfig[] | null | undefined;
    halftone: HalftoneConfig | null | undefined;
    dither: DitherConfig | null | undefined;
}
/**
 * トップレベルとローカルのエフェクト設定をマージする
 *
 * 優先順位: ローカル > トップレベル
 * - ローカルに設定がある場合はローカルを使用
 * - ローカルがundefinedの場合はトップレベルを使用
 * - ローカルがnullの場合はnull（明示的に無効化）
 *
 * @param topLevel - トップレベルのエフェクト設定（options.filter等）
 * @param local - ローカルのエフェクト設定（fill.filter, stroke.filter等）
 * @returns マージされたエフェクト設定
 *
 * @example
 * ```typescript
 * // トップレベルのみ指定 → トップレベルを使用
 * mergeEffects({ filter: blurConfig }, {})
 * // => { filter: blurConfig, halftone: undefined, dither: undefined }
 *
 * // ローカルのみ指定 → ローカルを使用
 * mergeEffects({}, { filter: posterizeConfig })
 * // => { filter: posterizeConfig, halftone: undefined, dither: undefined }
 *
 * // 両方指定 → ローカル優先
 * mergeEffects({ filter: blurConfig }, { filter: posterizeConfig })
 * // => { filter: posterizeConfig, halftone: undefined, dither: undefined }
 *
 * // ローカルでnull指定 → 明示的に無効化
 * mergeEffects({ filter: blurConfig }, { filter: null })
 * // => { filter: null, halftone: undefined, dither: undefined }
 * ```
 */
export declare function mergeEffects(topLevel: EffectConfig, local: EffectConfig): MergedEffects;
//# sourceMappingURL=effect-merge.d.ts.map