/**
 * Type-safe wrappers for Pave.js operations
 *
 * Provides a centralized, typed interface to the Pave.js library
 * loaded via CDN. All external Path operations should go through
 * these wrappers to ensure type safety.
 */
import type { PavePath, PavePathStatic } from '../types/pave.js';
/**
 * Get Path constructor from global context with type safety
 *
 * @returns Path constructor from global scope
 * @throws Error if Path is not available
 */
export declare function getPath(): PavePathStatic;
/**
 * Type-safe wrapper for Path.bounds
 *
 * @param path - Path to get bounds from
 * @returns Bounding box [[minX, minY], [maxX, maxY]]
 */
export declare function getPathBounds(path: PavePath): [[number, number], [number, number]];
/**
 * Type-safe wrapper for Path.drawToCanvas
 *
 * @param path - Path to draw
 * @param context - Canvas 2D rendering context
 */
export declare function drawPathToCanvas(path: PavePath, context: CanvasRenderingContext2D): void;
/**
 * Type-safe wrapper for Path.line
 *
 * @param start - Start point [x, y]
 * @param end - End point [x, y]
 * @returns Line path
 */
export declare function createLine(start: [number, number], end: [number, number]): PavePath;
/**
 * Type-safe wrapper for Path.cubicBezier
 *
 * @param start - Start point [x, y]
 * @param control1 - First control point [x, y]
 * @param control2 - Second control point [x, y]
 * @param end - End point [x, y]
 * @returns Cubic bezier path
 */
export declare function createCubicBezier(start: [number, number], control1: [number, number], control2: [number, number], end: [number, number]): PavePath;
/**
 * Type-safe wrapper for Path.quadraticBezier
 *
 * @param start - Start point [x, y]
 * @param control - Control point [x, y]
 * @param end - End point [x, y]
 * @returns Quadratic bezier path
 */
export declare function createQuadraticBezier(start: [number, number], control: [number, number], end: [number, number]): PavePath;
/**
 * Type-safe wrapper for Path.circle
 *
 * @param center - Center point [x, y]
 * @param radius - Circle radius
 * @returns Circle path
 */
export declare function createCircle(center: [number, number], radius: number): PavePath;
/**
 * Type-safe wrapper for Path.join
 *
 * @param paths - Array of paths to join
 * @returns Joined path
 */
export declare function joinPaths(paths: PavePath[]): PavePath;
/**
 * Type-safe wrapper for Path.close
 *
 * @param path - Path to close
 * @param options - Close options
 * @returns Closed path
 */
export declare function closePath(path: PavePath, options?: {
    fuse?: boolean;
    group?: number;
}): PavePath;
/**
 * Type-safe wrapper for creating an empty path
 *
 * @returns Empty path (circle with radius 0)
 */
export declare function createEmptyPath(): PavePath;
/**
 * Type-safe wrapper for Path.unite
 *
 * @param paths - Paths to unite
 * @returns United path
 */
export declare function unitePaths(paths: PavePath[]): PavePath;
/**
 * Type-safe wrapper for Path.subtract
 *
 * @param path - Base path
 * @param subtrahends - Paths to subtract
 * @returns Subtracted path
 */
export declare function subtractPaths(path: PavePath, subtrahends: PavePath[]): PavePath;
//# sourceMappingURL=pave-wrapper.d.ts.map