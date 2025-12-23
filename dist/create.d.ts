/**
 * Dependency Injection Factory for p5.pave2riso
 *
 * Provides a factory function to create library instances with explicit dependencies,
 * eliminating the need for global variables.
 *
 * @module create
 */
import type { P5Pave2RisoDeps } from './types/dependencies.js';
import type { P2RContext, P2ROptions } from './utils/factory.js';
import type { Pave2RisoOptions } from './types/core.js';
import type { PavePath } from './types/pave.js';
/**
 * OpenType.js command interface (for public API)
 */
export interface OpenTypeCommand {
    type: 'M' | 'L' | 'C' | 'Q' | 'Z';
    x: number;
    y: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
}
/**
 * Return type of createP5Pave2Riso factory
 */
export interface P5Pave2RisoInstance {
    /**
     * Main rendering function
     */
    pave2Riso: (options: Pave2RisoOptions) => void;
    /**
     * Factory function for creating pre-configured renderers
     */
    p2r: (context: P2RContext) => (ops: P2ROptions) => void;
    /**
     * Compute intersection of two paths
     */
    PathIntersect: (pathA: PavePath, pathB: PavePath) => PavePath;
    /**
     * Subtract pathB from pathA
     */
    PathSubtract: (pathA: PavePath, pathB: PavePath) => PavePath;
    /**
     * Unite two paths (combine areas)
     */
    PathUnite: (pathA: PavePath, pathB: PavePath) => PavePath;
    /**
     * Exclude overlapping areas of two paths
     */
    PathExclude: (pathA: PavePath, pathB: PavePath) => PavePath;
    /**
     * Offset a path by a distance (requires paper.js and PaperOffset)
     */
    PathOffset: (path: PavePath, distance: number) => PavePath;
    /**
     * Remove holes from a path, keeping only outer contours
     */
    PathRemoveHoles: (path: PavePath) => PavePath;
    /**
     * Check if two paths overlap
     */
    isPathsOverlap: (pathA: PavePath, pathB: PavePath) => boolean;
    /**
     * Convert OpenType.js commands to Pave.js path
     */
    ot2pave: (commands: OpenTypeCommand[]) => PavePath;
    /**
     * Reset injected dependencies (useful for testing)
     *
     * **Warning**: This clears the global dependency cache, which affects ALL
     * instances created by `createP5Pave2Riso()`. Only call this in test cleanup
     * or when you are certain no other code is using the library.
     *
     * After calling this, you must call `createP5Pave2Riso()` again before
     * using any library functions.
     */
    resetDependencies: () => void;
}
/**
 * Create a p5.pave2riso instance with explicit dependencies
 *
 * This factory function allows you to inject dependencies explicitly,
 * making the library more testable and ESM-compatible.
 *
 * @param deps - Dependencies to inject
 * @returns An object containing all library functions
 *
 * @example
 * ```typescript
 * import { Path } from '@baku89/pave'
 * import { vec2 } from 'linearly'
 * import { createP5Pave2Riso } from 'p5.pave2riso'
 *
 * const { p2r, PathIntersect } = createP5Pave2Riso({ Path, vec2 })
 *
 * // Now use the library without global variables
 * const render = p2r({ channels, canvasSize: [800, 600] })
 * render({ path: myPath, fill: { type: 'solid', channelVals: [100, 0, 0] } })
 * ```
 *
 * @example
 * ```typescript
 * // With Paper.js for PathOffset support
 * import paper from 'paper'
 * import PaperOffset from 'paperjs-offset'
 *
 * const lib = createP5Pave2Riso({ Path, vec2, paper, PaperOffset })
 * const offsetPath = lib.PathOffset(myPath, 10)
 * ```
 */
export declare function createP5Pave2Riso(deps: P5Pave2RisoDeps): P5Pave2RisoInstance;
//# sourceMappingURL=create.d.ts.map