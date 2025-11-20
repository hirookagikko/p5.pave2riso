/**
 * Font utilities for converting OpenType.js font paths to pave.js paths
 *
 * This module provides functions to convert OpenType.js font commands
 * into pave.js Path objects with proper handling of holes and compound paths.
 */

import type { PavePath } from '../types/core.js'
import {
  getPathBounds,
  createLine,
  createCubicBezier,
  createQuadraticBezier,
  joinPaths,
  closePath,
  createEmptyPath,
  unitePaths,
  subtractPaths
} from './pave-wrapper.js'

/**
 * OpenType.js command types
 */
interface OTCommand {
  type: 'M' | 'L' | 'C' | 'Q' | 'Z'
  x: number
  y: number
  x1?: number
  y1?: number
  x2?: number
  y2?: number
}

/**
 * Path information with metadata
 */
interface PathInfo {
  path: PavePath
  area: number
  winding: number
  bounds: [[number, number], [number, number]]
}

/**
 * Options for ot2pave conversion
 */
interface Ot2paveOptions {
  /**
   * Optional array to store individual paths for debugging
   */
  debugPaths?: PathInfo[] | null
}

/**
 * Bounds type: [[minX, minY], [maxX, maxY]]
 */
type Bounds = [[number, number], [number, number]]

/**
 * Bounds relation types
 */
type BoundsRelation = 'CONTAINED' | 'OVERLAP' | 'INDEPENDENT'

/**
 * Path operation types
 */
type PathOperation = 'SUBTRACT' | 'UNITE'

/**
 * Calculates the area of a path using bounding box approximation
 *
 * @param path - Path to calculate area for
 * @returns Approximate area
 */
const getPathArea = (path: PavePath): number => {
  if (!path?.curves || path.curves.length === 0) return 0
  const bounds = getPathBounds(path)
  const width = bounds[1][0] - bounds[0][0]
  const height = bounds[1][1] - bounds[0][1]
  return width * height
}

/**
 * Determines the winding direction of a path using the Shoelace formula
 *
 * In a coordinate system where Y-axis points down (like pave.js/p5.js):
 * - Positive signed area = Counter-clockwise (CCW) = hole
 * - Negative signed area = Clockwise (CW) = solid
 *
 * @param path - Path to analyze
 * @returns Signed area (positive = CCW, negative = CW)
 */
const getPathWindingDirection = (path: PavePath): number => {
  if (!path?.curves || path.curves.length === 0) return 0

  let signedArea = 0

  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  /* eslint-disable @typescript-eslint/no-unsafe-member-access */

  // 各curveのポイントを取得して面積を計算
  for (let i = 0; i < path.curves.length; i++) {
    const curve = path.curves[i]

    // curveが配列の場合（各要素がセグメント）
    if (Array.isArray(curve)) {
      // 各セグメントから頂点を抽出
      for (let j = 0; j < curve.length; j++) {
        const segment = curve[j]
        const nextSegment = curve[(j + 1) % curve.length]

        // セグメントの最初の点を取得
        let x1: number | undefined, y1: number | undefined
        let x2: number | undefined, y2: number | undefined

        if (Array.isArray(segment) && segment.length >= 2) {
          x1 = segment[0]
          y1 = segment[1]
        } else if (segment && typeof segment === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          x1 = (segment).x ?? (segment)[0]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          y1 = (segment).y ?? (segment)[1]
        }

        if (Array.isArray(nextSegment) && nextSegment.length >= 2) {
          x2 = nextSegment[0]
          y2 = nextSegment[1]
        } else if (nextSegment && typeof nextSegment === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          x2 = (nextSegment).x ?? (nextSegment)[0]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          y2 = (nextSegment).y ?? (nextSegment)[1]
        }

        if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
          signedArea += (x1 * y2 - x2 * y1)
        }
      }
    }
    // curveがverticesプロパティを持つオブジェクトの場合
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    else if ((curve as any).vertices && Array.isArray((curve as any).vertices)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vertices = (curve as any).vertices

      // Shoelace formula: 各頂点ペアで計算
      // vertices[i] は {point: [x, y], command: 'L'} 形式
      for (let j = 0; j < vertices.length; j++) {
        const current = vertices[j]
        const next = vertices[(j + 1) % vertices.length]

        // point プロパティから座標を取得
        const x1 = current.point[0]
        const y1 = current.point[1]
        const x2 = next.point[0]
        const y2 = next.point[1]

        signedArea += (x1 * y2 - x2 * y1)
      }
    }
  }

  // 符号付き面積を2で割る
  signedArea = signedArea / 2

  // Y軸が下向きの座標系（pave.js/p5.js）では符号が逆になる：
  // 正の値 = 時計回り (CW) = 本体
  // 負の値 = 反時計回り (CCW) = 穴
  // したがって符号を反転して返す
  return -signedArea

  /* eslint-enable @typescript-eslint/no-unsafe-assignment */
  /* eslint-enable @typescript-eslint/no-unsafe-member-access */
}

