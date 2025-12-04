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

    // ==================
    // Measurements
    // ==================

    /**
     * Get the bounding box of a path
     * @param path - Path to measure
     * @returns [[minX, minY], [maxX, maxY]]
     */
    bounds(path: PavePath): BoundingBox

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
