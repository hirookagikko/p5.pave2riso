/**
 * エフェクトマージユーティリティ
 *
 * トップレベルとローカル（fill/stroke内）のエフェクト設定をマージする
 * ローカル設定が優先される（nullish coalescing）
 */
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
export function mergeEffects(topLevel, local) {
    return {
        filter: local.filter !== undefined ? local.filter : topLevel.filter,
        halftone: local.halftone !== undefined ? local.halftone : topLevel.halftone,
        dither: local.dither !== undefined ? local.dither : topLevel.dither
    };
}
//# sourceMappingURL=effect-merge.js.map