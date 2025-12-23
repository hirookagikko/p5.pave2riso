/**
 * Input validation
 */

import type { Pave2RisoOptions, RenderMode } from '../types/core.js'
import type { FillConfig, ColorStop, ColorStopEntry, GradientType } from '../types/fill.js'
import type { StrokeConfig, StrokeCap, StrokeJoin } from '../types/stroke.js'
import type { FilterConfig, HalftoneConfig, DitherConfig, LegacyFilterConfig } from '../types/effects.js'
import { hasCurves } from '../types/core.js'

/** Valid gradient types */
const VALID_GRADIENT_TYPES: readonly GradientType[] = ['linear', 'radial', 'conic']

/** Valid stroke caps */
const VALID_STROKE_CAPS: readonly StrokeCap[] = ['round', 'square', 'butt']

/** Valid stroke joins */
const VALID_STROKE_JOINS: readonly StrokeJoin[] = ['miter', 'bevel', 'round']

/**
 * Validates that an optional number is finite
 */
const validateOptionalFiniteNumber = (
  value: number | undefined,
  context: string,
  options?: { min?: number; max?: number }
): void => {
  if (value === undefined) return
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${context} must be a finite number`)
  }
  if (options?.min !== undefined && value < options.min) {
    throw new TypeError(`${context} must be >= ${options.min}`)
  }
  if (options?.max !== undefined && value > options.max) {
    throw new TypeError(`${context} must be <= ${options.max}`)
  }
}

/**
 * Validates that each element in a number array is finite
 */
const validateFiniteNumberArray = (
  arr: number[],
  context: string,
  options?: { min?: number }
): void => {
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i]
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      throw new TypeError(`${context}[${i}] must be a finite number`)
    }
    if (options?.min !== undefined && val < options.min) {
      throw new TypeError(`${context}[${i}] must be >= ${options.min}`)
    }
  }
}

/**
 * Validates channelVals range (0-100)
 */
const validateChannelVals = (vals: number[], context: string): void => {
  if (!Array.isArray(vals)) {
    throw new TypeError(`${context}.channelVals must be an array`)
  }
  for (let i = 0; i < vals.length; i++) {
    const val = vals[i]
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      throw new TypeError(`${context}.channelVals[${i}] must be a finite number`)
    }
    if (val < 0 || val > 100) {
      throw new TypeError(`${context}.channelVals[${i}] must be between 0 and 100`)
    }
  }
}

/**
 * Validates ColorStopEntry
 */
const validateColorStopEntry = (entry: ColorStopEntry, context: string): void => {
  if (typeof entry.position !== 'number' || !Number.isFinite(entry.position)) {
    throw new TypeError(`${context}.position must be a finite number`)
  }
  if (entry.position < 0 || entry.position > 100) {
    throw new TypeError(`${context}.position must be between 0 and 100`)
  }
  if (typeof entry.depth !== 'number' || !Number.isFinite(entry.depth)) {
    throw new TypeError(`${context}.depth must be a finite number`)
  }
  if (entry.depth < 0 || entry.depth > 100) {
    throw new TypeError(`${context}.depth must be between 0 and 100`)
  }
}

/**
 * Validates ColorStops (order and values)
 */
const validateColorStops = (colorStops: ColorStop[], context: string): void => {
  if (!Array.isArray(colorStops) || colorStops.length === 0) {
    throw new TypeError(`${context}.colorStops must be a non-empty array`)
  }

  for (const cs of colorStops) {
    const csIndex = colorStops.indexOf(cs)
    const csContext = `${context}.colorStops[${csIndex}]`

    if (typeof cs.channel !== 'number' || !Number.isInteger(cs.channel) || cs.channel < 0) {
      throw new TypeError(`${csContext}.channel must be a non-negative integer`)
    }

    if (!Array.isArray(cs.stops) || cs.stops.length === 0) {
      throw new TypeError(`${csContext}.stops must be a non-empty array`)
    }

    // 各stopエントリの検証とposition順序の検証
    let prevPosition = -1
    for (const entry of cs.stops) {
      const entryIndex = cs.stops.indexOf(entry)
      validateColorStopEntry(entry, `${csContext}.stops[${entryIndex}]`)

      // position順序検証（昇順であること）
      if (entry.position < prevPosition) {
        throw new TypeError(`${csContext}.stops[${entryIndex}].position must be >= previous position (${prevPosition})`)
      }
      prevPosition = entry.position
    }
  }
}

/**
 * Validates FilterConfig
 *
 * Supports both legacy format (filterArgs) and new format (levels, radius, threshold)
 */
const validateFilterConfig = (filter: FilterConfig | LegacyFilterConfig, context: string): void => {
  if (!filter.filterType) {
    throw new TypeError(`${context}.filterType is required`)
  }

  // Legacy形式: filterArgsがある場合
  const legacy = filter as LegacyFilterConfig
  if (legacy.filterArgs !== undefined) {
    if (!Array.isArray(legacy.filterArgs)) {
      throw new TypeError(`${context}.filterArgs must be an array`)
    }
    // filterArgsは数値配列
    validateFiniteNumberArray(legacy.filterArgs, `${context}.filterArgs`, { min: 0 })
    return
  }

  // 新形式: 個別プロパティ
  switch (filter.filterType) {
    case 'posterize': {
      const f = filter as FilterConfig & { levels?: number }
      if (f.levels !== undefined) {
        validateOptionalFiniteNumber(f.levels, `${context}.levels`, { min: 2, max: 255 })
      }
      break
    }
    case 'blur': {
      const f = filter as FilterConfig & { radius?: number }
      validateOptionalFiniteNumber(f.radius, `${context}.radius`, { min: 0 })
      break
    }
    case 'threshold': {
      const f = filter as FilterConfig & { threshold?: number }
      validateOptionalFiniteNumber(f.threshold, `${context}.threshold`, { min: 0, max: 1 })
      break
    }
    case 'gray':
    case 'opaque':
    case 'invert':
    case 'dilate':
    case 'erode':
      // 引数なしフィルター、追加検証不要
      break
    default: {
      // 未知のフィルタータイプは許容（拡張性のため）
      break
    }
  }
}

/**
 * Validates FilterConfig array or null
 */
const validateFilters = (
  filters: FilterConfig | LegacyFilterConfig | (FilterConfig | LegacyFilterConfig)[] | null | undefined,
  context: string
): void => {
  if (filters === null || filters === undefined) return
  if (Array.isArray(filters)) {
    filters.forEach((f, i) => validateFilterConfig(f, `${context}[${i}]`))
  } else {
    validateFilterConfig(filters, context)
  }
}

/**
 * Validates HalftoneConfig
 *
 * halftoneArgs is a mixed-type array like [type, size, angle, frequency]
 * Type definition is number[] but actually (string | number)[]
 * Only validates that it's an array
 */
const validateHalftoneConfig = (
  config: HalftoneConfig | null | undefined,
  context: string
): void => {
  if (config === null || config === undefined) return
  if (!Array.isArray(config.halftoneArgs)) {
    throw new TypeError(`${context}.halftoneArgs must be an array`)
  }
  // halftoneArgsは混合型配列のため、要素の検証はスキップ
}

/**
 * Validates DitherConfig
 *
 * ditherArgs is a mixed-type array like ['floydSteinberg']
 * Type definition is number[] but actually (string | number)[]
 * Only validates that it's an array
 */
const validateDitherConfig = (
  config: DitherConfig | null | undefined,
  context: string
): void => {
  if (config === null || config === undefined) return
  if (!Array.isArray(config.ditherArgs)) {
    throw new TypeError(`${context}.ditherArgs must be an array`)
  }
  // ditherArgsは混合型配列のため、要素の検証はスキップ
}

/**
 * Validates effect settings (filter, halftone, dither)
 */
const validateEffects = (
  config: { filter?: FilterConfig | FilterConfig[] | null; halftone?: HalftoneConfig | null; dither?: DitherConfig | null },
  context: string
): void => {
  validateFilters(config.filter, `${context}.filter`)
  validateHalftoneConfig(config.halftone, `${context}.halftone`)
  validateDitherConfig(config.dither, `${context}.dither`)
}

/**
 * Detailed validation of Fill configuration
 */
const validateFillConfig = (fill: FillConfig): void => {
  switch (fill.type) {
    case 'solid':
      validateChannelVals(fill.channelVals, 'fill')
      break

    case 'pattern':
      validateChannelVals(fill.channelVals, 'fill')
      if (!fill.PTN || typeof fill.PTN !== 'string') {
        throw new TypeError('fill.PTN must be a non-empty string')
      }
      if (!Array.isArray(fill.patternArgs)) {
        throw new TypeError('fill.patternArgs must be an array')
      }
      validateOptionalFiniteNumber(fill.patternAngle, 'fill.patternAngle')
      break

    case 'gradient':
      if (!VALID_GRADIENT_TYPES.includes(fill.gradientType)) {
        throw new TypeError(`fill.gradientType must be one of: ${VALID_GRADIENT_TYPES.join(', ')}`)
      }
      validateColorStops(fill.colorStops, 'fill')
      break

    case 'image':
      if (!fill.image) {
        throw new TypeError('fill.image is required for image fill')
      }
      if (fill.channelVals) {
        validateChannelVals(fill.channelVals, 'fill')
      }
      validateOptionalFiniteNumber(fill.scale, 'fill.scale', { min: 0 })
      validateOptionalFiniteNumber(fill.rotate, 'fill.rotate')
      if (fill.offset) {
        if (!Array.isArray(fill.offset) || fill.offset.length !== 2) {
          throw new TypeError('fill.offset must be [x, y]')
        }
        validateFiniteNumberArray(fill.offset, 'fill.offset')
      }
      break

    default: {
      const exhaustiveCheck: never = fill
      throw new TypeError(`Unknown fill type: ${(exhaustiveCheck as FillConfig).type}`)
    }
  }

  // エフェクト設定の検証
  validateEffects(fill, 'fill')
}

/**
 * Detailed validation of Stroke configuration
 */
const validateStrokeConfig = (stroke: StrokeConfig): void => {
  // strokeWeight検証
  if (typeof stroke.strokeWeight !== 'number' || !Number.isFinite(stroke.strokeWeight)) {
    throw new TypeError('stroke.strokeWeight must be a finite number')
  }
  if (stroke.strokeWeight <= 0) {
    throw new TypeError('stroke.strokeWeight must be a positive number')
  }

  // strokeCap検証
  if (stroke.strokeCap !== undefined && !VALID_STROKE_CAPS.includes(stroke.strokeCap)) {
    throw new TypeError(`stroke.strokeCap must be one of: ${VALID_STROKE_CAPS.join(', ')}`)
  }

  // strokeJoin検証
  if (stroke.strokeJoin !== undefined && !VALID_STROKE_JOINS.includes(stroke.strokeJoin)) {
    throw new TypeError(`stroke.strokeJoin must be one of: ${VALID_STROKE_JOINS.join(', ')}`)
  }

  switch (stroke.type) {
    case 'solid':
      validateChannelVals(stroke.channelVals, 'stroke')
      break

    case 'dashed':
      validateChannelVals(stroke.channelVals, 'stroke')
      if (!Array.isArray(stroke.dashArgs) || stroke.dashArgs.length < 2) {
        throw new TypeError('stroke.dashArgs must be an array with at least 2 elements')
      }
      validateFiniteNumberArray(stroke.dashArgs, 'stroke.dashArgs', { min: 0 })
      break

    case 'pattern':
      validateChannelVals(stroke.channelVals, 'stroke')
      if (!stroke.PTN || typeof stroke.PTN !== 'string') {
        throw new TypeError('stroke.PTN must be a non-empty string')
      }
      if (!Array.isArray(stroke.patternArgs)) {
        throw new TypeError('stroke.patternArgs must be an array')
      }
      validateOptionalFiniteNumber(stroke.patternAngle, 'stroke.patternAngle')
      if (stroke.dashArgs) {
        if (!Array.isArray(stroke.dashArgs) || stroke.dashArgs.length < 2) {
          throw new TypeError('stroke.dashArgs must be an array with at least 2 elements')
        }
        validateFiniteNumberArray(stroke.dashArgs, 'stroke.dashArgs', { min: 0 })
      }
      break

    case 'gradient':
      if (!VALID_GRADIENT_TYPES.includes(stroke.gradientType)) {
        throw new TypeError(`stroke.gradientType must be one of: ${VALID_GRADIENT_TYPES.join(', ')}`)
      }
      validateColorStops(stroke.colorStops, 'stroke')
      if (stroke.dashArgs) {
        if (!Array.isArray(stroke.dashArgs) || stroke.dashArgs.length < 2) {
          throw new TypeError('stroke.dashArgs must be an array with at least 2 elements')
        }
        validateFiniteNumberArray(stroke.dashArgs, 'stroke.dashArgs', { min: 0 })
      }
      break

    default: {
      const exhaustiveCheck: never = stroke
      throw new TypeError(`Unknown stroke type: ${(exhaustiveCheck as StrokeConfig).type}`)
    }
  }

  // エフェクト設定の検証
  validateEffects(stroke, 'stroke')
}

/**
 * Validates Pave2RisoOptions
 *
 * @param options - Options to validate
 * @throws {TypeError} If required parameters are missing or invalid
 */
export const validateOptions = (options: Pave2RisoOptions): void => {
  // pathの検証
  if (!options.path) {
    throw new TypeError('path is required')
  }

  // pathの構造検証
  if (!hasCurves(options.path)) {
    throw new TypeError('path must have curves property')
  }

  // canvasSizeの検証
  if (!Array.isArray(options.canvasSize) || options.canvasSize.length !== 2) {
    throw new TypeError('canvasSize must be [width, height]')
  }

  // canvasSizeの値検証
  const [width, height] = options.canvasSize
  if (width <= 0 || height <= 0) {
    throw new TypeError('canvasSize must contain positive numbers')
  }
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new TypeError('canvasSize must contain finite numbers')
  }

  // channelsの検証
  if (!Array.isArray(options.channels) || options.channels.length === 0) {
    throw new TypeError('channels must be a non-empty array')
  }

  // channelsの各要素がp5.Graphicsかどうか検証
  for (let i = 0; i < options.channels.length; i++) {
    const channel = options.channels[i]
    if (typeof channel?.drawingContext === 'undefined') {
      throw new TypeError(`channels[${i}] is not a valid p5.Graphics object`)
    }
  }

  // modeの検証
  const validModes: RenderMode[] = ['overprint', 'cutout', 'join']
  if (!options.mode || !validModes.includes(options.mode)) {
    throw new TypeError(`mode must be one of: ${validModes.join(', ')}`)
  }

  // fill/strokeの詳細検証
  if (options.fill) {
    if (!options.fill.type) {
      throw new TypeError('fill must have a type property')
    }
    validateFillConfig(options.fill)
  }
  if (options.stroke) {
    if (!options.stroke.type) {
      throw new TypeError('stroke must have a type property')
    }
    validateStrokeConfig(options.stroke)
  }

  // clippingPathの検証
  if (options.clippingPath && !hasCurves(options.clippingPath)) {
    throw new TypeError('clippingPath must be a valid Pave path with curves')
  }

  // トップレベルのエフェクト設定の検証
  validateEffects(options, 'options')
}