/**
 * Checks if two bounding boxes overlap
 *
 * @param bounds1 - First bounding box
 * @param bounds2 - Second bounding box
 * @returns true if boxes overlap
 */
const boundsOverlap = (bounds1: Bounds, bounds2: Bounds): boolean => {
  const overlapX = bounds1[0][0] < bounds2[1][0] && bounds1[1][0] > bounds2[0][0]
  const overlapY = bounds1[0][1] < bounds2[1][1] && bounds1[1][1] > bounds2[0][1]
  return overlapX && overlapY
}

/**
 * Determines the relationship between two bounding boxes
 *
 * @param bounds1 - First bounding box
 * @param bounds2 - Second bounding box
 * @returns Relationship type
 */
const checkBoundsRelation = (bounds1: Bounds, bounds2: Bounds): BoundsRelation => {
  // 重なっていない場合
  if (!boundsOverlap(bounds1, bounds2)) {
    return 'INDEPENDENT'
  }

  // bounds2がbounds1に完全に含まれているかチェック
  const bounds2InBounds1 =
    bounds2[0][0] >= bounds1[0][0] && // minX
    bounds2[0][1] >= bounds1[0][1] && // minY
    bounds2[1][0] <= bounds1[1][0] && // maxX
    bounds2[1][1] <= bounds1[1][1]    // maxY

  if (bounds2InBounds1) {
    return 'CONTAINED'
  }

  // 部分的な重なり
  return 'OVERLAP'
}

/**
 * Determines which path operation to use (SUBTRACT or UNITE)
 *
 * @param largerPath - Larger path (by area)
 * @param smallerPath - Smaller path (by area)
 * @param largerOriginalWinding - Original winding of larger path (if known)
 * @param smallerOriginalWinding - Original winding of smaller path (if known)
 * @returns Operation to perform
 */
