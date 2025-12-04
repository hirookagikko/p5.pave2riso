/**
 * Pave-Riso TypeScript Library
 *
 * Public API exports
 */
export { createP5Pave2Riso } from './create.js';
export type { P5Pave2RisoInstance, OpenTypeCommand } from './create.js';
export type { P5Pave2RisoDeps } from './types/dependencies.js';
export { pave2Riso } from './core.js';
export { createInkDepth } from './utils/inkDepth.js';
export { p2r } from './utils/factory.js';
export type { P2RContext, P2ROptions } from './utils/factory.js';
export { PathIntersect, PathSubtract, PathExclude, isPathsOverlap, PathOffset, cleanupPaperResources } from './utils/pathfinder.js';
export { ot2pave } from './utils/font-utils.js';
export type { Pave2RisoOptions, RenderMode, PavePath, PaveCurve, PaveCurveSegment, PaveCurveVertex, PaveCurveVertexXY, PaveCurvePoint, PaveCurveElement } from './types/core.js';
export type { FillConfig, SolidFillConfig, PatternFillConfig, GradientFillConfig, ImageFillConfig, GradientType, GradientDirection, ColorStop, ImageFit, AlignX, AlignY } from './types/fill.js';
export type { StrokeConfig, SolidStrokeConfig, DashedStrokeConfig, PatternStrokeConfig, GradientStrokeConfig, StrokeCap, StrokeJoin } from './types/stroke.js';
export type { FilterConfig, PosterizeFilter, BlurFilter, ThresholdFilter, NoArgFilter, LegacyFilterConfig, HalftoneConfig, DitherConfig, FilterType } from './types/effects.js';
export { normalizeFilterConfig } from './types/effects.js';
//# sourceMappingURL=index.d.ts.map