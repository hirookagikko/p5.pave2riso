/**
 * Pathfinder utilities for path boolean operations
 *
 * These functions provide safe wrappers around pave.js Path operations
 * with comprehensive error handling and edge case detection.
 */
import type { PavePath } from '../types/core.js';
/**
 * Computes the intersection of two paths (boolean AND operation)
 *
 * Returns a new path containing only the area where both paths overlap.
 * Handles edge cases including:
 * - Complete overlap (returns pathA)
 * - No overlap (returns empty path)
 * - Invalid paths (returns empty path with warning)
 *
 * @param pathA - First path
 * @param pathB - Second path
 * @returns Intersection path, or empty path if no intersection
 *
 * @example
 * ```typescript
 * const circle = Path.circle([100, 100], 50)
 * const rect = Path.rect([75, 75], [125, 125])
 * const intersection = PathIntersect(circle, rect)
 * ```
 */
export declare const PathIntersect: (pathA: PavePath, pathB: PavePath) => PavePath;
/**
 * Subtracts pathB from pathA (boolean NOT operation)
 *
 * Returns a new path containing the area of pathA with pathB removed.
 * This is a simplified wrapper around Path.subtract(A, [B]).
 *
 * @param pathA - Base path to subtract from
 * @param pathB - Path to subtract
 * @returns Subtracted path, or empty path on error
 *
 * @example
 * ```typescript
 * const circle = Path.circle([100, 100], 50)
 * const rect = Path.rect([75, 75], [50, 50])
 * const result = PathSubtract(circle, rect)
 * // Returns circle with rect removed
 * ```
 */
export declare const PathSubtract: (pathA: PavePath, pathB: PavePath) => PavePath;
/**
 * Computes the symmetric difference of two paths (boolean XOR operation)
 *
 * Returns a new path containing areas that are in either path but not in both.
 * This is equivalent to (A ∪ B) - (A ∩ B).
 *
 * @param pathA - First path
 * @param pathB - Second path
 * @returns Symmetric difference path, or empty path on error
 *
 * @example
 * ```typescript
 * const circle1 = Path.circle([100, 100], 50)
 * const circle2 = Path.circle([120, 100], 50)
 * const difference = PathExclude(circle1, circle2)
 * // Returns two crescent shapes
 * ```
 */
export declare const PathExclude: (pathA: PavePath, pathB: PavePath) => PavePath;
/**
 * Checks whether two paths overlap
 *
 * Uses PathIntersect to compute the intersection and checks if the result
 * has a non-zero area. This is more reliable than checking curve count changes,
 * which fails for cases like partially overlapping circles (where a crescent
 * shape still has the same curve count as the original circle).
 *
 * @param pathA - First path
 * @param pathB - Second path
 * @returns true if paths overlap, false otherwise
 *
 * @example
 * ```typescript
 * const circle = Path.circle([100, 100], 50)
 * const rect = Path.rect([75, 75], [125, 125])
 * if (isPathsOverlap(circle, rect)) {
 *   console.log('Paths overlap!')
 * }
 * ```
 */
export declare const isPathsOverlap: (pathA: PavePath, pathB: PavePath) => boolean;
//# sourceMappingURL=pathfinder.d.ts.map