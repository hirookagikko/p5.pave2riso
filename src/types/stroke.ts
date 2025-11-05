/**
 * Stroke設定のDiscriminated Union型定義
 */

import type { ColorStop, GradientType } from './fill.js'

/**
 * ストロークキャップスタイル
 */
export type StrokeCap = 'round' | 'square' | 'butt'

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
   * ストロークキャップスタイル
   */
  strokeCap?: StrokeCap
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
   */
  dashArgs: number[]

  /**
   * ストロークキャップスタイル
   */
  strokeCap: StrokeCap
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
   * パターン名（PTNオブジェクトのキー）
   */
  PTN: string

  /**
   * パターン関数への引数
   */
  patternArgs: unknown[]

  /**
   * パターンの回転角度（度数法）
   */
  patternAngle?: number
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
   * カラーストップ
   */
  colorStops: ColorStop[]
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
