/**
 * pave-utils - Path utilities for Pave.js
 *
 * Provides PathOffset and PathRemoveHoles functions using Paper.js
 * for accurate path manipulation operations.
 *
 * @module pave-utils
 * @license MIT
 */

/**
 * Create pave-utils with dependency injection
 *
 * @param {object} deps - Dependencies
 * @param {object} deps.Path - Pave.js Path static object (from @baku89/pave)
 * @param {object} deps.paper - Paper.js instance (from paper.js 0.12.4)
 * @param {object} deps.PaperOffset - PaperOffset static object (from paperjs-offset)
 * @returns {object} Object containing PathOffset, PathRemoveHoles, and cleanup
 *
 * @example
 * import { Path } from '@baku89/pave'
 * import paper from 'paper'
 * import { PaperOffset } from 'paperjs-offset'
 * import { createPaveUtils } from './pave-utils/index.js'
 *
 * const { PathOffset, PathRemoveHoles, cleanup } = createPaveUtils({
 *   Path, paper, PaperOffset
 * })
 *
 * const expanded = PathOffset(path, 10)
 * const filled = PathRemoveHoles(expanded)
 */
export function createPaveUtils(deps) {
  const { Path, paper, PaperOffset } = deps

  if (!Path) {
    throw new Error('pave-utils: Path dependency is required')
  }

  // ============================================
  // Internal state
  // ============================================

  let paperInitialized = false
  let paperCanvas = null

  // ============================================
  // Helper functions
  // ============================================

  /**
   * Type guard to check if a path has curves
   */
  function hasCurves(path) {
    return path !== null && typeof path === 'object' && 'curves' in path && Array.isArray(path.curves)
  }

  /**
   * Create empty path (zero-radius circle)
   */
  function createEmptyPath() {
    return Path.circle([0, 0], 0)
  }

  /**
   * Initialize Paper.js if not already initialized
   */
  function ensurePaperInitialized() {
    if (!paper) {
      return false
    }
    if (!paperInitialized) {
      paperCanvas = document.createElement('canvas')
      paper.setup(paperCanvas)
      paperInitialized = true
    }
    return true
  }

  /**
   * Cleanup Paper.js resources to prevent memory leaks
   */
  function cleanup() {
    if (paper?.project) {
      paper.project.clear()
    }

    if (paperCanvas) {
      paperCanvas.width = 0
      paperCanvas.height = 0
      const ctx = paperCanvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, 0, 0)
      }
      paperCanvas = null
    }

    paperInitialized = false
  }

  /**
   * Convert Pave.js path to Paper.js path via SVG
   */
  function paveToPaper(pavePath) {
    if (!paper) {
      return null
    }
    try {
      const pathData = Path.toSVGString(pavePath)

      if (!pathData) {
        console.warn('pave-utils: Empty path data')
        return null
      }

      const svgString = `<svg><path d="${pathData}"/></svg>`
      const imported = paper.project.importSVG(svgString)

      let resultPath = null

      if (imported.children && imported.children.length > 0) {
        const child = imported.children[0]
        if (child) {
          resultPath = child.clone()
        }
      } else if (imported.firstChild) {
        resultPath = imported.firstChild.clone()
      } else {
        resultPath = imported
      }

      imported.remove()

      return resultPath
    } catch (e) {
      console.warn('pave-utils: Pave→Paper conversion failed', e)
      return null
    }
  }

  /**
   * Convert Paper.js path to Pave.js path via segment iteration
   */
  function paperToPave(paperPath) {
    const curves = []

    // Handle CompoundPath (multiple children) or single Path
    const paths = paperPath.children ? paperPath.children : [paperPath]

    for (const path of paths) {
      const vertices = []
      const segments = path.segments

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]
        if (!seg) continue

        const point = [seg.point.x, seg.point.y]

        if (i === 0) {
          vertices.push({ point, command: 'L' })
        } else {
          const prevSeg = segments[i - 1]
          if (!prevSeg) continue

          const hasHandles = !prevSeg.handleOut.isZero() || !seg.handleIn.isZero()

          if (hasHandles) {
            const cp1 = [
              prevSeg.point.x + prevSeg.handleOut.x,
              prevSeg.point.y + prevSeg.handleOut.y
            ]
            const cp2 = [
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
            const cp1 = [
              lastSeg.point.x + lastSeg.handleOut.x,
              lastSeg.point.y + lastSeg.handleOut.y
            ]
            const cp2 = [
              firstSeg.point.x + firstSeg.handleIn.x,
              firstSeg.point.y + firstSeg.handleIn.y
            ]
            vertices[0] = { point: firstVertex.point, command: 'C', args: [cp1, cp2] }
          }
        }
      }

      curves.push({ vertices, closed: path.closed })
    }

    return { curves }
  }

  /**
   * Recursively collect all Path children from a Paper.js item
   */
  function collectAllPaperPaths(item, paths, depth = 0) {
    // Check if this is a Path (not CompoundPath)
    if (item.className === 'Path' && item.segments && item.segments.length > 0) {
      paths.push(item)
      return
    }

    // If it has children, recurse into them
    if (item.children && item.children.length > 0) {
      for (const child of item.children) {
        collectAllPaperPaths(child, paths, depth + 1)
      }
    }
  }

  /**
   * Convert Pave path to array of individual Paper.js paths
   */
  function paveToSeparatePaperPaths(pavePath) {
    if (!paper) {
      return []
    }

    try {
      const pathData = Path.toSVGString(pavePath)

      if (!pathData) {
        return []
      }

      const svgString = `<svg><path d="${pathData}"/></svg>`
      const imported = paper.project.importSVG(svgString)

      const paperPaths = []
      collectAllPaperPaths(imported, paperPaths)

      // Clone paths before removing the imported group
      const clonedPaths = []
      for (const p of paperPaths) {
        clonedPaths.push(p.clone())
      }

      imported.remove()

      return clonedPaths
    } catch (e) {
      console.warn('pave-utils: Pave→Paper conversion failed', e)
      return []
    }
  }

  /**
   * Determines the winding direction of a single curve using the Shoelace formula
   */
  function getCurveWindingDirection(curve) {
    let signedArea = 0

    // Handle structured curve (with vertices property)
    if (curve && typeof curve === 'object' && 'vertices' in curve && Array.isArray(curve.vertices)) {
      const vertices = curve.vertices
      for (let j = 0; j < vertices.length; j++) {
        const current = vertices[j]
        const next = vertices[(j + 1) % vertices.length]

        if (!current?.point || !next?.point) continue

        const x1 = current.point[0]
        const y1 = current.point[1]
        const x2 = next.point[0]
        const y2 = next.point[1]

        signedArea += (x1 * y2 - x2 * y1)
      }
    }
    // Handle array format curve
    else if (Array.isArray(curve)) {
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

    // Y軸が下向きの座標系では符号が逆になる
    return -(signedArea / 2)
  }

  /**
   * Remove holes using Paper.js clockwise detection
   */
  function removeHolesWithPaper(path, emptyPath) {
    if (!paper) {
      return path
    }

    const allPaths = paveToSeparatePaperPaths(path)

    if (allPaths.length <= 1) {
      for (const p of allPaths) p.remove()
      return path
    }

    // Filter: keep only clockwise (outer) paths
    const outerPaths = []

    for (let i = 0; i < allPaths.length; i++) {
      const currentPath = allPaths[i]
      if (currentPath.clockwise) {
        outerPaths.push(allPaths[i])
      }
    }

    // If no outer paths found, return empty
    if (outerPaths.length === 0) {
      console.warn('PathRemoveHoles: No outer paths found')
      for (const p of allPaths) p.remove()
      return emptyPath
    }

    // If all paths are outer, return original
    if (outerPaths.length === allPaths.length) {
      for (const p of allPaths) p.remove()
      return path
    }

    // Build new CompoundPath with only outer paths
    const newCompound = new paper.CompoundPath()

    for (const p of outerPaths) {
      const cloned = p.clone()
      newCompound.addChild(cloned)
    }

    // Convert back to Pave
    const result = paperToPave(newCompound)

    // Cleanup all paths
    for (const p of allPaths) p.remove()
    newCompound.remove()

    return result || emptyPath
  }

  /**
   * Remove holes using Shoelace formula (fallback when Paper.js unavailable)
   */
  function removeHolesWithShoelace(path, emptyPath) {
    const curves = path.curves
    if (!curves) {
      return emptyPath
    }

    // Calculate winding for all curves
    const curveInfo = []

    for (let i = 0; i < curves.length; i++) {
      const curve = curves[i]
      if (!curve) continue

      const winding = getCurveWindingDirection(curve)
      curveInfo.push({ index: i, winding, absWinding: Math.abs(winding) })
    }

    // Find the largest curve by absolute area
    const maxAbsWinding = Math.max(...curveInfo.map(c => c.absWinding))
    const largestCurve = curveInfo.find(c => c.absWinding === maxAbsWinding)

    if (!largestCurve) {
      return path
    }

    const outerSign = largestCurve.winding >= 0 ? 1 : -1

    // Filter: keep curves with the same sign as the outer contour
    const solidCurves = []

    for (const info of curveInfo) {
      const curve = curves[info.index]
      if (!curve) continue

      const sameSign = (info.winding >= 0) === (outerSign > 0) || info.winding === 0

      if (sameSign) {
        solidCurves.push(curve)
      }
    }

    if (solidCurves.length === 0) {
      return emptyPath
    }

    return { curves: solidCurves }
  }

  // ============================================
  // Public API
  // ============================================

  /**
   * Offset a path by a given distance
   *
   * @param {object} path - Pave.js path to offset
   * @param {number} distance - Offset distance (positive = outward, negative = inward)
   * @param {object} options - Optional settings
   * @param {string} options.join - Join style: 'miter' | 'bevel' | 'round'
   * @param {string} options.cap - Cap style: 'butt' | 'round' | 'square'
   * @returns {object} Offset path, or original path if offset fails
   *
   * @example
   * const expanded = PathOffset(path, 10)  // 10px outward
   * const shrunk = PathOffset(path, -5)    // 5px inward
   */
  function PathOffset(path, distance, options) {
    // Check if dependencies are available
    if (!paper) {
      console.warn('PathOffset: paper.js is not loaded. Returning original path.')
      return path
    }
    if (!PaperOffset) {
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
      const offsetted = PaperOffset.offset(paperPath, distance, options)

      // Convert back to Pave path
      const result = paperToPave(offsetted)
      return result
    } catch (e) {
      console.warn('PathOffset: Offset operation failed', e)
      return path
    }
  }

  /**
   * Remove all holes from a path, keeping only the outer contours
   *
   * @param {object} path - Pave.js path (may be a compound path with holes)
   * @returns {object} New path with only solid (outer) contours
   *
   * @example
   * const textPath = ot2pave(font.getPath('echo', 0, 100, 72).commands)
   * const filledPath = PathRemoveHoles(textPath)
   * // 'e', 'c', 'o' の穴が埋められた文字パス
   */
  function PathRemoveHoles(path) {
    const emptyPath = createEmptyPath()

    // Validate input
    if (!path || !hasCurves(path) || path.curves.length === 0) {
      console.warn('PathRemoveHoles: Invalid path provided')
      return emptyPath
    }

    // Single curve - no holes possible
    if (path.curves.length === 1) {
      return path
    }

    // Use Paper.js for accurate area calculation if available
    if (paper && ensurePaperInitialized()) {
      return removeHolesWithPaper(path, emptyPath)
    }

    // Fallback: use Shoelace formula (less accurate for bezier curves)
    return removeHolesWithShoelace(path, emptyPath)
  }

  return {
    PathOffset,
    PathRemoveHoles,
    cleanup
  }
}

export default createPaveUtils
