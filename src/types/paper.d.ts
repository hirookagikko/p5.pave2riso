/**
 * Minimal type definitions for Paper.js 0.12.x
 *
 * These are the minimum types needed for p5.pave2riso's PathOffset functionality.
 * Only the methods actually used in the codebase are defined.
 *
 * @see https://paperjs.org/reference/global/
 */

/**
 * A 2D point with x and y coordinates
 */
export interface PaperPoint {
  x: number
  y: number
  /** Check if both x and y are zero */
  isZero(): boolean
}

/**
 * A segment in a Paper.js path
 * Represents a point and its bezier handles
 */
export interface PaperSegment {
  /** The anchor point */
  point: PaperPoint
  /** The handle point coming into the segment (relative to point) */
  handleIn: PaperPoint
  /** The handle point going out of the segment (relative to point) */
  handleOut: PaperPoint
}

/**
 * A bezier curve between two segments in a Paper.js path
 */
export interface PaperCurve {
  /** The first segment of the curve */
  segment1: PaperSegment
  /** The second segment of the curve */
  segment2: PaperSegment
  /** The first control point (absolute coordinates) */
  point1: PaperPoint
  /** The second control point (absolute coordinates) */
  point2: PaperPoint
  /** The handle at the first segment */
  handle1: PaperPoint
  /** The handle at the second segment */
  handle2: PaperPoint
  /** The length of the curve */
  length: number
  /** Whether the curve is linear (no handles) */
  isLinear(): boolean
}

/**
 * Paper.js Path or CompoundPath
 * Represents a vector path that can be manipulated
 */
export interface PaperPath {
  /** Array of segments making up the path */
  segments: PaperSegment[]
  /** Whether the path is closed */
  closed: boolean
  /** Array of curves (bezier segments) in the path */
  curves?: PaperCurve[]
  /** Child paths (for CompoundPath) */
  children?: PaperPath[]
  /** First child path */
  firstChild?: PaperPath
  /** Create a copy of this path */
  clone(): PaperPath
  /** Remove this path from the project */
  remove(): void
}

/**
 * Paper.js Item (base class for Path, Group, etc.)
 * Used for SVG import results which may be groups
 */
export interface PaperItem extends PaperPath {
  /** Child items (for groups) */
  children?: PaperPath[]
}

/**
 * Paper.js Project
 * Manages all items in the document
 */
export interface PaperProject {
  /**
   * Import an SVG string and add it to the project
   * @param svg - SVG string to import
   * @returns The imported item (may be a group)
   */
  importSVG(svg: string): PaperItem
  /**
   * Clear all items from the project
   */
  clear(): void
}

/**
 * Paper.js main instance
 * The global paper object
 */
export interface PaperInstance {
  /**
   * Set up Paper.js with a canvas element
   * @param canvas - HTML canvas element to use
   */
  setup(canvas: HTMLCanvasElement): void
  /**
   * The active project
   */
  project: PaperProject
}

/**
 * PaperOffset library interface
 * Provides path offset functionality
 *
 * @see https://github.com/nicholaswmin/paperjs-offset
 */
export interface PaperOffsetStatic {
  /**
   * Offset a path by a given distance
   * @param path - The path to offset
   * @param distance - Offset distance (positive = outward, negative = inward)
   * @param options - Offset options
   * @returns The offset path
   */
  offset(
    path: PaperPath,
    distance: number,
    options?: {
      join?: 'miter' | 'bevel' | 'round'
      cap?: 'butt' | 'round' | 'square'
    }
  ): PaperPath
}
