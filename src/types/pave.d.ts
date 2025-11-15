/**
 * Type definitions for Pave.js (@baku89/pave)
 *
 * Since Pave.js doesn't provide official TypeScript definitions and is loaded via CDN,
 * we define the subset of APIs used in this project as global declarations.
 */

declare global {
  /**
   * Pave path object
   */
  interface PavePath {
    curves?: unknown[]
    [key: string]: unknown
  }

  /**
   * Path constructor and static methods
   */
  interface PavePathStatic {
    // Path creation
    line(start: [number, number], end: [number, number]): PavePath
    cubicBezier(
      start: [number, number],
      control1: [number, number],
      control2: [number, number],
      end: [number, number]
    ): PavePath
    quadraticBezier(
      start: [number, number],
      control: [number, number],
      end: [number, number]
    ): PavePath
    circle(center: [number, number], radius: number): PavePath
    rect(topLeft: [number, number], bottomRight: [number, number]): PavePath

    // Path operations
    join(paths: PavePath[]): PavePath
    close(path: PavePath, options?: { fuse?: boolean; group?: number }): PavePath
    empty(): PavePath

    // Boolean operations
    unite(paths: PavePath[]): PavePath
    subtract(path: PavePath, subtrahends: PavePath[]): PavePath

    // Measurements
    bounds(path: PavePath): [[number, number], [number, number]]

    // Canvas operations
    drawToCanvas(path: PavePath, context: CanvasRenderingContext2D): void
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
