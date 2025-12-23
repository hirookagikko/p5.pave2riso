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
 * Unite two paths (boolean OR operation)
 *
 * Returns a new path containing the combined area of both paths.
 * This is a simplified wrapper around Path.unite([A, B]).
 *
 * @param pathA - First path
 * @param pathB - Second path
 * @returns United path, or empty path on error
 *
 * @example
 * ```typescript
 * const circle1 = Path.circle([100, 100], 50)
 * const circle2 = Path.circle([150, 100], 50)
 * const result = PathUnite(circle1, circle2)
 * // Returns combined area of both circles
 * ```
 */
export declare const PathUnite: (pathA: PavePath, pathB: PavePath) => PavePath;
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
/**
 * Cleanup Paper.js resources to prevent memory leaks
 *
 * Should be called when PathOffset operations are no longer needed,
 * or periodically during long-running sessions.
 *
 * @example
 * ```typescript
 * // After completing path operations
 * cleanupPaperResources()
 * ```
 */
export declare function cleanupPaperResources(): void;
/**
 * Offset a path by a given distance using paperjs-offset
 *
 * This function works around Pave.js's Path.offset issue by:
 * 1. Converting Pave path to Paper.js 0.12.4 path
 * 2. Applying PaperOffset.offset
 * 3. Converting result back to Pave path
 *
 * IMPORTANT: Requires paper.js 0.12.4 and paperjs-offset 1.0.8 to be loaded:
 * ```html
 * <script type="importmap">
 * {
 *   "imports": {
 *     "paper": "https://cdn.jsdelivr.net/npm/paper@0.12.4/+esm",
 *     "paperjs-offset": "https://cdn.jsdelivr.net/npm/paperjs-offset@1.0.8/+esm"
 *   }
 * }
 * </script>
 * <script type="module">
 *   import paper from 'paper'
 *   import { PaperOffset } from 'paperjs-offset'
 *   window.paper = paper
 *   window.PaperOffset = PaperOffset
 * </script>
 * ```
 *
 * @param path - Pave.js path to offset
 * @param distance - Offset distance (positive = outward, negative = inward)
 * @param options - Optional settings for join and cap style
 * @returns Offset path, or original path if offset fails
 *
 * @example
 * ```typescript
 * const rect = Path.rect([100, 100], [300, 200])
 * const expanded = PathOffset(rect, 20) // 20px outward
 * const shrunk = PathOffset(rect, -10) // 10px inward
 * ```
 */
export declare const PathOffset: (path: PavePath, distance: number, options?: {
    join?: "miter" | "bevel" | "round";
    cap?: "butt" | "round" | "square";
}) => PavePath;
/**
 * Remove all holes from a path, keeping only the outer contours
 *
 * This function analyzes the winding direction of each sub-path and removes
 * any that are detected as holes (counter-clockwise winding in a Y-down
 * coordinate system).
 *
 * Useful after PathOffset operations on text where you want to fill the
 * holes of letters like 'e', 'o', 'a', 'd', etc.
 *
 * @param path - Pave.js path (may be a compound path with holes)
 * @returns New path with only solid (outer) contours, or original path if no holes
 *
 * @example
 * ```typescript
 * const textPath = ot2pave(font.getPath('echo', 0, 100, 72).commands)
 * const offsetPath = PathOffset(textPath, 10)
 * const filledPath = PathRemoveHoles(offsetPath)
 * // 'e', 'c', 'o' の穴が埋められた太い文字パス
 * ```
 */
export declare const PathRemoveHoles: (path: PavePath) => PavePath;
//# sourceMappingURL=pathfinder.d.ts.map