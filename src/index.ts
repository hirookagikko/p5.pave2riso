/**
 * Pave-Riso TypeScript Library
 *
 * Public API exports
 */

// メイン関数
export { pave2Riso } from './core.js'

// ユーティリティ
export { createInkDepth } from './utils/inkDepth.js'

// Factory function
export { p2r } from './utils/factory.js'
export type { P2RContext, P2ROptions } from './utils/factory.js'

// Pathfinder utilities
export { PathIntersect, PathSubtract, PathExclude, isPathsOverlap } from './utils/pathfinder.js'

// Font utilities
export { ot2pave } from './utils/font-utils.js'

// 型定義
export type { Pave2RisoOptions, RenderMode, PavePath } from './types/core.js'
export type {
  FillConfig,
  SolidFillConfig,
  PatternFillConfig,
  GradientFillConfig,
  ImageFillConfig,
  GradientType,
  GradientDirection,
  ColorStop,
  ImageFit,
  AlignX,
  AlignY
} from './types/fill.js'
export type {
  StrokeConfig,
  SolidStrokeConfig,
  DashedStrokeConfig,
  PatternStrokeConfig,
  GradientStrokeConfig,
  StrokeCap
} from './types/stroke.js'
export type { FilterConfig, HalftoneConfig, DitherConfig, FilterType } from './types/effects.js'
