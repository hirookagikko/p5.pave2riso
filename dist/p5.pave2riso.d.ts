/**
 * Pave-Riso TypeScript Library
 *
 * Public API exports
 */
export { pave2Riso } from './core.js';
export { createInkDepth } from './utils/inkDepth.js';
export { p2r } from './utils/factory.js';
export type { P2RContext, P2ROptions } from './utils/factory.js';
export { PathIntersect, PathExclude, isPathsOverlap } from './utils/pathfinder.js';
export { ot2pave } from './utils/font-utils.js';
export type { Pave2RisoOptions, RenderMode, PavePath } from './types/core.js';
export type { FillConfig, SolidFillConfig, PatternFillConfig, GradientFillConfig, ImageFillConfig, GradientType, GradientDirection, ColorStop, ImageFit, AlignX, AlignY } from './types/fill.js';
export type { StrokeConfig, SolidStrokeConfig, DashedStrokeConfig, PatternStrokeConfig, GradientStrokeConfig, StrokeCap } from './types/stroke.js';
export type { FilterConfig, HalftoneConfig, DitherConfig, FilterType } from './types/effects.js';
//# sourceMappingURL=index.d.ts.map