/**
 * Graphics Processing Pipeline
 *
 * Class that manages main Graphics processing for pave2Riso
 */

import type { Pave2RisoOptions } from '../types/core.js'
import type { PavePath } from '../types/pave.js'
import type { Vec2 } from '../types/linearly.js'
import { getPathBounds, drawPathToCanvas } from '../utils/pave-wrapper.js'
import { createVec2 } from '../utils/vec2-wrapper.js'

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
export class GraphicsPipeline {
  private readonly options: Pave2RisoOptions
  private graphicsToCleanup: p5.Graphics[] = []
  private readonly pathBounds: [[number, number], [number, number]]
  private readonly gPos: Vec2
  private readonly gSize: Vec2
  private baseG: p5.Graphics
  private disposed = false

  constructor(options: Pave2RisoOptions) {
    this.options = options

    // Pave.jsのPath.bounds()を使用してパスの境界を取得
    this.pathBounds = getPathBounds(options.path)

    // vec2を使用して位置とサイズを計算（整数化してp5.jsのcopy()エラーを防止）
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
    this.gPos = createVec2(
      Math.floor(this.pathBounds[0][0]),
      Math.floor(this.pathBounds[0][1])
    )
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
    this.gSize = createVec2(
      Math.ceil(this.pathBounds[1][0] - this.pathBounds[0][0]),
      Math.ceil(this.pathBounds[1][1] - this.pathBounds[0][1])
    )

    // ベースGraphicsの作成
    this.baseG = createGraphics(options.canvasSize[0], options.canvasSize[1])
    this.baseG.pixelDensity(1)
    this.graphicsToCleanup.push(this.baseG)
    this.baseG.background(255)
  }

  /**
   * Creates a new Graphics object and adds it to the cleanup list
   *
   * @param width - Width
   * @param height - Height
   * @returns New Graphics object
   * @throws {Error} If called after cleanup()
   */
  createGraphics(width: number, height: number): p5.Graphics {
    if (this.disposed) {
      throw new Error('GraphicsPipeline has been disposed. Cannot create new graphics.')
    }
    const g = createGraphics(width, height)
    g.pixelDensity(1)
    this.graphicsToCleanup.push(g)
    return g
  }

  /**
   * Sets up clipping path
   */
  setupClipping(): void {
    const { clippingPath, channels } = this.options

    if (clippingPath) {
      channels.forEach((channel) => {
        channel.push()
        drawPathToCanvas(clippingPath, channel.drawingContext)
        channel.drawingContext.clip()
      })
    }
  }

  /**
   * Releases clipping path
   */
  releaseClipping(): void {
    const { clippingPath, channels } = this.options

    if (clippingPath) {
      channels.forEach((channel) => {
        channel.pop()
      })
    }
  }

  /**
   * Cleans up all Graphics resources
   *
   * Safe to call multiple times (idempotent)
   * Calling createGraphics() after cleanup() throws an error
   */
  cleanup(): void {
    if (this.disposed) {
      return // Already disposed, no-op
    }

    this.graphicsToCleanup.forEach((g) => {
      if (g && typeof g.remove === 'function') {
        g.remove()
      }
    })

    // Clear array to prevent double-remove and allow GC
    this.graphicsToCleanup = []
    this.disposed = true
  }

  /**
   * Checks if the pipeline has been disposed
   */
  isDisposed(): boolean {
    return this.disposed
  }

  /**
   * Getters
   */
  getOptions(): Pave2RisoOptions {
    return this.options
  }

  getPathBounds(): [[number, number], [number, number]] {
    return this.pathBounds
  }

  getPosition(): Vec2 {
    return this.gPos
  }

  getSize(): Vec2 {
    return this.gSize
  }

  getBaseGraphics(): p5.Graphics {
    return this.baseG
  }

  setBaseGraphics(g: p5.Graphics): void {
    // 新しいgraphicsがまだ追跡されていない場合、追跡リストに追加
    // (applyEffectsなど外部で生成されたGraphicsのメモリリーク防止)
    if (!this.graphicsToCleanup.includes(g)) {
      this.graphicsToCleanup.push(g)
    }
    this.baseG = g
  }

  /**
   * Draws path to Canvas (wrapper for Pave.js API)
   */
  drawPathToCanvas(path: PavePath, context: CanvasRenderingContext2D): void {
    drawPathToCanvas(path, context)
  }
}
