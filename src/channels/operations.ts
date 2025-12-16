/**
 * Channel operation utilities
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
 * Applies filters to a Graphics object
 *
 * Supports both new format (Discriminated Union) and legacy format (filterArgs)
 *
 * @param graphics - Graphics object to apply filters to
 * @param filterConfig - Filter configuration (array or single)
 * @returns Graphics object after filter application (for chaining)
 *
 * @example
 * // New format (recommended)
 * applyFilters(g, { filterType: 'posterize', levels: 4 })
 * applyFilters(g, { filterType: 'blur', radius: 3 })
 *
 * // Legacy format (backward compatible)
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
 * Applies halftone/dither effects to a Graphics object
 *
 * Requires p5.riso.js to be loaded for halftone and dither effects.
 * If the required functions are not available and effects are requested,
 * a warning is logged and the graphics object is returned unchanged.
 *
 * @param graphics - Graphics object to apply effects to
 * @param halftone - Halftone configuration
 * @param dither - Dither configuration
 * @returns Graphics object after effect application
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
 * Checks for the presence of the global PTN object
 *
 * @throws {ReferenceError} If PTN object is not available
 */
export const ensurePTNAvailable = (): void => {
  if (typeof PTN === 'undefined') {
    throw new ReferenceError(
      'PTN object is not available. Please include p5.pattern library.'
    )
  }
}
