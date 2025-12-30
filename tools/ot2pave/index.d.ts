/**
 * ot2pave - OpenType.js to Pave.js Path Converter
 * TypeScript type definitions
 */

/**
 * OpenType.js path command
 */
export interface OTCommand {
  type: 'M' | 'L' | 'C' | 'Q' | 'Z'
  x: number
  y: number
  x1?: number
  y1?: number
  x2?: number
  y2?: number
}

/**
 * Pave.js Path (simplified)
 */
export interface PavePath {
  curves: unknown[]
}

/**
 * Pave.js Path static methods (simplified)
 */
export interface PavePathStatic {
  bounds(path: PavePath): [[number, number], [number, number]]
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
  join(paths: PavePath[]): PavePath
  close(path: PavePath, options?: { fuse?: boolean; group?: number }): PavePath
  unite(paths: PavePath[]): PavePath
  subtract(path: PavePath, subtrahends: PavePath[]): PavePath
  toSVGString(path: PavePath): string
  drawToCanvas(path: PavePath, context: CanvasRenderingContext2D): void
}

/**
 * Path information with metadata (for debugging)
 */
export interface PathInfo {
  path: PavePath
  area: number
  winding: number
  bounds: [[number, number], [number, number]]
}

/**
 * Options for ot2pave conversion
 */
export interface Ot2paveOptions {
  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean

  /**
   * Array to collect individual paths for debugging
   * @default null
   */
  debugPaths?: PathInfo[] | null
}

/**
 * Dependencies for createOt2pave
 */
export interface Ot2paveDeps {
  /**
   * Pave.js Path static object
   * Required: import { Path } from '@baku89/pave'
   */
  Path: PavePathStatic
}

/**
 * The ot2pave converter function
 */
export type Ot2paveFunction = (
  commands: OTCommand[],
  options?: Ot2paveOptions
) => PavePath

/**
 * Create ot2pave converter with dependency injection
 *
 * @param deps - Dependencies (Path from Pave.js)
 * @returns ot2pave function
 *
 * @example
 * ```typescript
 * import { Path } from '@baku89/pave'
 * import opentype from 'opentype.js'
 * import { createOt2pave } from 'ot2pave'
 *
 * const ot2pave = createOt2pave({ Path })
 *
 * const font = await opentype.load('font.ttf')
 * const otPath = font.getPath('Hello', 0, 100, 72)
 * const pavePath = ot2pave(otPath.commands)
 * ```
 */
export function createOt2pave(deps: Ot2paveDeps): Ot2paveFunction

export default createOt2pave
