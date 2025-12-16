/**
 * Graphics Processing Pipeline
 *
 * Class that manages main Graphics processing for pave2Riso
 */
import type { Pave2RisoOptions } from '../types/core.js';
import type { PavePath } from '../types/pave.js';
import type { Vec2 } from '../types/linearly.js';
/**
 * GraphicsPipeline class
 *
 * Manages Graphics creation, clipping, mode application, and cleanup
 *
 * Resource management:
 * - cleanup() method releases all Graphics resources
 * - Recommended to use with try-finally pattern
 * - cleanup() is idempotent (safe to call multiple times)
 * - Calling createGraphics() after cleanup() throws an error
 *
 * NOTE: ES2023+ Symbol.dispose support planned for future TypeScript upgrade
 */
export declare class GraphicsPipeline {
    private readonly options;
    private graphicsToCleanup;
    private readonly pathBounds;
    private readonly gPos;
    private readonly gSize;
    private baseG;
    private disposed;
    constructor(options: Pave2RisoOptions);
    /**
     * Creates a new Graphics object and adds it to the cleanup list
     *
     * @param width - Width
     * @param height - Height
     * @returns New Graphics object
     * @throws {Error} If called after cleanup()
     */
    createGraphics(width: number, height: number): p5.Graphics;
    /**
     * Sets up clipping path
     */
    setupClipping(): void;
    /**
     * Releases clipping path
     */
    releaseClipping(): void;
    /**
     * Cleans up all Graphics resources
     *
     * Safe to call multiple times (idempotent)
     * Calling createGraphics() after cleanup() throws an error
     */
    cleanup(): void;
    /**
     * Checks if the pipeline has been disposed
     */
    isDisposed(): boolean;
    /**
     * Getters
     */
    getOptions(): Pave2RisoOptions;
    getPathBounds(): [[number, number], [number, number]];
    getPosition(): Vec2;
    getSize(): Vec2;
    getBaseGraphics(): p5.Graphics;
    setBaseGraphics(g: p5.Graphics): void;
    /**
     * Draws path to Canvas (wrapper for Pave.js API)
     */
    drawPathToCanvas(path: PavePath, context: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=GraphicsPipeline.d.ts.map