const determinePathOperation = (
  largerPath: PavePath,
  smallerPath: PavePath,
  largerOriginalWinding: number | null = null,
  smallerOriginalWinding: number | null = null
): PathOperation => {
  const largerBounds = getPathBounds(largerPath)
  const smallerBounds = getPathBounds(smallerPath)
  const largerArea = getPathArea(largerPath)
  const smallerArea = getPathArea(smallerPath)
  const largerWinding = largerOriginalWinding ?? getPathWindingDirection(largerPath)
  const smallerWinding = smallerOriginalWinding ?? getPathWindingDirection(smallerPath)

  const relation = checkBoundsRelation(largerBounds, smallerBounds)
  const areaRatio = smallerArea / largerArea
  const windingsSame = (largerWinding > 0 && smallerWinding > 0) ||
                       (largerWinding <= 0 && smallerWinding <= 0)

  console.log(`  determinePathOperation:`)
  console.log(`    Relation: ${relation}`)
  console.log(`    Area ratio: ${areaRatio.toFixed(3)}`)
  console.log(`    Larger bounds: [${largerBounds[0][0].toFixed(1)}, ${largerBounds[0][1].toFixed(1)}] to [${largerBounds[1][0].toFixed(1)}, ${largerBounds[1][1].toFixed(1)}]`)
  console.log(`    Smaller bounds: [${smallerBounds[0][0].toFixed(1)}, ${smallerBounds[0][1].toFixed(1)}] to [${smallerBounds[1][0].toFixed(1)}, ${smallerBounds[1][1].toFixed(1)}]`)
  console.log(`    Larger winding: ${largerWinding > 0 ? 'CCW' : 'CW'}${largerOriginalWinding !== null ? ' (original)' : ''} (value: ${largerWinding.toFixed(2)})`)
  console.log(`    Smaller winding: ${smallerWinding > 0 ? 'CCW' : 'CW'} (value: ${smallerWinding.toFixed(2)})`)
  console.log(`    Windings same: ${windingsSame}`)

  if (relation === 'INDEPENDENT') {
    console.log(`  → UNITE (independent paths)`)
    return 'UNITE'
  }

  if (relation === 'CONTAINED') {
    // より正確な包含判定：SUBTRACTを試して、実際に穴として機能するかチェック
    let fullyContained = true
    try {
      // External library interface (pave.js) - return values are typed but ESLint sees them as any
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
      const subtracted = subtractPaths(largerPath, [smallerPath])
      if (subtracted?.curves && subtracted.curves.length > 0) {
        // SUBTRACTの結果のcurve数が増えたら、実際に穴として機能している
        const largerCurves = largerPath.curves ? largerPath.curves.length : 0
        const subtractedCurves = subtracted.curves ? subtracted.curves.length : 0
        fullyContained = subtractedCurves > largerCurves
        console.log(`    Larger curves: ${largerCurves}, Subtracted curves: ${subtractedCurves}`)
        console.log(`    Fully contained: ${fullyContained}`)
      } else {
        // SUBTRACT の結果が空なら、完全に外側にある
        fullyContained = false
        console.log(`    Subtract resulted in empty path - smaller is outside`)
        console.log(`    Fully contained: ${fullyContained}`)
      }
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
    } catch (e) {
      console.warn(`    Warning: Path.subtract check failed, using bounds-based判定`, (e as Error).message)
      // エラーの場合はbounding boxベースの判定にフォールバック
      fullyContained = true
    }

    // 完全に包含されていない場合（はみ出している）は solid として扱う
    if (!fullyContained) {
      console.log(`  → UNITE (contained by bounds but protruding from actual path - treating as solid)`)
      return 'UNITE'
    }

    // 完全に包含されている場合は、元のロジックで判定
    // 巻き方向が異なる場合、smallerを穴として扱う
    if (!windingsSame) {
      console.log(`  → SUBTRACT (fully contained, opposite winding - treating smaller as hole)`)
      return 'SUBTRACT'
    }
    // 巻き方向が同じ場合は、smallerの巻き方向で判定
    if (smallerWinding > 0) {
      // CCW = 穴 → SUBTRACT
      console.log(`  → SUBTRACT (fully contained, same winding but smaller is CCW hole)`)
      return 'SUBTRACT'
    } else {
      // CW = ソリッド → UNITE
      console.log(`  → UNITE (fully contained, same winding and smaller is CW solid)`)
      return 'UNITE'
    }
  }

  // OVERLAP
  if (windingsSame) {
    console.log(`  → UNITE (overlap, same winding)`)
    return 'UNITE'
  } else {
    // 巻き方向が逆でも、飛び出している場合は統合
    console.log(`  → UNITE (overlap, opposite winding but protruding)`)
    return 'UNITE'
  }
}

/**
 * Converts OpenType.js font commands to a pave.js Path
 *
 * This function handles the complex task of converting font outlines to paths,
 * including proper handling of:
 * - Multiple contours (outer shapes and holes)
 * - Winding direction detection
 * - Path union and subtraction operations
 * - Edge cases and error conditions
 *
 * Algorithm overview:
 * 1. Collect all individual paths from OpenType commands
 * 2. Sort paths by area (largest first)
 * 3. Use largest path as base (always treated as solid)
 * 4. Sequentially integrate remaining paths based on their relationship to the result
 *
 * @param commands - Array of OpenType.js path commands
 * @param options - Conversion options
 * @returns Combined pave.js Path
 *
 * @example
 * ```typescript
 * // Load font with opentype.js
 * const font = opentype.load('font.ttf')
 * const path = font.getPath('A', 0, 100, 72)
 * const pavePath = ot2pave(path.commands)
 * ```
 */
