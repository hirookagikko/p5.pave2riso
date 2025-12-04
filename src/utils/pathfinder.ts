/**
 * Pathfinder utilities for path boolean operations
 *
 * These functions provide safe wrappers around pave.js Path operations
 * with comprehensive error handling and edge case detection.
 */

import type { PavePath } from '../types/core.js'
import type { PaperPath, PaperItem } from '../types/paper.js'
import {
  createCircle,
  subtractPaths,
  unitePaths,
  getPathBounds,
  getPath
} from './pave-wrapper.js'
import { getPaper, getPaperOffset } from './paper-wrapper.js'

// External dependencies for PathOffset (loaded via CDN or via DI)
// paper.js 0.12.4: https://cdn.jsdelivr.net/npm/paper@0.12.4/+esm
// paperjs-offset 1.0.8: https://cdn.jsdelivr.net/npm/paperjs-offset@1.0.8/+esm
// Types are imported from ../types/paper.js

/**
 * Type guard to check if a path has curves
 */
function hasCurves(path: PavePath): path is PavePath & { curves: unknown[] } {
  return path !== null && typeof path === 'object' && 'curves' in path && Array.isArray(path.curves)
}

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
export const PathIntersect = (pathA: PavePath, pathB: PavePath): PavePath => {
  // External library interface (pave.js) - return values are typed but ESLint sees them as any
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
  const emptyPath = createCircle([0, 0], 0)

  if (!pathA || !pathB) {
    console.warn("PathIntersect: pathA または pathB が無効です。")
    return emptyPath
  }

  try {
    // 両方のPath.subtract操作をtry-catchで囲む
    const diff = subtractPaths(pathA, [pathB])
    if (!diff || !hasCurves(diff) || diff.curves.length === 0) {
      console.warn("PathIntersect: 差がないか、無効なパスです。")
      return emptyPath
    }
    const intersected = subtractPaths(pathA, [diff])
    return intersected
  } catch (e) {
    // Path.subtractでエラーが発生した場合（完全重複、完全分離など）
    if (e instanceof TypeError && e.message.includes("Cannot read properties of undefined")) {
      // Path.uniteで完全重複か完全分離かを判定
      try {
        const united = unitePaths([pathA, pathB])
        // 結合後のcurves数が元のpathAと同じなら完全重複
        if (hasCurves(united) && hasCurves(pathA) && united.curves.length === pathA.curves.length) {
          console.warn("PathIntersect: パス同士が完全重複しています。元のパスを返します。")
          return pathA
        } else {
          // 完全分離
          console.warn("PathIntersect: パス同士が重なりません。空パスを返します。")
          return emptyPath
        }
      } catch (uniteError) {
        // Path.uniteも失敗した場合は空パスを返す
        console.warn("PathIntersect: 交差判定に失敗しました。空パスを返します。")
        return emptyPath
      }
    } else {
      // 予期しないエラーの場合は再スローする
      throw e
    }
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
}

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
export const PathSubtract = (pathA: PavePath, pathB: PavePath): PavePath => {
  // External library interface (pave.js) - return values are typed but ESLint sees them as any
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
  const emptyPath = createCircle([0, 0], 0)

  if (!pathA || !pathB) {
    console.warn("PathSubtract: pathA または pathB が無効です。")
    return emptyPath
  }

  try {
    const result = subtractPaths(pathA, [pathB])
    if (!result || !hasCurves(result)) {
      console.warn("PathSubtract: 結果のパスが無効です。")
      return emptyPath
    }
    return result
  } catch (e) {
    // Path.subtractでエラーが発生した場合
    if (e instanceof TypeError && e.message.includes("Cannot read properties of undefined")) {
      console.warn("PathSubtract: パス減算に失敗しました。空パスを返します。")
      return emptyPath
    } else {
      // 予期しないエラーの場合は再スローする
      throw e
    }
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
}

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
export const PathExclude = (pathA: PavePath, pathB: PavePath): PavePath => {
  // External library interface (pave.js) - return values are typed but ESLint sees them as any
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
  const emptyPath = createCircle([0, 0], 0)

  if (!pathA || !pathB) {
    console.warn("PathExclude: pathA または pathB が無効です。")
    return emptyPath
  }

  const united = unitePaths([pathA, pathB])
  if (!united || !hasCurves(united)) {
    console.warn("PathExclude: 統合されたパスが無効です。")
    return emptyPath
  }

  const intersected = PathIntersect(pathA, pathB)
  if (!intersected || !hasCurves(intersected)) {
    console.warn("PathExclude: 交差しているパスが無効です。")
    return emptyPath
  }

  try {
    const excluded = subtractPaths(united, [intersected])
    if (!excluded || !hasCurves(excluded)) {
      console.warn("PathExclude: 除外されたパスが無効です。")
      return emptyPath
    }
    return excluded
  } catch (e) {
    // Path.subtractでエラーが発生した場合（完全重複など）
    if (e instanceof TypeError && e.message.includes("Cannot read properties of undefined")) {
      console.warn("PathExclude: 交差部分が全体と一致します。空パスを返します。")
      return emptyPath
    } else {
      // 予期しないエラーの場合は再スローする
      throw e
    }
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
}

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
export const isPathsOverlap = (pathA: PavePath, pathB: PavePath): boolean => {
  // パスの有効性チェック
  if (!pathA || !pathB || !hasCurves(pathA) || !hasCurves(pathB)) {
    console.warn("isPathsOverlap: 無効なパスが渡されました")
    return false
  }

  // PathIntersect を使って交差部分を計算
  const intersection = PathIntersect(pathA, pathB)

  // 交差部分が空かどうかをチェック
  if (!hasCurves(intersection) || intersection.curves.length === 0) {
    return false
  }

  // 交差部分の bounds をチェックして、実質的に面積があるか確認
  // (半径0の円などの退化したケースを除外)
  try {
    const bounds = getPathBounds(intersection)
    const width = bounds[1][0] - bounds[0][0]
    const height = bounds[1][1] - bounds[0][1]

    // 面積が実質的に0より大きいかチェック (浮動小数点誤差を考慮)
    return width > 1e-10 && height > 1e-10
  } catch (e) {
    // bounds 取得に失敗した場合は false を返す
    console.warn("⚠️ isPathsOverlap: 交差部分の bounds 取得に失敗", e)
    return false
  }
}

// ============================================
// PathOffset: Path offset using paperjs-offset
// ============================================

// Internal state for Paper.js initialization
let paperInitialized = false
let paperCanvas: HTMLCanvasElement | null = null

/**
 * Initialize Paper.js if not already initialized
 */
function ensurePaperInitialized(): boolean {
  const paperInstance = getPaper()
  if (!paperInstance) {
    return false
  }
  if (!paperInitialized) {
    paperCanvas = document.createElement('canvas')
    paperInstance.setup(paperCanvas)
    paperInitialized = true
  }
  return true
}

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
export function cleanupPaperResources(): void {
  const paperInstance = getPaper()
  if (paperInstance?.project) {
    paperInstance.project.clear()
  }
  paperCanvas = null
  paperInitialized = false
}

/**
 * Convert Pave.js path to Paper.js 0.12.4 path
 * @internal
 */
function paveToPaper(pavePath: PavePath): PaperPath | null {
  const paperInstance = getPaper()
  if (!paperInstance) {
    return null
  }
  try {
    const PathGlobal = getPath()
    const pathData = PathGlobal.toSVGString(pavePath)

    if (!pathData) {
      console.warn('PathOffset: Empty path data')
      return null
    }

    // Create a full SVG element for proper import
    const svgString = `<svg><path d="${pathData}"/></svg>`

    // Use importSVG which properly initializes all path properties including curves
    const imported: PaperItem = paperInstance.project.importSVG(svgString)

    // Get the actual path from the imported group
    let resultPath: PaperPath | null = null

    if (imported.children && imported.children.length > 0) {
      // SVG import creates a group, get the first path child
      const child = imported.children[0]
      if (child) {
        // Clone the path before removing the parent to preserve it
        resultPath = child.clone()
      }
    } else if (imported.firstChild) {
      resultPath = imported.firstChild.clone()
    } else {
      resultPath = imported
    }

    // Remove the imported group from the project to avoid memory leaks
    // (the cloned path is now independent)
    imported.remove()

    return resultPath
  } catch (e) {
    console.warn('PathOffset: Pave→Paper conversion failed', e)
    return null
  }
}

/**
 * Convert Paper.js path to Pave.js path via segment iteration
 * This avoids SVG V/H commands that Pave.js doesn't support
 * @internal
 */
function paperToPave(paperPath: PaperPath): PavePath {
  interface PaveVertex {
    point: [number, number]
    command: 'L' | 'C'
    args?: [[number, number], [number, number]]
  }

  interface PaveCurve {
    vertices: PaveVertex[]
    closed: boolean
  }

  const curves: PaveCurve[] = []

  // Handle CompoundPath (multiple children) or single Path
  const paths = paperPath.children ? paperPath.children : [paperPath]

  for (const path of paths) {
    const vertices: PaveVertex[] = []
    const segments = path.segments

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]
      if (!seg) continue

      const point: [number, number] = [seg.point.x, seg.point.y]

      if (i === 0) {
        vertices.push({ point, command: 'L' })
      } else {
        const prevSeg = segments[i - 1]
        if (!prevSeg) continue

        const hasHandles = !prevSeg.handleOut.isZero() || !seg.handleIn.isZero()

        if (hasHandles) {
          const cp1: [number, number] = [
            prevSeg.point.x + prevSeg.handleOut.x,
            prevSeg.point.y + prevSeg.handleOut.y
          ]
          const cp2: [number, number] = [
            seg.point.x + seg.handleIn.x,
            seg.point.y + seg.handleIn.y
          ]
          vertices.push({ point, command: 'C', args: [cp1, cp2] })
        } else {
          vertices.push({ point, command: 'L' })
        }
      }
    }

    // Handle closing segment for closed paths
    if (path.closed && segments.length > 0 && vertices.length > 0) {
      const lastSeg = segments[segments.length - 1]
      const firstSeg = segments[0]
      const firstVertex = vertices[0]

      if (lastSeg && firstSeg && firstVertex) {
        const hasHandles = !lastSeg.handleOut.isZero() || !firstSeg.handleIn.isZero()

        if (hasHandles) {
          const cp1: [number, number] = [
            lastSeg.point.x + lastSeg.handleOut.x,
            lastSeg.point.y + lastSeg.handleOut.y
          ]
          const cp2: [number, number] = [
            firstSeg.point.x + firstSeg.handleIn.x,
            firstSeg.point.y + firstSeg.handleIn.y
          ]
          vertices[0] = { point: firstVertex.point, command: 'C', args: [cp1, cp2] }
        }
      }
    }

    curves.push({ vertices, closed: path.closed })
  }

  return { curves } as PavePath
}

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
export const PathOffset = (
  path: PavePath,
  distance: number,
  options?: { join?: 'miter' | 'bevel' | 'round'; cap?: 'butt' | 'round' | 'square' }
): PavePath => {
  // Check if dependencies are available
  const paperInstance = getPaper()
  const paperOffsetInstance = getPaperOffset()
  if (!paperInstance) {
    console.warn('PathOffset: paper.js 0.12.4 is not loaded. Returning original path.')
    return path
  }
  if (!paperOffsetInstance) {
    console.warn('PathOffset: paperjs-offset is not loaded. Returning original path.')
    return path
  }

  // Ensure Paper.js is initialized
  if (!ensurePaperInitialized()) {
    console.warn('PathOffset: Failed to initialize Paper.js. Returning original path.')
    return path
  }

  // Convert Pave path to Paper.js path
  const paperPath = paveToPaper(path)
  if (!paperPath) {
    console.warn('PathOffset: Failed to convert path. Returning original path.')
    return path
  }

  try {
    // Apply offset using paperjs-offset
    const offsetted = paperOffsetInstance.offset(paperPath, distance, options)

    // Convert back to Pave path
    const result = paperToPave(offsetted)
    return result
  } catch (e) {
    console.warn('PathOffset: Offset operation failed', e)
    return path
  }
}
