/**
 * ot2pave - OpenType.js to Pave.js Path Converter
 *
 * Converts OpenType.js font commands to Pave.js Path objects.
 * Handles compound paths (holes in letters like 'e', 'o', 'a') correctly.
 *
 * @module ot2pave
 * @license MIT
 */

/**
 * Create ot2pave converter with dependency injection
 *
 * @param {object} deps - Dependencies
 * @param {object} deps.Path - Pave.js Path static object (from @baku89/pave)
 * @returns {Function} ot2pave function
 *
 * @example
 * import { Path } from '@baku89/pave'
 * import opentype from 'opentype.js'
 * import { createOt2pave } from './ot2pave/index.js'
 *
 * const ot2pave = createOt2pave({ Path })
 *
 * const font = await opentype.load('font.ttf')
 * const otPath = font.getPath('Hello', 0, 100, 72)
 * const pavePath = ot2pave(otPath.commands)
 */
export function createOt2pave(deps) {
  const { Path } = deps

  if (!Path) {
    throw new Error('ot2pave: Path dependency is required')
  }

  // ============================================
  // Path operation wrappers
  // ============================================

  /**
   * Get path bounds
   * @param {object} path
   * @returns {[[number, number], [number, number]]}
   */
  function getPathBounds(path) {
    return Path.bounds(path)
  }

  /**
   * Create line segment
   * @param {[number, number]} start
   * @param {[number, number]} end
   * @returns {object}
   */
  function createLine(start, end) {
    return Path.line(start, end)
  }

  /**
   * Create cubic bezier segment
   * @param {[number, number]} start
   * @param {[number, number]} control1
   * @param {[number, number]} control2
   * @param {[number, number]} end
   * @returns {object}
   */
  function createCubicBezier(start, control1, control2, end) {
    return Path.cubicBezier(start, control1, control2, end)
  }

  /**
   * Create quadratic bezier segment
   * @param {[number, number]} start
   * @param {[number, number]} control
   * @param {[number, number]} end
   * @returns {object}
   */
  function createQuadraticBezier(start, control, end) {
    return Path.quadraticBezier(start, control, end)
  }

  /**
   * Join multiple paths
   * @param {object[]} paths
   * @returns {object}
   */
  function joinPaths(paths) {
    return Path.join(paths)
  }

  /**
   * Close a path
   * @param {object} path
   * @param {object} options
   * @returns {object}
   */
  function closePath(path, options) {
    return Path.close(path, options)
  }

  /**
   * Create empty path (zero-radius circle)
   * @returns {object}
   */
  function createEmptyPath() {
    return Path.circle([0, 0], 0)
  }

  /**
   * Unite multiple paths
   * @param {object[]} paths
   * @returns {object}
   */
  function unitePaths(paths) {
    return Path.unite(paths)
  }

  /**
   * Subtract paths from a base path
   * @param {object} path
   * @param {object[]} subtrahends
   * @returns {object}
   */
  function subtractPaths(path, subtrahends) {
    return Path.subtract(path, subtrahends)
  }

  // ============================================
  // Helper functions
  // ============================================

  /**
   * Calculate approximate area using bounding box
   * @param {object} path
   * @returns {number}
   */
  function getPathArea(path) {
    if (!path?.curves || path.curves.length === 0) return 0
    const bounds = getPathBounds(path)
    const width = bounds[1][0] - bounds[0][0]
    const height = bounds[1][1] - bounds[0][1]
    return width * height
  }

  /**
   * Determine winding direction using Shoelace formula
   *
   * In Y-down coordinate system (pave.js/p5.js):
   * - Positive = Counter-clockwise (CCW) = hole
   * - Negative = Clockwise (CW) = solid
   *
   * @param {object} path
   * @returns {number} Signed area
   */
  function getPathWindingDirection(path) {
    if (!path?.curves || path.curves.length === 0) return 0

    let signedArea = 0

    for (let i = 0; i < path.curves.length; i++) {
      const curve = path.curves[i]

      // Handle array format curve
      if (Array.isArray(curve)) {
        for (let j = 0; j < curve.length; j++) {
          const segment = curve[j]
          const nextSegment = curve[(j + 1) % curve.length]

          let x1, y1, x2, y2

          if (Array.isArray(segment) && segment.length >= 2) {
            x1 = segment[0]
            y1 = segment[1]
          } else if (segment && typeof segment === 'object') {
            x1 = segment.x ?? segment[0]
            y1 = segment.y ?? segment[1]
          }

          if (Array.isArray(nextSegment) && nextSegment.length >= 2) {
            x2 = nextSegment[0]
            y2 = nextSegment[1]
          } else if (nextSegment && typeof nextSegment === 'object') {
            x2 = nextSegment.x ?? nextSegment[0]
            y2 = nextSegment.y ?? nextSegment[1]
          }

          if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
            signedArea += (x1 * y2 - x2 * y1)
          }
        }
      }
      // Handle curve with vertices property
      else if (curve?.vertices && Array.isArray(curve.vertices)) {
        const vertices = curve.vertices

        for (let j = 0; j < vertices.length; j++) {
          const current = vertices[j]
          const next = vertices[(j + 1) % vertices.length]

          const x1 = current.point[0]
          const y1 = current.point[1]
          const x2 = next.point[0]
          const y2 = next.point[1]

          signedArea += (x1 * y2 - x2 * y1)
        }
      }
    }

    // Divide by 2 for actual area, negate for Y-down coordinate system
    return -(signedArea / 2)
  }

  /**
   * Check if two bounding boxes overlap
   * @param {[[number, number], [number, number]]} bounds1
   * @param {[[number, number], [number, number]]} bounds2
   * @returns {boolean}
   */
  function boundsOverlap(bounds1, bounds2) {
    const overlapX = bounds1[0][0] < bounds2[1][0] && bounds1[1][0] > bounds2[0][0]
    const overlapY = bounds1[0][1] < bounds2[1][1] && bounds1[1][1] > bounds2[0][1]
    return overlapX && overlapY
  }

  /**
   * Determine relationship between two bounding boxes
   * @param {[[number, number], [number, number]]} bounds1
   * @param {[[number, number], [number, number]]} bounds2
   * @returns {'CONTAINED' | 'OVERLAP' | 'INDEPENDENT'}
   */
  function checkBoundsRelation(bounds1, bounds2) {
    if (!boundsOverlap(bounds1, bounds2)) {
      return 'INDEPENDENT'
    }

    // Check if bounds2 is fully contained in bounds1
    const bounds2InBounds1 =
      bounds2[0][0] >= bounds1[0][0] &&
      bounds2[0][1] >= bounds1[0][1] &&
      bounds2[1][0] <= bounds1[1][0] &&
      bounds2[1][1] <= bounds1[1][1]

    if (bounds2InBounds1) {
      return 'CONTAINED'
    }

    return 'OVERLAP'
  }

  /**
   * Determine which Boolean operation to use
   * @param {object} largerPath
   * @param {object} smallerPath
   * @param {number|null} largerOriginalWinding
   * @param {number|null} smallerOriginalWinding
   * @param {object} options - Debug options
   * @returns {'SUBTRACT' | 'UNITE'}
   */
  function determinePathOperation(
    largerPath,
    smallerPath,
    largerOriginalWinding = null,
    smallerOriginalWinding = null,
    options = {}
  ) {
    const debug = options.debug || false
    const log = debug ? console.log.bind(console) : () => {}

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

    log(`  determinePathOperation:`)
    log(`    Relation: ${relation}`)
    log(`    Area ratio: ${areaRatio.toFixed(3)}`)
    log(`    Larger winding: ${largerWinding > 0 ? 'CCW' : 'CW'} (value: ${largerWinding.toFixed(2)})`)
    log(`    Smaller winding: ${smallerWinding > 0 ? 'CCW' : 'CW'} (value: ${smallerWinding.toFixed(2)})`)
    log(`    Windings same: ${windingsSame}`)

    if (relation === 'INDEPENDENT') {
      log(`  → UNITE (independent paths)`)
      return 'UNITE'
    }

    if (relation === 'CONTAINED') {
      // More accurate containment check using subtract
      let fullyContained = true
      try {
        const subtracted = subtractPaths(largerPath, [smallerPath])
        if (subtracted?.curves && subtracted.curves.length > 0) {
          const largerCurves = largerPath.curves ? largerPath.curves.length : 0
          const subtractedCurves = subtracted.curves ? subtracted.curves.length : 0
          fullyContained = subtractedCurves > largerCurves
        } else {
          fullyContained = false
        }
      } catch (e) {
        // Fallback to bounds-based check
        fullyContained = true
      }

      if (!fullyContained) {
        log(`  → UNITE (contained by bounds but protruding from actual path)`)
        return 'UNITE'
      }

      // Fully contained - check winding
      if (!windingsSame) {
        log(`  → SUBTRACT (fully contained, opposite winding)`)
        return 'SUBTRACT'
      }
      if (smallerWinding > 0) {
        log(`  → SUBTRACT (fully contained, smaller is CCW hole)`)
        return 'SUBTRACT'
      } else {
        log(`  → UNITE (fully contained, smaller is CW solid)`)
        return 'UNITE'
      }
    }

    // OVERLAP
    log(`  → UNITE (overlap)`)
    return 'UNITE'
  }

  // ============================================
  // Main ot2pave function
  // ============================================

  /**
   * Convert OpenType.js font commands to Pave.js Path
   *
   * @param {Array<{type: string, x?: number, y?: number, x1?: number, y1?: number, x2?: number, y2?: number}>} commands - OpenType.js commands
   * @param {object} options - Options
   * @param {boolean} options.debug - Enable debug logging
   * @param {Array} options.debugPaths - Array to collect individual paths for debugging
   * @returns {object} Pave.js path
   *
   * @example
   * const font = await opentype.load('font.ttf')
   * const otPath = font.getPath('A', 0, 100, 72)
   * const pavePath = ot2pave(otPath.commands)
   */
  function ot2pave(commands, options = {}) {
    const debug = options.debug || false
    const debugPaths = options.debugPaths ?? null
    const log = debug ? console.log.bind(console) : () => {}
    const warn = debug ? console.warn.bind(console) : () => {}

    // Phase 1: Collect all paths
    const allPaths = []
    let tempPath = []
    let presentPos = [0, 0]

    log('\n=== PHASE 1: Collecting all paths ===')

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i]
      if (!cmd) continue

      switch (cmd.type) {
        case 'M': {
          // MoveTo - close previous path if exists
          if (tempPath.length > 0) {
            const newPath = closePath(joinPaths(tempPath), { fuse: false, group: -1 })
            const newArea = getPathArea(newPath)
            const newWinding = getPathWindingDirection(newPath)
            const newBounds = getPathBounds(newPath)

            allPaths.push({
              path: newPath,
              area: newArea,
              winding: newWinding,
              bounds: newBounds
            })

            log(`Path ${allPaths.length} (implicit close): area=${newArea.toFixed(2)}, winding=${newWinding > 0 ? 'CCW' : 'CW'}`)

            if (debugPaths) {
              debugPaths.push({ path: newPath, area: newArea, winding: newWinding, bounds: newBounds })
            }

            tempPath = []
          }
          break
        }
        case 'Z': {
          // ClosePath
          const newPath = closePath(joinPaths(tempPath), { fuse: false, group: -1 })
          const newArea = getPathArea(newPath)
          const newWinding = getPathWindingDirection(newPath)
          const newBounds = getPathBounds(newPath)

          allPaths.push({
            path: newPath,
            area: newArea,
            winding: newWinding,
            bounds: newBounds
          })

          log(`Path ${allPaths.length}: area=${newArea.toFixed(2)}, winding=${newWinding > 0 ? 'CCW' : 'CW'}`)

          if (debugPaths) {
            debugPaths.push({ path: newPath, area: newArea, winding: newWinding, bounds: newBounds })
          }

          tempPath = []
          break
        }
        case 'L':
          tempPath.push(createLine(presentPos, [cmd.x, cmd.y]))
          break
        case 'C':
          if (cmd.x1 !== undefined && cmd.y1 !== undefined &&
              cmd.x2 !== undefined && cmd.y2 !== undefined) {
            tempPath.push(createCubicBezier(
              presentPos,
              [cmd.x1, cmd.y1],
              [cmd.x2, cmd.y2],
              [cmd.x, cmd.y]
            ))
          }
          break
        case 'Q':
          if (cmd.x1 !== undefined && cmd.y1 !== undefined) {
            tempPath.push(createQuadraticBezier(
              presentPos,
              [cmd.x1, cmd.y1],
              [cmd.x, cmd.y]
            ))
          }
          break
        default:
          warn(`Unknown command type: ${cmd.type}`)
          break
      }

      // Update position
      if (cmd.x !== undefined && cmd.y !== undefined) {
        presentPos = [cmd.x, cmd.y]
      }
    }

    // Close any remaining path
    if (tempPath.length > 0) {
      const newPath = closePath(joinPaths(tempPath), { fuse: false, group: -1 })
      const newArea = getPathArea(newPath)
      const newWinding = getPathWindingDirection(newPath)
      const newBounds = getPathBounds(newPath)

      allPaths.push({
        path: newPath,
        area: newArea,
        winding: newWinding,
        bounds: newBounds
      })

      log(`Path ${allPaths.length} (final close): area=${newArea.toFixed(2)}, winding=${newWinding > 0 ? 'CCW' : 'CW'}`)

      if (debugPaths) {
        debugPaths.push({ path: newPath, area: newArea, winding: newWinding, bounds: newBounds })
      }
    }

    // No paths found
    if (allPaths.length === 0) {
      warn('No paths found in commands')
      return createEmptyPath()
    }

    // Phase 2: Sort by area (largest first)
    log('\n=== PHASE 2: Sorting by area ===')
    allPaths.sort((a, b) => b.area - a.area)

    for (let i = 0; i < allPaths.length; i++) {
      const pathInfo = allPaths[i]
      log(`Sorted[${i}]: area=${pathInfo.area.toFixed(2)}, winding=${pathInfo.winding > 0 ? 'CCW' : 'CW'}`)
    }

    // Phase 3: Set base path (largest, always treated as solid)
    log('\n=== PHASE 3: Setting base path ===')
    const firstPath = allPaths[0]
    let result = firstPath.path
    let resultWinding = firstPath.winding

    log(`Base path: area=${firstPath.area.toFixed(2)}, winding=${firstPath.winding > 0 ? 'CCW' : 'CW'}`)

    // Phase 4: Sequential integration
    log('\n=== PHASE 4: Sequential integration ===')

    for (let i = 1; i < allPaths.length; i++) {
      const currentPath = allPaths[i]
      log(`\n--- Processing path ${i}/${allPaths.length - 1} ---`)
      log(`  Current path: area=${currentPath.area.toFixed(2)}, winding=${currentPath.winding > 0 ? 'CCW' : 'CW'}`)

      const largerOriginalWinding = resultWinding
      const smallerOriginalWinding = currentPath.winding
      const operation = determinePathOperation(
        result,
        currentPath.path,
        largerOriginalWinding,
        smallerOriginalWinding,
        { debug }
      )

      if (operation === 'SUBTRACT') {
        const before = result
        result = subtractPaths(result, [currentPath.path])

        if (!result?.curves || result.curves.length === 0) {
          warn('SUBTRACT resulted in empty path, keeping previous result')
          result = before
        } else {
          resultWinding = getPathWindingDirection(result)
          log(`  Result after SUBTRACT: curves=${result.curves.length}`)
        }
      } else if (operation === 'UNITE') {
        const before = result
        result = unitePaths([result, currentPath.path])

        if (!result?.curves || result.curves.length === 0) {
          warn('UNITE resulted in empty path, keeping previous result')
          result = before
        } else {
          resultWinding = getPathWindingDirection(result)
          log(`  Result after UNITE: curves=${result.curves.length}`)
        }
      }
    }

    log('\n=== FINAL RESULT ===')
    log(`Final path curves: ${result.curves ? result.curves.length : 0}`)

    return result
  }

  return ot2pave
}

export default createOt2pave
