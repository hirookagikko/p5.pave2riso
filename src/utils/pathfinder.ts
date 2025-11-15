/**
 * Pathfinder utilities for path boolean operations
 *
 * These functions provide safe wrappers around pave.js Path operations
 * with comprehensive error handling and edge case detection.
 */

import type { PavePath } from '../types/core.js'
import {
  createCircle,
  subtractPaths,
  unitePaths,
  getPathBounds
} from './pave-wrapper.js'

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
 * Uses Path.subtract to detect if paths share any area.
 * Falls back to bounding box overlap detection if Path.subtract fails.
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

  console.log(`  Checking overlap: pathA curves=${pathA.curves.length}, pathB curves=${pathB.curves.length}`)

  try {
    // External library interface (pave.js) - return values are typed but ESLint sees them as any
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
    const subtracted = subtractPaths(pathA, [pathB]) // 実際にsubtractしたパス

    if (!hasCurves(subtracted)) {
      console.log(`  → Subtracted path has no curves`)
      return false
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */

    console.log(`  subtracted curves: ${subtracted.curves.length}`)

    // pathAとsubtractしたパスのcurvesの数が違う場合は重なっている
    if (subtracted.curves.length !== pathA.curves.length) {
      console.log(`  → Overlap detected (curves changed: ${pathA.curves.length} → ${subtracted.curves.length})`)
      return true
    } else {
      console.log(`  → No overlap (curves unchanged: ${pathA.curves.length})`)
      return false
    }
  } catch (e) {
    // Path.subtractでエラーが発生した場合、バウンディングボックスで重なりを判定
    if (e instanceof TypeError && e.message.includes("Cannot read properties of undefined")) {
      console.warn("⚠️ isPathsOverlap: Path.subtractでエラー発生。バウンディングボックスで判定します", e.message)

      // バウンディングボックスを取得
      const boundsA = getPathBounds(pathA)
      const boundsB = getPathBounds(pathB)

      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`  boundsA: [${boundsA[0].join(', ')}, ${boundsA[1].join(', ')}]`)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`  boundsB: [${boundsB[0].join(', ')}, ${boundsB[1].join(', ')}]`)

      // バウンディングボックスの重なりをチェック
      const overlapX = boundsA[0][0] < boundsB[1][0] && boundsA[1][0] > boundsB[0][0]
      const overlapY = boundsA[0][1] < boundsB[1][1] && boundsA[1][1] > boundsB[0][1]
      const boundsOverlap = overlapX && overlapY

      console.log(`  → Bounds overlap: ${boundsOverlap}`)
      return boundsOverlap
    } else {
      // 予期しないエラーの場合は再スロー
      throw e
    }
  }
}
