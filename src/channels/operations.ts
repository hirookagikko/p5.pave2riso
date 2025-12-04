/**
 * チャンネル操作ユーティリティ
 */

import type { FilterConfig, HalftoneConfig, DitherConfig } from '../types/effects.js'

/**
 * Graphicsオブジェクトにフィルターを適用
 *
 * @param graphics - フィルターを適用するGraphicsオブジェクト
 * @param filterConfig - フィルター設定（配列または単一）
 * @returns フィルター適用後のGraphicsオブジェクト（チェーン用）
 */
export const applyFilters = (
  graphics: p5.Graphics,
  filterConfig: FilterConfig | FilterConfig[] | null | undefined
): p5.Graphics => {
  if (!filterConfig) return graphics

  const filters = Array.isArray(filterConfig) ? filterConfig : [filterConfig]

  filters.forEach((f) => {
    const requiresArgs = ['posterize', 'blur'].includes(f.filterType)

    if (requiresArgs && f.filterArgs) {
      // blur引数を整数化してp5.jsのcopy()エラーを防止
      const args = f.filterType === 'blur'
        ? f.filterArgs.map(arg => Math.round(arg))
        : f.filterArgs
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      graphics.filter(f.filterType, ...args)
    } else {
      graphics.filter(f.filterType)
    }
  })

  return graphics
}

/**
 * Graphicsオブジェクトにハーフトーン/ディザーエフェクトを適用
 *
 * @param graphics - エフェクトを適用するGraphicsオブジェクト
 * @param halftone - ハーフトーン設定
 * @param dither - ディザー設定
 * @returns エフェクト適用後のGraphicsオブジェクト
 */
export const applyEffects = (
  graphics: p5.Graphics,
  halftone: HalftoneConfig | null | undefined,
  dither: DitherConfig | null | undefined
): p5.Graphics => {
  let result = graphics

  // ハーフトーンエフェクト
  if (halftone && typeof window.halftoneImage === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    result = window.halftoneImage(result, ...halftone.halftoneArgs)
  }

  // ディザーエフェクト
  if (dither && typeof window.ditherImage === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    result = window.ditherImage(result, ...dither.ditherArgs)
  }

  return result
}

/**
 * グローバルなPTNオブジェクトの存在チェック
 *
 * @throws {ReferenceError} PTNオブジェクトが存在しない場合
 */
export const ensurePTNAvailable = (): void => {
  if (typeof PTN === 'undefined') {
    throw new ReferenceError(
      'PTN object is not available. Please include p5.pattern library.'
    )
  }
}
