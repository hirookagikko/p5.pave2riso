/**
 * チャンネル操作ユーティリティ
 */

import type {
  FilterConfig,
  LegacyFilterConfig,
  HalftoneConfig,
  DitherConfig
} from '../types/effects.js'
import { normalizeFilterConfig } from '../types/effects.js'

type AnyFilterConfig = FilterConfig | LegacyFilterConfig

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
export const applyFilters = (
  graphics: p5.Graphics,
  filterConfig: AnyFilterConfig | AnyFilterConfig[] | null | undefined
): p5.Graphics => {
  if (!filterConfig) return graphics

  const filters = Array.isArray(filterConfig) ? filterConfig : [filterConfig]

  filters.forEach((rawFilter) => {
    // Discriminated Union形式に正規化
    const f = normalizeFilterConfig(rawFilter)

    switch (f.filterType) {
      case 'posterize':
        graphics.filter(f.filterType, f.levels)
        break
      case 'blur':
        // blur引数を整数化してp5.jsのcopy()エラーを防止
        graphics.filter(f.filterType, Math.round(f.radius ?? 4))
        break
      case 'threshold':
        graphics.filter(f.filterType, f.threshold ?? 0.5)
        break
      default:
        // gray, opaque, invert, dilate, erode - 引数なし
        graphics.filter(f.filterType)
    }
  })

  return graphics
}

/**
 * Check if the halftoneImage function is available
 *
 * @returns true if halftoneImage is available
 */
export const isHalftoneAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.halftoneImage === 'function'
}

/**
 * Check if the ditherImage function is available
 *
 * @returns true if ditherImage is available
 */
export const isDitherAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ditherImage === 'function'
}

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
export const applyEffects = (
  graphics: p5.Graphics,
  halftone: HalftoneConfig | null | undefined,
  dither: DitherConfig | null | undefined
): p5.Graphics => {
  let result = graphics

  // ハーフトーンエフェクト
  if (halftone) {
    if (typeof window !== 'undefined' && typeof window.halftoneImage === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      result = window.halftoneImage(result, ...halftone.halftoneArgs)
    } else {
      console.warn(
        'p5.pave2riso: halftone effect requested but halftoneImage() is not available. ' +
        'Make sure p5.riso.js is loaded.'
      )
    }
  }

  // ディザーエフェクト
  if (dither) {
    if (typeof window !== 'undefined' && typeof window.ditherImage === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      result = window.ditherImage(result, ...dither.ditherArgs)
    } else {
      console.warn(
        'p5.pave2riso: dither effect requested but ditherImage() is not available. ' +
        'Make sure p5.riso.js is loaded.'
      )
    }
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
