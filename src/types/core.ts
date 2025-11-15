/**
 * コア型定義
 */

import type { FillConfig } from './fill.js'
import type { StrokeConfig } from './stroke.js'
import type { FilterConfig, HalftoneConfig, DitherConfig } from './effects.js'
import type { PavePath } from './pave.js'

export type { PavePath }

/**
 * レンダリングモード
 */
export type RenderMode = 'overprint' | 'cutout' | 'join'

/**
 * Pave.js curve segment type
 * Curves can be arrays or objects with vertices
 */
export type PaveCurve = unknown[]

/**
 * Type guard to check if a value has curves property
 */
export function hasCurves(path: unknown): path is { curves: PaveCurve[] } {
  return (
    typeof path === 'object' &&
    path !== null &&
    'curves' in path &&
    Array.isArray((path as { curves: unknown }).curves)
  )
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
