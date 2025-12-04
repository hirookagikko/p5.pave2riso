/**
 * Pave-Riso TypeScript Library
 *
 * Public API exports
 */

// Dependency Injection factory (recommended for ESM)
export { createP5Pave2Riso } from './create.js'
export type { P5Pave2RisoInstance, OpenTypeCommand } from './create.js'
export type { P5Pave2RisoDeps } from './types/dependencies.js'

// メイン関数 (backward compatible - uses global variables)
export { pave2Riso } from './core.js'

// ユーティリティ
export { createInkDepth } from './utils/inkDepth.js'

// Factory function
export { p2r } from './utils/factory.js'
export type { P2RContext, P2ROptions } from './utils/factory.js'

// Pathfinder utilities
export { PathIntersect, PathSubtract, PathExclude, isPathsOverlap, PathOffset, cleanupPaperResources } from './utils/pathfinder.js'

// Font utilities
export { ot2pave } from './utils/font-utils.js'

// Debug utilities
export { enableDebug, disableDebug, isDebugEnabled, initDebugFromEnv } from './utils/debug.js'

// 型定義
export type {
  Pave2RisoOptions,
  RenderMode,
  PavePath,
  PaveCurve,
  PaveCurveSegment,
  PaveCurveVertex,
  PaveCurveVertexXY,
  PaveCurvePoint,
  PaveCurveElement
} from './types/core.js'
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
  StrokeCap,
  StrokeJoin
} from './types/stroke.js'
export type {
  FilterConfig,
  PosterizeFilter,
  BlurFilter,
  ThresholdFilter,
  NoArgFilter,
  LegacyFilterConfig,
  HalftoneConfig,
  DitherConfig,
  FilterType
} from './types/effects.js'
export { normalizeFilterConfig } from './types/effects.js'
