/**
 * Type guard functions
 */
import type { FillConfig, SolidFillConfig, PatternFillConfig, GradientFillConfig, ImageFillConfig } from '../types/fill.js';
import type { StrokeConfig, SolidStrokeConfig, DashedStrokeConfig, PatternStrokeConfig, GradientStrokeConfig } from '../types/stroke.js';
/**
 * Type guards for FillConfig
 */
export declare const isSolidFill: (fill: FillConfig) => fill is SolidFillConfig;
export declare const isPatternFill: (fill: FillConfig) => fill is PatternFillConfig;
export declare const isGradientFill: (fill: FillConfig) => fill is GradientFillConfig;
export declare const isImageFill: (fill: FillConfig) => fill is ImageFillConfig;
/**
 * Type guards for StrokeConfig
 */
export declare const isSolidStroke: (stroke: StrokeConfig) => stroke is SolidStrokeConfig;
export declare const isDashedStroke: (stroke: StrokeConfig) => stroke is DashedStrokeConfig;
export declare const isPatternStroke: (stroke: StrokeConfig) => stroke is PatternStrokeConfig;
export declare const isGradientStroke: (stroke: StrokeConfig) => stroke is GradientStrokeConfig;
//# sourceMappingURL=typeGuards.d.ts.map