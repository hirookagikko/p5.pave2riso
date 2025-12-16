/**
 * Channel operation utilities
 */
import type { FilterConfig, LegacyFilterConfig, HalftoneConfig, DitherConfig } from '../types/effects.js';
type AnyFilterConfig = FilterConfig | LegacyFilterConfig;
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
export declare const applyEffects: (graphics: p5.Graphics, halftone: HalftoneConfig | null | undefined, dither: DitherConfig | null | undefined) => p5.Graphics;
/**
 * Checks for the presence of the global PTN object
 *
 * @throws {ReferenceError} If PTN object is not available
 */
export declare const ensurePTNAvailable: () => void;
export {};
//# sourceMappingURL=operations.d.ts.map