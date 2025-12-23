/**
 * Discriminated Union type definitions for Fill configuration
 */

import type { FilterConfig, HalftoneConfig, DitherConfig } from './effects.js'
import type { Percentage } from './branded.js'

/**
 * Gradient type
 */
export type GradientType = 'linear' | 'radial' | 'conic'

/**
 * Gradient direction (for linear gradients)
 */
export type GradientDirection =
  | 'TD'    // Top to Down
  | 'DT'    // Down to Top
  | 'LR'    // Left to Right
  | 'RL'    // Right to Left
  | 'LTRB'  // Left-Top to Right-Bottom
  | 'RTLB'  // Right-Top to Left-Bottom
  | 'LBRT'  // Left-Bottom to Right-Top
  | 'RBLT'  // Right-Bottom to Left-Top

/**
 * Individual entry for gradient color stop
 */
export interface ColorStopEntry {
  /**
   * Position (0-100%)
   * Represents position within the gradient
   */
  position: Percentage | number

  /**
   * Ink density (0-100%)
   * Ink intensity at this position
   */
  depth: Percentage | number
}

/**
 * Gradient color stop
 */
export interface ColorStop {
  /**
   * Channel index
   */
  channel: number

  /**
   * Array of color stops
   */
  stops: ColorStopEntry[]
}

/**
 * Image fit mode
 */
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none'

/**
 * Horizontal alignment
 */
export type AlignX = 'left' | 'center' | 'right' | number

/**
 * Vertical alignment
 */
export type AlignY = 'top' | 'middle' | 'bottom' | number

/**
 * Solid fill configuration
 */
export interface SolidFillConfig {
  type: 'solid'

  /**
   * Ink density for each channel (0-100)
   */
  channelVals: number[]

  /**
   * Filter configuration
   */
  filter?: FilterConfig | FilterConfig[] | null

  /**
   * Halftone configuration
   */
  halftone?: HalftoneConfig | null

  /**
   * Dither configuration
   */
  dither?: DitherConfig | null
}

/**
 * Pattern fill configuration
 */
export interface PatternFillConfig {
  type: 'pattern'

  /**
   * Pattern name (key in PTN object)
   */
  PTN: string

  /**
   * Arguments for pattern function
   */
  patternArgs: unknown[]

  /**
   * Pattern rotation angle (in degrees)
   * @example
   * patternAngle: 45  // 45 degree rotation
   * patternAngle: 90  // 90 degree rotation
   */
  patternAngle?: number

  /**
   * Ink density for each channel (0-100)
   */
  channelVals: number[]

  /**
   * Filter configuration
   */
  filter?: FilterConfig | FilterConfig[] | null

  /**
   * Halftone configuration
   */
  halftone?: HalftoneConfig | null

  /**
   * Dither configuration
   */
  dither?: DitherConfig | null
}

/**
 * Gradient fill configuration
 */
export interface GradientFillConfig {
  type: 'gradient'

  /**
   * Gradient type
   */
  gradientType: GradientType

  /**
   * Gradient direction (linear gradient only)
   */
  gradientDirection?: GradientDirection

  /**
   * Color stops
   */
  colorStops: ColorStop[]

  /**
   * Filter configuration
   */
  filter?: FilterConfig | FilterConfig[] | null

  /**
   * Halftone configuration
   */
  halftone?: HalftoneConfig | null

  /**
   * Dither configuration
   */
  dither?: DitherConfig | null
}

/**
 * Image fill configuration
 */
export interface ImageFillConfig {
  type: 'image'

  /**
   * Image object
   */
  image: p5.Image

  /**
   * Fit mode
   */
  fit?: ImageFit

  /**
   * Horizontal alignment
   */
  alignX?: AlignX

  /**
   * Vertical alignment
   */
  alignY?: AlignY

  /**
   * Scale factor
   */
  scale?: number

  /**
   * Offset [x, y]
   */
  offset?: [number, number]

  /**
   * Rotation angle (in degrees)
   */
  rotate?: number

  /**
   * Ink density for each channel (0-100)
   */
  channelVals?: number[]

  /**
   * Filter configuration
   */
  filter?: FilterConfig | FilterConfig[] | null

  /**
   * Halftone configuration
   */
  halftone?: HalftoneConfig | null

  /**
   * Dither configuration
   */
  dither?: DitherConfig | null
}

/**
 * Discriminated Union for Fill configuration
 *
 * The type field determines the fill method,
 * allowing TypeScript to properly narrow the type
 */
export type FillConfig =
  | SolidFillConfig
  | PatternFillConfig
  | GradientFillConfig
  | ImageFillConfig
