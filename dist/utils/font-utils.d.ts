/**
 * Font utilities for converting OpenType.js font paths to pave.js paths
 *
 * This module provides functions to convert OpenType.js font commands
 * into pave.js Path objects with proper handling of holes and compound paths.
 */
import type { PavePath } from '../types/core.js';
/**
 * OpenType.js command types
 */
interface OTCommand {
    type: 'M' | 'L' | 'C' | 'Q' | 'Z';
    x: number;
    y: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
}
/**
 * Path information with metadata
 */
interface PathInfo {
    path: PavePath;
    area: number;
    winding: number;
    bounds: [[number, number], [number, number]];
}
/**
 * Options for ot2pave conversion
 */
interface Ot2paveOptions {
    /**
     * Optional array to store individual paths for debugging
     */
    debugPaths?: PathInfo[] | null;
}
/**
 * Converts OpenType.js font commands to a pave.js Path
 *
 * This function handles the complex task of converting font outlines to paths,
 * including proper handling of:
 * - Multiple contours (outer shapes and holes)
 * - Winding direction detection
 * - Path union and subtraction operations
 * - Edge cases and error conditions
 *
 * Algorithm overview:
 * 1. Collect all individual paths from OpenType commands
 * 2. Sort paths by area (largest first)
 * 3. Use largest path as base (always treated as solid)
 * 4. Sequentially integrate remaining paths based on their relationship to the result
 *
 * @param commands - Array of OpenType.js path commands
 * @param options - Conversion options
 * @returns Combined pave.js Path
 *
 * @example
 * ```typescript
 * // Load font with opentype.js
 * const font = opentype.load('font.ttf')
 * const path = font.getPath('A', 0, 100, 72)
 * const pavePath = ot2pave(path.commands)
 * ```
 */
export declare const ot2pave: (commands: OTCommand[], options?: Ot2paveOptions) => PavePath;
export {};
//# sourceMappingURL=font-utils.d.ts.map