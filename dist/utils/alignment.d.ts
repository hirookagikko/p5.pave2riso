/**
 * アライメント変換ユーティリティ
 */
import type { AlignX, AlignY } from '../types/fill.js';
/**
 * 水平方向のアライメントを0-1の数値に変換
 *
 * @param alignX - アライメント値
 * @returns 0-1の数値（0=left, 0.5=center, 1=right）
 *
 * @example
 * normalizeAlignX('left')   // 0
 * normalizeAlignX('center') // 0.5
 * normalizeAlignX('right')  // 1
 * normalizeAlignX(0.3)      // 0.3
 */
export declare const normalizeAlignX: (alignX: AlignX) => number;
/**
 * 垂直方向のアライメントを0-1の数値に変換
 *
 * @param alignY - アライメント値
 * @returns 0-1の数値（0=top, 0.5=middle, 1=bottom）
 *
 * @example
 * normalizeAlignY('top')    // 0
 * normalizeAlignY('middle') // 0.5
 * normalizeAlignY('bottom') // 1
 * normalizeAlignY(0.7)      // 0.7
 */
export declare const normalizeAlignY: (alignY: AlignY) => number;
//# sourceMappingURL=alignment.d.ts.map