/**
 * Stroke preprocessing helper functions
 *
 * Consolidates stroke preprocessing logic from core.ts
 * and eliminates if-else chains.
 */
import type { StrokeConfig, StrokeCap, StrokeJoin } from '../types/stroke.js';
import type { RenderMode } from '../types/core.js';
import type { DashPattern } from '../types/branded.js';
/**
 * Common parameters required for stroke preprocessing
 */
export interface StrokePreprocessParams {
    strokeWeight: number;
    dashArgs?: DashPattern;
    strokeCap?: StrokeCap;
    strokeJoin?: StrokeJoin;
}
/**
 * Determine if preprocessing is needed based on stroke type and mode
 *
 * Preprocessing rules:
 * - solid/dashed: Always preprocess in cutout/join modes
 * - pattern: Preprocess only in cutout mode (join handled in renderer)
 * - gradient: Preprocess only in cutout mode (join handled in renderer)
 *
 * @param strokeType - Stroke type
 * @param mode - Rendering mode
 * @returns true if preprocessing is required
 */
export declare const shouldApplyStrokePreprocess: (strokeType: StrokeConfig["type"], mode: RenderMode) => boolean;
/**
 * Extract parameters needed for preprocessing from StrokeConfig
 *
 * @param stroke - Stroke configuration
 * @returns Preprocessing parameters
 */
export declare const extractStrokePreprocessParams: (stroke: StrokeConfig) => StrokePreprocessParams;
//# sourceMappingURL=stroke-preprocess.d.ts.map