/**
 * Type-safe wrappers for Pave.js operations
 *
 * Provides a centralized, typed interface to the Pave.js library.
 * Supports both dependency injection and global fallback for backward compatibility.
 *
 * @module utils/pave-wrapper
 */
/**
 * Cached Path instance for dependency injection
 * @internal
 */
let cachedPath = null;
/**
 * Inject Path dependency
 *
 * Use this to explicitly set the Path dependency instead of relying on globals.
 * Called automatically by `createP5Pave2Riso()`.
 *
 * @param path - Path constructor from Pave.js
 */
export function setPath(path) {
    cachedPath = path;
}
/**
 * Reset Path dependency to null
 *
 * Useful for testing to clear injected dependencies.
 */
export function resetPath() {
    cachedPath = null;
}
/**
 * Get Path constructor with dependency injection support
 *
 * Priority:
 * 1. Injected dependency (via setPath)
 * 2. Global Path variable (backward compatibility)
 *
 * @returns Path constructor
 * @throws Error if Path is not available from either source
 */
export function getPath() {
    if (cachedPath)
        return cachedPath;
    if (typeof Path !== 'undefined')
        return Path;
    throw new Error('Path from pave.js is not available. Make sure pave.js is loaded or use createP5Pave2Riso() to inject dependencies.');
}
/**
 * Type-safe wrapper for Path.bounds
 *
 * @param path - Path to get bounds from
 * @returns Bounding box [[minX, minY], [maxX, maxY]]
 */
export function getPathBounds(path) {
    const Path = getPath();
    return Path.bounds(path);
}
/**
 * Type-safe wrapper for Path.drawToCanvas
 *
 * @param path - Path to draw
 * @param context - Canvas 2D rendering context
 */
export function drawPathToCanvas(path, context) {
    const Path = getPath();
    Path.drawToCanvas(path, context);
}
/**
 * Type-safe wrapper for Path.line
 *
 * @param start - Start point [x, y]
 * @param end - End point [x, y]
 * @returns Line path
 */
export function createLine(start, end) {
    const Path = getPath();
    return Path.line(start, end);
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
export function createCubicBezier(start, control1, control2, end) {
    const Path = getPath();
    return Path.cubicBezier(start, control1, control2, end);
}
/**
 * Type-safe wrapper for Path.quadraticBezier
 *
 * @param start - Start point [x, y]
 * @param control - Control point [x, y]
 * @param end - End point [x, y]
 * @returns Quadratic bezier path
 */
export function createQuadraticBezier(start, control, end) {
    const Path = getPath();
    return Path.quadraticBezier(start, control, end);
}
/**
 * Type-safe wrapper for Path.circle
 *
 * @param center - Center point [x, y]
 * @param radius - Circle radius
 * @returns Circle path
 */
export function createCircle(center, radius) {
    const Path = getPath();
    return Path.circle(center, radius);
}
/**
 * Type-safe wrapper for Path.join
 *
 * @param paths - Array of paths to join
 * @returns Joined path
 */
export function joinPaths(paths) {
    const Path = getPath();
    return Path.join(paths);
}
/**
 * Type-safe wrapper for Path.close
 *
 * @param path - Path to close
 * @param options - Close options
 * @returns Closed path
 */
export function closePath(path, options) {
    const Path = getPath();
    return Path.close(path, options);
}
/**
 * Type-safe wrapper for creating an empty path
 *
 * @returns Empty path (circle with radius 0)
 */
export function createEmptyPath() {
    return createCircle([0, 0], 0);
}
/**
 * Type-safe wrapper for Path.unite
 *
 * @param paths - Paths to unite
 * @returns United path
 */
export function unitePaths(paths) {
    const Path = getPath();
    return Path.unite(paths);
}
/**
 * Type-safe wrapper for Path.subtract
 *
 * @param path - Base path
 * @param subtrahends - Paths to subtract
 * @returns Subtracted path
 */
export function subtractPaths(path, subtrahends) {
    const Path = getPath();
    return Path.subtract(path, subtrahends);
}
//# sourceMappingURL=pave-wrapper.js.map