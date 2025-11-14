import type { Pave2RisoOptions } from '../types/core.js'
import { pave2Riso } from '../core.js'

/**
 * Context for p2r factory function containing channels and canvas size
 */
export type P2RContext = Pick<Pave2RisoOptions, 'channels' | 'canvasSize'>

/**
 * Options for p2r factory function (excludes channels and canvasSize)
 */
export type P2ROptions = Omit<Pave2RisoOptions, 'channels' | 'canvasSize'>

/**
 * Factory function that creates a pre-configured pave2Riso renderer
 *
 * @param context - Channels and canvas size to bind
 * @returns A function that accepts path and style options
 *
 * @example
 * ```typescript
 * const render = p2r({ channels, canvasSize })
 * render({ path: myPath, fill: { color: blue, channelVals: [100, 0, 0] } })
 * ```
 */
export const p2r = (context: P2RContext) => {
  return (ops: P2ROptions) => pave2Riso({ ...context, ...ops })
}
