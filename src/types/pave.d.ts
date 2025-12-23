/**
 * Type definitions for Pave.js (@baku89/pave)
 *
 * Since Pave.js doesn't provide official TypeScript definitions and is loaded via CDN,
 * we define the subset of APIs used in this project as global declarations.
 *
 * @see https://github.com/baku89/pave
 */

import type { PaveCurve, PaveCurveSegment } from './core.js'

/**
 * 2D Point tuple [x, y]
 */
type Point2D = [number, number]

/**
 * Bounding box [[minX, minY], [maxX, maxY]]
 */
type BoundingBox = [Point2D, Point2D]

declare global {
  /**
   * Pave path object
   *
   * Represents a vector path with one or more curve segments.
   * The curves array contains all the bezier segments that make up the path.
   */
  interface PavePath {
    /**
     * パスを構成するカーブセグメントの配列
     * Each segment represents a closed or open sub-path
     */
    curves?: PaveCurve[]

    /**
     * パスが閉じているかどうか
     * If true, the path forms a closed shape
     */
    closed?: boolean

    /**
     * Structured curve segments (alternative format)
     * Some Pave.js operations return this format
     */
    segments?: PaveCurveSegment[]

    /**
     * Allow additional properties from Pave.js
     * Some operations add metadata like winding direction
     */
    [key: string]: unknown
  }

  /**
   * Path constructor and static methods
   *
   * The main interface to Pave.js path operations.
   * All methods return immutable path objects.
   */
  interface PavePathStatic {
    // ==================
    // Path Creation
    // ==================

    /**
     * Create a line segment
     * @param start - Start point [x, y]
     * @param end - End point [x, y]
     */
    line(start: Point2D, end: Point2D): PavePath

    /**
     * Create a cubic bezier curve
     * @param start - Start point [x, y]
     * @param control1 - First control point [x, y]
     * @param control2 - Second control point [x, y]
     * @param end - End point [x, y]
     */
    cubicBezier(
      start: Point2D,
      control1: Point2D,
      control2: Point2D,
      end: Point2D
    ): PavePath

    /**
     * Create a quadratic bezier curve
     * @param start - Start point [x, y]
     * @param control - Control point [x, y]
     * @param end - End point [x, y]
     */
    quadraticBezier(start: Point2D, control: Point2D, end: Point2D): PavePath

    /**
     * Create a circle
     * @param center - Center point [x, y]
     * @param radius - Circle radius
     */
    circle(center: Point2D, radius: number): PavePath

    /**
     * Create a rectangle
     * @param topLeft - Top-left corner [x, y]
     * @param bottomRight - Bottom-right corner [x, y]
     */
    rect(topLeft: Point2D, bottomRight: Point2D): PavePath

    /**
     * Create an ellipse
     * @param center - Center point [x, y]
     * @param radius - Radius [rx, ry]
     */
    ellipse(center: Point2D, radius: Point2D): PavePath

    /**
     * Create an arc
     * @param center - Center point [x, y]
     * @param radius - Arc radius
     * @param startAngle - Start angle in radians
     * @param endAngle - End angle in radians
     */
    arc(center: Point2D, radius: number, startAngle: number, endAngle: number): PavePath

    /**
     * Create a regular polygon
     * @param center - Center point [x, y]
     * @param radius - Circumradius
     * @param sides - Number of sides
     */
    polygon(center: Point2D, radius: number, sides: number): PavePath

    /**
     * Create an empty path (zero-area)
     */
    empty(): PavePath

    // ==================
    // Path Operations
    // ==================

    /**
     * Join multiple paths into one
     * @param paths - Array of paths to join
     */
    join(paths: PavePath[]): PavePath

    /**
     * Close a path by connecting start and end points
     * @param path - Path to close
     * @param options - Close options
     */
    close(path: PavePath, options?: { fuse?: boolean; group?: number }): PavePath

    /**
     * Reverse the direction of a path
     * @param path - Path to reverse
     */
    reverse(path: PavePath): PavePath

    /**
     * Offset a path by a distance (stroke to fill conversion)
     * Note: May not work correctly in some Pave.js versions
     * @param path - Path to offset
     * @param distance - Offset distance
     * @param options - Offset options
     */
    offset(
      path: PavePath,
      distance: number,
      options?: {
        join?: 'miter' | 'bevel' | 'round'
        cap?: 'butt' | 'round' | 'square'
        miterLimit?: number
      }
    ): PavePath

    /**
     * Transform a path with a 2x3 transformation matrix
     * @param path - Path to transform
     * @param matrix - Transformation matrix [[a, c, e], [b, d, f]]
     */
    transform(path: PavePath, matrix: [[number, number, number], [number, number, number]]): PavePath

    /**
     * Scale a path
     * @param path - Path to scale
     * @param scale - Scale factor [sx, sy] or single number for uniform scale
     * @param origin - Origin point for scaling (defaults to path center)
     */
    scale(path: PavePath, scale: Point2D | number, origin?: Point2D): PavePath

    /**
     * Translate a path
     * @param path - Path to translate
     * @param offset - Translation offset [dx, dy]
     */
    translate(path: PavePath, offset: Point2D): PavePath

    /**
     * Rotate a path
     * @param path - Path to rotate
     * @param angle - Rotation angle in radians
     * @param origin - Origin point for rotation (defaults to path center)
     */
    rotate(path: PavePath, angle: number, origin?: Point2D): PavePath

    // ==================
    // Boolean Operations
    // ==================

    /**
     * Unite (merge) multiple paths
     * @param paths - Paths to unite
     */
    unite(paths: PavePath[]): PavePath

    /**
     * Subtract paths from a base path
     * @param path - Base path
     * @param subtrahends - Paths to subtract
     */
    subtract(path: PavePath, subtrahends: PavePath[]): PavePath

    /**
     * Intersect multiple paths (get common area)
     * @param paths - Paths to intersect
     */
    intersect(paths: PavePath[]): PavePath

    /**
     * Exclude paths (XOR operation)
     * @param paths - Paths to XOR
     */
    exclude(paths: PavePath[]): PavePath

    // ==================
    // Measurements
    // ==================

    /**
     * Get the bounding box of a path
     * @param path - Path to measure
     * @returns [[minX, minY], [maxX, maxY]]
     */
    bounds(path: PavePath): BoundingBox

    /**
     * Get the total length of a path
     * @param path - Path to measure
     */
    length(path: PavePath): number

    /**
     * Get the signed area of a closed path
     * @param path - Path to measure (should be closed)
     */
    area(path: PavePath): number

    /**
     * Get a point at a specific position along the path
     * @param path - Path to sample
     * @param t - Position (0-1)
     */
    pointAt(path: PavePath, t: number): Point2D

    /**
     * Get the tangent vector at a specific position
     * @param path - Path to sample
     * @param t - Position (0-1)
     */
    tangentAt(path: PavePath, t: number): Point2D

    // ==================
    // Conversion / Export
    // ==================

    /**
     * Draw path to a Canvas 2D context
     * @param path - Path to draw
     * @param context - Canvas 2D rendering context
     */
    drawToCanvas(path: PavePath, context: CanvasRenderingContext2D): void

    /**
     * Convert path to SVG path string (d attribute)
     * @param path - Path to convert
     * @returns SVG path data string
     */
    toSVGString(path: PavePath): string

    /**
     * Parse an SVG path string into a PavePath
     * @param svg - SVG path data string (d attribute)
     */
    fromSVGString(svg: string): PavePath

    /**
     * Flatten a path to line segments (remove curves)
     * @param path - Path to flatten
     * @param tolerance - Maximum error tolerance
     */
    flatten(path: PavePath, tolerance?: number): PavePath

    /**
     * Simplify a path by removing redundant points
     * @param path - Path to simplify
     * @param tolerance - Maximum error tolerance
     */
    simplify(path: PavePath, tolerance?: number): PavePath
  }

  const Path: PavePathStatic

  interface Window {
    Path: PavePathStatic
  }

  namespace globalThis {
    const Path: PavePathStatic
  }
}

// Export types for use in other modules
export type { PavePath, PavePathStatic }
