/**
 * Type-safe wrappers for linearly vec2 operations
 *
 * Provides a centralized, typed interface to the linearly vec2 library
 * loaded via CDN. All external vec2 operations should go through
 * these wrappers to ensure type safety.
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import type { Vec2, Vec2Static } from '../types/linearly.js'

/**
 * Get vec2 constructor from global context with type safety
 *
 * @returns vec2 constructor from global scope
 * @throws Error if vec2 is not available
 */
export function getVec2(): Vec2Static {
  if (typeof vec2 === 'undefined') {
    throw new Error('vec2 from linearly is not available. Make sure linearly is loaded.')
  }
  return vec2
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

/**
 * Add two vec2 vectors
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns Sum vector
 */
export function addVec2(a: Vec2, b: Vec2): Vec2 {
  const vec2 = getVec2()
  return vec2.add(a, b)
}

/**
 * Subtract two vec2 vectors
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns Difference vector
 */
export function subVec2(a: Vec2, b: Vec2): Vec2 {
  const vec2 = getVec2()
  return vec2.sub(a, b)
}

/**
 * Multiply vec2 by scalar
 *
 * @param v - Vector to multiply
 * @param scalar - Scalar value
 * @returns Scaled vector
 */
export function mulVec2(v: Vec2, scalar: number): Vec2 {
  const vec2 = getVec2()
  return vec2.mul(v, scalar)
}

/**
 * Divide vec2 by scalar
 *
 * @param v - Vector to divide
 * @param scalar - Scalar value
 * @returns Scaled vector
 */
export function divVec2(v: Vec2, scalar: number): Vec2 {
  const vec2 = getVec2()
  return vec2.div(v, scalar)
}
