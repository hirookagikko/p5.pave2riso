/**
 * Type-safe wrappers for linearly vec2 operations
 *
 * Provides a centralized, typed interface to the linearly vec2 library.
 * Supports both dependency injection and global fallback for backward compatibility.
 *
 * @module utils/vec2-wrapper
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import type { Vec2, Vec2Static } from '../types/linearly.js'

/**
 * Cached vec2 instance for dependency injection
 * @internal
 */
let cachedVec2: Vec2Static | null = null

/**
 * Inject vec2 dependency
 *
 * Use this to explicitly set the vec2 dependency instead of relying on globals.
 * Called automatically by `createP5Pave2Riso()`.
 *
 * @param v - vec2 constructor from linearly
 */
export function setVec2(v: Vec2Static): void {
  cachedVec2 = v
}

/**
 * Reset vec2 dependency to null
 *
 * Useful for testing to clear injected dependencies.
 */
export function resetVec2(): void {
  cachedVec2 = null
}

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
export function getVec2(): Vec2Static {
  if (cachedVec2) return cachedVec2
  if (typeof vec2 !== 'undefined') return vec2
  throw new Error('vec2 from linearly is not available. Make sure linearly is loaded or use createP5Pave2Riso() to inject dependencies.')
}

/**
 * Create a vec2 from coordinates
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Vec2 vector
 */
export function createVec2(x: number, y: number): Vec2 {
  const vec2 = getVec2()
  return vec2.of(x, y)
}
