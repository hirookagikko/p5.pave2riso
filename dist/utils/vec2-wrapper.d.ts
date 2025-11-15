/**
 * Type-safe wrappers for linearly vec2 operations
 *
 * Provides a centralized, typed interface to the linearly vec2 library
 * loaded via CDN. All external vec2 operations should go through
 * these wrappers to ensure type safety.
 */
import type { Vec2, Vec2Static } from '../types/linearly.js';
/**
 * Get vec2 constructor from global context with type safety
 *
 * @returns vec2 constructor from global scope
 * @throws Error if vec2 is not available
 */
export declare function getVec2(): Vec2Static;
/**
 * Create a vec2 from coordinates
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Vec2 vector
 */
export declare function createVec2(x: number, y: number): Vec2;
/**
 * Add two vec2 vectors
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns Sum vector
 */
export declare function addVec2(a: Vec2, b: Vec2): Vec2;
/**
 * Subtract two vec2 vectors
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns Difference vector
 */
export declare function subVec2(a: Vec2, b: Vec2): Vec2;
/**
 * Multiply vec2 by scalar
 *
 * @param v - Vector to multiply
 * @param scalar - Scalar value
 * @returns Scaled vector
 */
export declare function mulVec2(v: Vec2, scalar: number): Vec2;
/**
 * Divide vec2 by scalar
 *
 * @param v - Vector to divide
 * @param scalar - Scalar value
 * @returns Scaled vector
 */
export declare function divVec2(v: Vec2, scalar: number): Vec2;
//# sourceMappingURL=vec2-wrapper.d.ts.map