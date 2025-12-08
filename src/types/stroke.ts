/**
 * Stroke設定のDiscriminated Union型定義
 */

import type { ColorStop, GradientType, GradientDirection } from './fill.js'
import type { FilterConfig, HalftoneConfig, DitherConfig } from './effects.js'
import type { DashPattern } from './branded.js'

/**
 * ストロークキャップスタイル（線の端の形状）
 */
export type StrokeCap = 'round' | 'square' | 'butt'

/**
 * ストロークジョインスタイル（線の角の形状）
 */
export type StrokeJoin = 'miter' | 'bevel' | 'round'

/**
 * ベタ塗りStroke設定
 */
export interface SolidStrokeConfig {
  type: 'solid'

  /**
   * ストロークの太さ（ピクセル）
   */
  strokeWeight: number

  /**
   * 各チャンネルのインク濃度（0-100）
   */
  channelVals: number[]

  /**
   * ストロークキャップスタイル（線の端の形状）
   */
  strokeCap?: StrokeCap

  /**
   * ストロークジョインスタイル（線の角の形状）
   */
  strokeJoin?: StrokeJoin

  /**
   * フィルター設定
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
}

/**
 * 破線Stroke設定
 */
export interface DashedStrokeConfig {
  type: 'dashed'

  /**
   * ストロークの太さ（ピクセル）
   */
  strokeWeight: number

  /**
   * 各チャンネルのインク濃度（0-100）
   */
  channelVals: number[]

  /**
   * 破線パターン [lineLength, gapLength]
   * @example dashArgs: [10, 5] // 10px line, 5px gap
   */
  dashArgs: DashPattern

  /**
   * ストロークキャップスタイル（線の端の形状）
   */
  strokeCap: StrokeCap

  /**
   * ストロークジョインスタイル（線の角の形状）
   */
  strokeJoin?: StrokeJoin

  /**
   * フィルター設定
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
}

/**
 * パターンStroke設定
 */
export interface PatternStrokeConfig {
  type: 'pattern'

  /**
   * ストロークの太さ（ピクセル）
   */
  strokeWeight: number

  /**
   * 各チャンネルのインク濃度（0-100）
   */
  channelVals: number[]

  /**
   * パターン名（PTNオブジェクトのキー）
   */
  PTN: string

  /**
   * パターン関数への引数
   */
  patternArgs: unknown[]

  /**
   * パターンの回転角度（度数法）
   * @example
   * patternAngle: 45  // 45度回転
   * patternAngle: 90  // 90度回転
   */
  patternAngle?: number

  /**
   * 破線パターン [lineLength, gapLength]
   * 指定すると破線パターンストロークになる
   * @example dashArgs: [10, 5] // 10px line, 5px gap
   */
  dashArgs?: DashPattern

  /**
   * ストロークキャップスタイル（線の端の形状）
   */
  strokeCap?: StrokeCap

  /**
   * ストロークジョインスタイル（線の角の形状）
   */
  strokeJoin?: StrokeJoin

  /**
   * フィルター設定
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
}

/**
 * グラデーションStroke設定
 */
export interface GradientStrokeConfig {
  type: 'gradient'

  /**
   * ストロークの太さ（ピクセル）
   */
  strokeWeight: number

  /**
   * グラデーションタイプ
   */
  gradientType: GradientType

  /**
   * グラデーション方向（線形グラデーションのみ）
   */
  gradientDirection?: GradientDirection

  /**
   * カラーストップ
   */
  colorStops: ColorStop[]

  /**
   * 破線パターン [lineLength, gapLength]
   * 指定すると破線グラデーションストロークになる
   * @example dashArgs: [10, 5] // 10px line, 5px gap
   */
  dashArgs?: DashPattern

  /**
   * ストロークキャップスタイル（線の端の形状）
   */
  strokeCap?: StrokeCap

  /**
   * ストロークジョインスタイル（線の角の形状）
   */
  strokeJoin?: StrokeJoin

  /**
   * フィルター設定
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
}

/**
 * Stroke設定のDiscriminated Union
 *
 * typeフィールドでどのStroke方式かを判別し、
 * TypeScriptが適切にnarrowingを行える
 */
export type StrokeConfig =
  | SolidStrokeConfig
  | DashedStrokeConfig
  | PatternStrokeConfig
  | GradientStrokeConfig
