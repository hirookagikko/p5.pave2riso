/**
 * Ink depth Branded Type definition and utilities
 */

/**
 * Ink depth (0-255 p5.js color value)
 * Branded Type for explicit domain concept
 */
export type InkDepth = number & { readonly __brand: 'InkDepth' }

/**
 * Convert ink depth percentage (0-100) to p5.js color value (0-255)
 *
 * Implements linear interpolation directly without depending on p5.js global map function
 *
 * @param value - Ink depth percentage (0-100)
 * @returns p5.js color value (0-255)
 *
 * @example
 * const depth = createInkDepth(50) // 128
 * const full = createInkDepth(100) // 255
 * const none = createInkDepth(0)   // 0
 */
export const createInkDepth = (value: number): InkDepth => {
  // 線形補間: (value / 100) * 255
  // p5.jsのmap(value, 0, 100, 0, 255)と同等
  const mapped = (value / 100) * 255
  return Math.round(mapped) as InkDepth
}

/**
 * Convert InkDepth type to number type (safe type cast)
 *
 * @param inkDepth - InkDepth value
 * @returns number value
 */
export const toNumber = (inkDepth: InkDepth): number => {
  return inkDepth as number
}
