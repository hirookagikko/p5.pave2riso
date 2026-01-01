/**
 * pave-utils - Path utilities for Pave.js
 * TypeScript type definitions
 */

/**
 * Pave.js Path (simplified)
 */
export interface PavePath {
  curves: unknown[]
}

/**
 * Pave.js Path static methods (simplified)
 */
export interface PavePathStatic {
  circle(center: [number, number], radius: number): PavePath
  toSVGString(path: PavePath): string
}

/**
 * Paper.js instance (simplified)
 */
export interface PaperInstance {
  setup(canvas: HTMLCanvasElement): void
  project: {
    importSVG(svg: string): unknown
    clear(): void
  }
  CompoundPath: new () => unknown
}

/**
 * PaperOffset static methods (simplified)
 */
export interface PaperOffsetStatic {
  offset(
    path: unknown,
    distance: number,
    options?: { join?: 'miter' | 'bevel' | 'round'; cap?: 'butt' | 'round' | 'square' }
  ): unknown
}

/**
 * Options for PathOffset
 */
export interface PathOffsetOptions {
  /**
   * Join style for corners
   * @default 'miter'
   */
  join?: 'miter' | 'bevel' | 'round'

  /**
   * Cap style for line ends
   * @default 'butt'
   */
  cap?: 'butt' | 'round' | 'square'
}

/**
 * Dependencies for createPaveUtils
 */
export interface PaveUtilsDeps {
  /**
   * Pave.js Path static object
   * Required: import { Path } from '@baku89/pave'
   */
  Path: PavePathStatic

  /**
   * Paper.js instance
   * Required for PathOffset and PathRemoveHoles
   */
  paper: PaperInstance

  /**
   * PaperOffset static object
   * Required for PathOffset
   */
  PaperOffset: PaperOffsetStatic
}

/**
 * Boolean operation function type (two paths → one path)
 */
export type BooleanOpFunction = (pathA: PavePath, pathB: PavePath) => PavePath

/**
 * PathOffset function type
 */
export type PathOffsetFunction = (
  path: PavePath,
  distance: number,
  options?: PathOffsetOptions
) => PavePath

/**
 * PathRemoveHoles function type
 */
export type PathRemoveHolesFunction = (path: PavePath) => PavePath

/**
 * Cleanup function type
 */
export type CleanupFunction = () => void

/**
 * Return type of createPaveUtils
 */
export interface PaveUtilsInstance {
  // Boolean operations

  /**
   * Unite two paths (boolean OR operation)
   *
   * @param pathA - First path
   * @param pathB - Second path
   * @returns United path containing combined area
   */
  PathUnite: BooleanOpFunction

  /**
   * Subtract pathB from pathA (boolean NOT operation)
   *
   * @param pathA - Base path to subtract from
   * @param pathB - Path to subtract
   * @returns Subtracted path
   */
  PathSubtract: BooleanOpFunction

  /**
   * Compute the intersection of two paths (boolean AND operation)
   *
   * @param pathA - First path
   * @param pathB - Second path
   * @returns Intersection path (overlapping area only)
   */
  PathIntersect: BooleanOpFunction

  /**
   * Compute the symmetric difference of two paths (boolean XOR operation)
   *
   * @param pathA - First path
   * @param pathB - Second path
   * @returns Symmetric difference (areas in either but not both)
   */
  PathExclude: BooleanOpFunction

  // Path manipulation

  /**
   * Offset a path by a given distance
   *
   * @param path - Pave.js path to offset
   * @param distance - Offset distance (positive = outward, negative = inward)
   * @param options - Optional join and cap style settings
   * @returns Offset path, or original path if offset fails
   */
  PathOffset: PathOffsetFunction

  /**
   * Remove all holes from a path, keeping only the outer contours
   *
   * @param path - Pave.js path (may be a compound path with holes)
   * @returns New path with only solid (outer) contours
   */
  PathRemoveHoles: PathRemoveHolesFunction

  // Utilities

  /**
   * Cleanup Paper.js resources to prevent memory leaks
   * Should be called when operations are no longer needed
   */
  cleanup: CleanupFunction
}

/**
 * Create pave-utils with dependency injection
 *
 * @param deps - Dependencies (Path, paper, PaperOffset)
 * @returns Object containing PathOffset, PathRemoveHoles, and cleanup
 *
 * @example
 * ```typescript
 * import { Path } from '@baku89/pave'
 * import paper from 'paper'
 * import { PaperOffset } from 'paperjs-offset'
 * import { createPaveUtils } from 'pave-utils'
 *
 * const { PathOffset, PathRemoveHoles, cleanup } = createPaveUtils({
 *   Path, paper, PaperOffset
 * })
 *
 * const expanded = PathOffset(path, 10)
 * const filled = PathRemoveHoles(expanded)
 *
 * // Cleanup when done
 * cleanup()
 * ```
 */
export function createPaveUtils(deps: PaveUtilsDeps): PaveUtilsInstance

export default createPaveUtils
