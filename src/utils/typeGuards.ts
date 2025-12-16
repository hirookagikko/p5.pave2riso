/**
 * Type guard functions
 */

import type { FillConfig, SolidFillConfig, PatternFillConfig, GradientFillConfig, ImageFillConfig } from '../types/fill.js'
import type { StrokeConfig, SolidStrokeConfig, DashedStrokeConfig, PatternStrokeConfig, GradientStrokeConfig } from '../types/stroke.js'

/**
 * Type guards for FillConfig
 */

export const isSolidFill = (fill: FillConfig): fill is SolidFillConfig => {
  return fill.type === 'solid'
}

export const isPatternFill = (fill: FillConfig): fill is PatternFillConfig => {
  return fill.type === 'pattern'
}

export const isGradientFill = (fill: FillConfig): fill is GradientFillConfig => {
  return fill.type === 'gradient'
}

export const isImageFill = (fill: FillConfig): fill is ImageFillConfig => {
  return fill.type === 'image'
}

/**
 * Type guards for StrokeConfig
 */

export const isSolidStroke = (stroke: StrokeConfig): stroke is SolidStrokeConfig => {
  return stroke.type === 'solid'
}

export const isDashedStroke = (stroke: StrokeConfig): stroke is DashedStrokeConfig => {
  return stroke.type === 'dashed'
}

export const isPatternStroke = (stroke: StrokeConfig): stroke is PatternStrokeConfig => {
  return stroke.type === 'pattern'
}

export const isGradientStroke = (stroke: StrokeConfig): stroke is GradientStrokeConfig => {
  return stroke.type === 'gradient'
}
