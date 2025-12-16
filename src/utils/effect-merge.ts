/**
 * Effect merge utilities
 *
 * Merges top-level and local (within fill/stroke) effect configurations.
 * Local settings take precedence (nullish coalescing).
 */

import type { FilterConfig, HalftoneConfig, DitherConfig } from '../types/effects.js'

/**
 * Effect configuration type
 * Allows undefined to accept values from optional properties
 */
export interface EffectConfig {
  filter?: FilterConfig | FilterConfig[] | null | undefined
  halftone?: HalftoneConfig | null | undefined
  dither?: DitherConfig | null | undefined
}

/**
 * Merged result type
 */
export interface MergedEffects {
  filter: FilterConfig | FilterConfig[] | null | undefined
  halftone: HalftoneConfig | null | undefined
  dither: DitherConfig | null | undefined
}

/**
 * Merge top-level and local effect configurations
 *
 * Priority: Local > Top-level
 * - If local is set, use local
 * - If local is undefined, use top-level
 * - If local is null, use null (explicitly disabled)
 *
 * @param topLevel - Top-level effect configuration (options.filter, etc.)
 * @param local - Local effect configuration (fill.filter, stroke.filter, etc.)
 * @returns Merged effect configuration
 *
 * @example
 * ```typescript
 * // Top-level only specified → use top-level
 * mergeEffects({ filter: blurConfig }, {})
 * // => { filter: blurConfig, halftone: undefined, dither: undefined }
 *
 * // Local only specified → use local
 * mergeEffects({}, { filter: posterizeConfig })
 * // => { filter: posterizeConfig, halftone: undefined, dither: undefined }
 *
 * // Both specified → local takes precedence
 * mergeEffects({ filter: blurConfig }, { filter: posterizeConfig })
 * // => { filter: posterizeConfig, halftone: undefined, dither: undefined }
 *
 * // Local is null → explicitly disabled
 * mergeEffects({ filter: blurConfig }, { filter: null })
 * // => { filter: null, halftone: undefined, dither: undefined }
 * ```
 */
export function mergeEffects(
  topLevel: EffectConfig,
  local: EffectConfig
): MergedEffects {
  return {
    filter: local.filter !== undefined ? local.filter : topLevel.filter,
    halftone: local.halftone !== undefined ? local.halftone : topLevel.halftone,
    dither: local.dither !== undefined ? local.dither : topLevel.dither
  }
}