export const ot2pave = (commands: OTCommand[], options: Ot2paveOptions = {}): PavePath => {
  const debugPaths = options.debugPaths ?? null

  // フェーズ1: 全パスを収集
  const allPaths: PathInfo[] = []
  let tempPath: PavePath[] = [] // 処理用の一時的なパス
  let presentPos: [number, number] = [0, 0] // 現在の座標

  console.log('\n=== PHASE 1: Collecting all paths ===')

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i]
    if (!cmd) continue
    switch(cmd.type) {
      case 'M': { // MoveTo
        // If we have accumulated paths and encounter a new MoveTo,
        // the previous path is implicitly closed (for OpenType.js without explicit Z commands)
        if (tempPath.length > 0) {
          // External library interface (pave.js) - return values are typed but ESLint sees them as any
          /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
          const newPath = closePath(joinPaths(tempPath), {fuse: false, group: -1})
          const newArea = getPathArea(newPath)
          const newWinding = getPathWindingDirection(newPath)
          const newBounds = getPathBounds(newPath)

          allPaths.push({
            path: newPath,
            area: newArea,
            winding: newWinding,
            bounds: newBounds
          })

          console.log(`Path ${allPaths.length} (implicit close): area=${newArea.toFixed(2)}, winding=${newWinding > 0 ? 'CCW' : 'CW'} (value: ${newWinding.toFixed(2)})`)

          // デバッグモード：個別パスを記録
          if (debugPaths) {
            debugPaths.push({
              path: newPath,
              area: newArea,
              winding: newWinding,
              bounds: newBounds
            })
          }
          /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */

          tempPath = []
        }
        break
      }
      case 'Z': { // ClosePath
        // External library interface (pave.js) - return values are typed but ESLint sees them as any
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
        const newPath = closePath(joinPaths(tempPath), {fuse: false, group: -1})
        const newArea = getPathArea(newPath)
        const newWinding = getPathWindingDirection(newPath)
        const newBounds = getPathBounds(newPath)

        allPaths.push({
          path: newPath,
          area: newArea,
          winding: newWinding,
          bounds: newBounds
        })

        console.log(`Path ${allPaths.length}: area=${newArea.toFixed(2)}, winding=${newWinding > 0 ? 'CCW' : 'CW'} (value: ${newWinding.toFixed(2)})`)

        // デバッグモード：個別パスを記録
        if (debugPaths) {
          debugPaths.push({
            path: newPath,
            area: newArea,
            winding: newWinding,
            bounds: newBounds
          })
        }
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */

        tempPath = []
        break
      }
      case 'L': // LineTo
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        tempPath.push(createLine(presentPos, [cmd.x, cmd.y]))
        break
      case 'C': // CubicBezier
        if (cmd.x1 !== undefined && cmd.y1 !== undefined && cmd.x2 !== undefined && cmd.y2 !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          tempPath.push(createCubicBezier(
            presentPos,
            [cmd.x1, cmd.y1],
            [cmd.x2, cmd.y2],
            [cmd.x, cmd.y]
          ))
        }
        break
      case 'Q': // QuadraticBezier
        if (cmd.x1 !== undefined && cmd.y1 !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          tempPath.push(createQuadraticBezier(
            presentPos,
            [cmd.x1, cmd.y1],
            [cmd.x, cmd.y]
          ))
        }
        break
      default:
        console.warn(`Unknown command type: ${cmd.type}`, cmd)
        break
    }
    // Update position only if the command has valid x, y coordinates
    if (cmd.x !== undefined && cmd.y !== undefined) {
      presentPos = [cmd.x, cmd.y]
    }
  }

  // After processing all commands, close any remaining path
  if (tempPath.length > 0) {
    // External library interface (pave.js) - return values are typed but ESLint sees them as any
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
    const newPath = closePath(joinPaths(tempPath), {fuse: false, group: -1})
    const newArea = getPathArea(newPath)
    const newWinding = getPathWindingDirection(newPath)
    const newBounds = getPathBounds(newPath)

    allPaths.push({
      path: newPath,
      area: newArea,
      winding: newWinding,
      bounds: newBounds
    })

    console.log(`Path ${allPaths.length} (final close): area=${newArea.toFixed(2)}, winding=${newWinding > 0 ? 'CCW' : 'CW'} (value: ${newWinding.toFixed(2)})`)

    // デバッグモード：個別パスを記録
    if (debugPaths) {
      debugPaths.push({
        path: newPath,
        area: newArea,
        winding: newWinding,
        bounds: newBounds
      })
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
  }

  // パスが1つもない場合は空のパスを返す
  if (allPaths.length === 0) {
    console.warn('⚠️ No paths found in commands')
    // External library interface (pave.js) - return values are typed but ESLint sees them as any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return createEmptyPath()
  }

  // フェーズ2: 面積の大きい順にソート
  console.log('\n=== PHASE 2: Sorting by area (largest first) ===')
  allPaths.sort((a, b) => b.area - a.area)

  for (let i = 0; i < allPaths.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const path = allPaths[i]!
    console.log(`Sorted[${i}]: area=${path.area.toFixed(2)}, winding=${path.winding > 0 ? 'CCW' : 'CW'} (value: ${path.winding.toFixed(2)})`)
  }

  // フェーズ3: 最大パスをベースに設定（巻き方向に関わらず無条件でsolid扱い）
  console.log('\n=== PHASE 3: Setting base path (largest) ===')
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const firstPath = allPaths[0]!
  let result = firstPath.path
  let resultWinding = firstPath.winding // 結果パスの巻き方向を追跡
  console.log(`Base path: area=${firstPath.area.toFixed(2)}, winding=${firstPath.winding > 0 ? 'CCW' : 'CW'} (value: ${firstPath.winding.toFixed(2)})`)
  console.log('Note: Largest path is always treated as solid (base), regardless of winding direction')

  // フェーズ4: 逐次統合
  console.log('\n=== PHASE 4: Sequential integration ===')
  for (let i = 1; i < allPaths.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentPath = allPaths[i]!
    console.log(`\n--- Processing path ${i}/${allPaths.length - 1} ---`)
    console.log(`  Current path: area=${currentPath.area.toFixed(2)}, winding=${currentPath.winding > 0 ? 'CCW' : 'CW'} (value: ${currentPath.winding.toFixed(2)})`)
    console.log(`  Result winding before operation: ${resultWinding > 0 ? 'CCW' : 'CW'} (value: ${resultWinding.toFixed(2)})`)

    // 常に追跡している巻き方向を使用（元の巻き方向を保持）
    const largerOriginalWinding = resultWinding
    const smallerOriginalWinding = currentPath.winding // 常に元の巻き方向を使用
    const operation = determinePathOperation(result, currentPath.path, largerOriginalWinding, smallerOriginalWinding)

    if (operation === 'SUBTRACT') {
      const before = result
      const beforeWinding = resultWinding
      // External library interface (pave.js) - return values are typed but ESLint sees them as any
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
      result = subtractPaths(result, [currentPath.path])

      // 結果が空でないかチェック
      if (!result?.curves || result.curves.length === 0) {
        console.warn('⚠️ SUBTRACT resulted in empty path, keeping previous result')
        result = before
      } else {
        // 結果の巻き方向を更新（Pave.jsがパスを正規化する可能性があるため）
        resultWinding = getPathWindingDirection(result)
        const resultArea = getPathArea(result)
        console.log(`  Result winding after SUBTRACT: ${resultWinding > 0 ? 'CCW' : 'CW'} (value: ${resultWinding.toFixed(2)}) ${beforeWinding !== resultWinding ? '(CHANGED from ' + (beforeWinding > 0 ? 'CCW' : 'CW') + ')' : ''}`)
        console.log(`  Result area: ${resultArea.toFixed(2)}, curves: ${result.curves ? result.curves.length : 0}`)
      }
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
    } else if (operation === 'UNITE') {
      const before = result
      const beforeWinding = resultWinding
      // External library interface (pave.js) - return values are typed but ESLint sees them as any
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
      result = unitePaths([result, currentPath.path])

      // 結果が空でないかチェック
      if (!result?.curves || result.curves.length === 0) {
        console.warn('⚠️ UNITE resulted in empty path, keeping previous result')
        result = before
      } else {
        // 結果の巻き方向を更新（Pave.jsがパスを正規化する可能性があるため）
        resultWinding = getPathWindingDirection(result)
        const resultArea = getPathArea(result)
        const beforeArea = getPathArea(before)
        console.log(`  Result winding after UNITE: ${resultWinding > 0 ? 'CCW' : 'CW'} (value: ${resultWinding.toFixed(2)}) ${beforeWinding !== resultWinding ? '(CHANGED from ' + (beforeWinding > 0 ? 'CCW' : 'CW') + ')' : ''}`)
        console.log(`  Result area: ${resultArea.toFixed(2)} (before: ${beforeArea.toFixed(2)}), curves: ${result.curves ? result.curves.length : 0}`)
      }
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
    }
  }

  console.log('\n=== FINAL RESULT ===')
  console.log(`Final path curves: ${result.curves ? result.curves.length : 0}`)

  return result
}
