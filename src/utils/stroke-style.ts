/**
 * Stroke style conversion utilities
 *
 * Shared functions for converting stroke cap and join values
 * between different formats (p5.js constants and Canvas API)
 */

import type { StrokeCap, StrokeJoin } from '../types/stroke.js'

/**
 * Convert strokeCap string to p5.js constant
 *
 * @param cap - StrokeCap value ('round' | 'square' | 'butt')
 * @returns p5.js constant string (ROUND, SQUARE)
 *
 * @example
 * strokeCap(getStrokeCapConstant('round'))  // Uses ROUND
 */
export const getStrokeCapConstant = (cap: StrokeCap | undefined): string => {
  switch (cap) {
    case 'round':
      return ROUND
    case 'square':
      return SQUARE
    case 'butt':
      return SQUARE  // p5.js doesn't have BUTT, use SQUARE instead
    default:
      return ROUND  // Default is ROUND
  }
}

/**
 * Convert strokeJoin string to p5.js constant
 *
 * @param join - StrokeJoin value ('miter' | 'bevel' | 'round')
 * @returns p5.js constant string (MITER, BEVEL, ROUND)
 *
 * @example
 * strokeJoin(getStrokeJoinConstant('miter'))  // Uses MITER
 */
export const getStrokeJoinConstant = (join: StrokeJoin | undefined): string => {
  switch (join) {
    case 'miter':
      return MITER
    case 'bevel':
      return BEVEL
    case 'round':
      return ROUND
    default:
      return MITER  // Default is MITER
  }
}

/**
 * Convert strokeCap string to Canvas API lineCap value
 *
 * @param cap - StrokeCap value ('round' | 'square' | 'butt')
 * @returns CanvasLineCap value
 *
 * @example
 * ctx.lineCap = getCanvasLineCap('round')
 */
export const getCanvasLineCap = (cap: StrokeCap | undefined): CanvasLineCap => {
  switch (cap) {
    case 'round':
      return 'round'
    case 'square':
      return 'square'
    case 'butt':
      return 'butt'
    default:
      return 'round'  // Default is round
  }
}

/**
 * Convert strokeJoin string to Canvas API lineJoin value
 *
 * @param join - StrokeJoin value ('miter' | 'bevel' | 'round')
 * @returns CanvasLineJoin value
 *
 * @example
 * ctx.lineJoin = getCanvasLineJoin('miter')
 */
export const getCanvasLineJoin = (join: StrokeJoin | undefined): CanvasLineJoin => {
  switch (join) {
    case 'miter':
      return 'miter'
    case 'bevel':
      return 'bevel'
    case 'round':
      return 'round'
    default:
      return 'miter'  // Default is miter
  }
}
