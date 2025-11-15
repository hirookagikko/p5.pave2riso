/**
 * Type definitions for linearly
 *
 * Minimal definitions for vec2 operations used in this project.
 * Linearly is loaded via CDN and provides vector math operations.
 */

declare global {
  /**
   * 2D vector type
   */
  interface Vec2 {
    readonly 0: number
    readonly 1: number
    readonly length: 2
    [index: number]: number
  }

  /**
   * vec2 constructor and static methods
   */
  interface Vec2Static {
    of(x: number, y: number): Vec2
    add(a: Vec2, b: Vec2): Vec2
    sub(a: Vec2, b: Vec2): Vec2
    mul(v: Vec2, scalar: number): Vec2
    div(v: Vec2, scalar: number): Vec2
  }

  const vec2: Vec2Static

  interface Window {
    vec2: Vec2Static
  }

  namespace globalThis {
    const vec2: Vec2Static
  }
}

// Export types for use in other modules
export type { Vec2, Vec2Static }
