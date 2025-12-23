/**
 * Type-safe wrappers for linearly vec2 operations
 *
 * Provides a centralized, typed interface to the linearly vec2 library.
 * Supports both dependency injection and global fallback for backward compatibility.
 *
 * @module utils/vec2-wrapper
 */
import type { Vec2, Vec2Static } from '../types/linearly.js';
/**
 * Inject vec2 dependency
 *
 * Use this to explicitly set the vec2 dependency instead of relying on globals.
 * Called automatically by `createP5Pave2Riso()`.
 *
 * @param v - vec2 constructor from linearly
 */
export declare function setVec2(v: Vec2Static): void;
/**
 * Reset vec2 dependency to null
 *
 * Useful for testing to clear injected dependencies.
 */
export declare function resetVec2(): void;
/**
 * Get vec2 constructor with dependency injection support
 *
 * Priority:
 * 1. Injected dependency (via setVec2)
 * 2. Global vec2 variable (backward compatibility)
 *
 * @returns vec2 constructor from global scope
 * @throws Error if vec2 is not available from either source
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
//# sourceMappingURL=vec2-wrapper.d.ts.map