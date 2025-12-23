/**
 * Alignment conversion utilities
 */
import type { AlignX, AlignY } from '../types/fill.js';
/**
 * Convert horizontal alignment to 0-1 numeric value
 *
 * @param alignX - Alignment value
 * @returns Numeric value 0-1 (0=left, 0.5=center, 1=right)
 *
 * @example
 * normalizeAlignX('left')   // 0
 * normalizeAlignX('center') // 0.5
 * normalizeAlignX('right')  // 1
 * normalizeAlignX(0.3)      // 0.3
 */
export declare const normalizeAlignX: (alignX: AlignX) => number;
/**
 * Convert vertical alignment to 0-1 numeric value
 *
 * @param alignY - Alignment value
 * @returns Numeric value 0-1 (0=top, 0.5=middle, 1=bottom)
 *
 * @example
 * normalizeAlignY('top')    // 0
 * normalizeAlignY('middle') // 0.5
 * normalizeAlignY('bottom') // 1
 * normalizeAlignY(0.7)      // 0.7
 */
export declare const normalizeAlignY: (alignY: AlignY) => number;
//# sourceMappingURL=alignment.d.ts.map