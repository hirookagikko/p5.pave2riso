/**
 * コア型定義
 */

import type { FillConfig } from './fill.js'
import type { StrokeConfig } from './stroke.js'
import type { FilterConfig, HalftoneConfig, DitherConfig } from './effects.js'

/**
 * レンダリングモード
 */
export type RenderMode = 'overprint' | 'cutout' | 'join'

/**
 * Pave Pathオブジェクト（@baku89/pave）
 * 実際の型定義はpaveライブラリから提供されるが、
 * ここでは簡易的な型として定義
 */
export interface PavePath {
  [key: string]: unknown
}

/**
 * pave2Riso関数のオプション
 */
export interface Pave2RisoOptions {
  /**
   * Pave pathオブジェクト
   */
  path: PavePath

  /**
   * Stroke設定（nullの場合はストロークなし）
   */
  stroke: StrokeConfig | null

  /**
   * Fill設定（nullの場合は塗りつぶしなし）
   */
  fill: FillConfig | null

  /**
   * レンダリングモード
   */
  mode: RenderMode

  /**
   * キャンバスサイズ [width, height]
   */
  canvasSize: [number, number]

  /**
   * Risographチャンネル（p5.Graphicsオブジェクトの配列）
   */
  channels: p5.Graphics[]

  /**
   * フィルター設定（配列または単一のフィルター）
   */
  filter?: FilterConfig | FilterConfig[] | null

  /**
   * ハーフトーン設定
   */
  halftone?: HalftoneConfig | null

  /**
   * ディザー設定
   */
  dither?: DitherConfig | null

  /**
   * クリッピングパス（オプション）
   */
  clippingPath?: PavePath | null
}
