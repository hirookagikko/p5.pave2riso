/**
 * Type-safe wrappers for Pave.js operations
 *
 * Provides a centralized, typed interface to the Pave.js library
 * loaded via CDN. All external Path operations should go through
 * these wrappers to ensure type safety.
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import type { PavePath, PavePathStatic } from '../types/pave.js'

/**
 * Get Path constructor from global context with type safety
 *
 * @returns Path constructor from global scope
 * @throws Error if Path is not available
 */
export function getPath(): PavePathStatic {
  if (typeof Path === 'undefined') {
    throw new Error('Path from pave.js is not available. Make sure pave.js is loaded.')
  }
  return Path
}

/**
 * Type-safe wrapper for Path.bounds
 *
 * @param path - Path to get bounds from
 * @returns Bounding box [[minX, minY], [maxX, maxY]]
 */
export function getPathBounds(path: PavePath): [[number, number], [number, number]] {
  const Path = getPath()
  return Path.bounds(path)
}

/**
 * Type-safe wrapper for Path.drawToCanvas
 *
 * @param path - Path to draw
 * @param context - Canvas 2D rendering context
 */
export function drawPathToCanvas(path: PavePath, context: CanvasRenderingContext2D): void {
  const Path = getPath()
  Path.drawToCanvas(path, context)
}

/**
 * Type-safe wrapper for Path.line
 *
 * @param start - Start point [x, y]
 * @param end - End point [x, y]
 * @returns Line path
 */
export function createLine(start: [number, number], end: [number, number]): PavePath {
  const Path = getPath()
  return Path.line(start, end)
}

/**
 * Type-safe wrapper for Path.cubicBezier
 *
 * @param start - Start point [x, y]
 * @param control1 - First control point [x, y]
 * @param control2 - Second control point [x, y]
 * @param end - End point [x, y]
 * @returns Cubic bezier path
 */
export function createCubicBezier(
  start: [number, number],
  control1: [number, number],
  control2: [number, number],
  end: [number, number]
): PavePath {
  const Path = getPath()
  return Path.cubicBezier(start, control1, control2, end)
}

/**
 * Type-safe wrapper for Path.quadraticBezier
 *
 * @param start - Start point [x, y]
 * @param control - Control point [x, y]
 * @param end - End point [x, y]
 * @returns Quadratic bezier path
 */
export function createQuadraticBezier(
  start: [number, number],
  control: [number, number],
  end: [number, number]
): PavePath {
  const Path = getPath()
  return Path.quadraticBezier(start, control, end)
}

/**
 * Type-safe wrapper for Path.circle
 *
 * @param center - Center point [x, y]
 * @param radius - Circle radius
 * @returns Circle path
 */
export function createCircle(center: [number, number], radius: number): PavePath {
  const Path = getPath()
  return Path.circle(center, radius)
}

/**
 * Type-safe wrapper for Path.join
 *
 * @param paths - Array of paths to join
 * @returns Joined path
 */
export function joinPaths(paths: PavePath[]): PavePath {
  const Path = getPath()
  return Path.join(paths)
}

/**
 * Type-safe wrapper for Path.close
 *
 * @param path - Path to close
 * @param options - Close options
 * @returns Closed path
 */
export function closePath(
  path: PavePath,
  options?: { fuse?: boolean; group?: number }
): PavePath {
  const Path = getPath()
  return Path.close(path, options)
}

/**
 * Type-safe wrapper for Path.empty
 *
 * @returns Empty path
 */
export function createEmptyPath(): PavePath {
  const Path = getPath()
  return Path.empty()
}

/**
 * Type-safe wrapper for Path.unite
 *
 * @param paths - Paths to unite
 * @returns United path
 */
export function unitePaths(paths: PavePath[]): PavePath {
  const Path = getPath()
  return Path.unite(paths)
}

/**
 * Type-safe wrapper for Path.subtract
 *
 * @param path - Base path
 * @param subtrahends - Paths to subtract
 * @returns Subtracted path
 */
export function subtractPaths(path: PavePath, subtrahends: PavePath[]): PavePath {
  const Path = getPath()
  return Path.subtract(path, subtrahends)
}
