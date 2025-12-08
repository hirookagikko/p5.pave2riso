/**
 * Graphics処理パイプライン
 *
 * pave2Risoの主要なGraphics処理を管理するクラス
 */

import type { Pave2RisoOptions } from '../types/core.js'
import type { PavePath } from '../types/pave.js'
import type { Vec2 } from '../types/linearly.js'
import { getPathBounds, drawPathToCanvas } from '../utils/pave-wrapper.js'
import { createVec2 } from '../utils/vec2-wrapper.js'

/**
 * GraphicsPipelineクラス
 *
 * Graphics生成、クリッピング、モード適用、クリーンアップを管理
 *
 * リソース管理:
 * - cleanup()メソッドで全てのGraphicsリソースを解放
 * - try-finallyパターンで使用することを推奨
 * - cleanup()は冪等（複数回呼び出しても安全）
 * - cleanup()後のcreateGraphics()呼び出しはエラー
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
   * 新しいGraphicsオブジェクトを作成し、クリーンアップリストに追加
   *
   * @param width - 幅
   * @param height - 高さ
   * @returns 新しいGraphicsオブジェクト
   * @throws {Error} cleanup()後に呼び出された場合
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
   * クリッピングパスを設定
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
   * クリッピングパスを解除
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
   * 全てのGraphicsリソースをクリーンアップ
   *
   * 複数回呼び出しても安全（冪等）
   * cleanup()後のcreateGraphics()呼び出しはエラーになる
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
   * パイプラインが破棄済みかどうかを確認
   */
  isDisposed(): boolean {
    return this.disposed
  }

  /**
   * ゲッター
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
   * パスをCanvasに描画（Pave.js APIのラッパー）
   */
  drawPathToCanvas(path: PavePath, context: CanvasRenderingContext2D): void {
    drawPathToCanvas(path, context)
  }
}
