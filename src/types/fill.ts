/**
 * Fill設定のDiscriminated Union型定義
 */

/**
 * グラデーションタイプ
 */
export type GradientType = 'linear' | 'radial' | 'conic'

/**
 * グラデーション方向（線形グラデーション用）
 */
export type GradientDirection =
  | 'TD'    // Top to Down
  | 'DT'    // Down to Top
  | 'LR'    // Left to Right
  | 'RL'    // Right to Left
  | 'LTRB'  // Left-Top to Right-Bottom
  | 'RTLB'  // Right-Top to Left-Bottom
  | 'LBRT'  // Left-Bottom to Right-Top
  | 'RBLT'  // Right-Bottom to Left-Top

/**
 * グラデーションカラーストップ
 */
export interface ColorStop {
  /**
   * チャンネルインデックス
   */
  channel: number

  /**
   * カラーストップの配列
   */
  stops: Array<{
    /**
     * 位置（0-100）
     */
    position: number

    /**
     * インク濃度（0-100）
     */
    depth: number
  }>
}

/**
 * 画像フィット方式
 */
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none'

/**
 * 水平方向のアライメント
 */
export type AlignX = 'left' | 'center' | 'right' | number

/**
 * 垂直方向のアライメント
 */
export type AlignY = 'top' | 'middle' | 'bottom' | number

/**
 * ベタ塗りFill設定
 */
export interface SolidFillConfig {
  type: 'solid'

  /**
   * 各チャンネルのインク濃度（0-100）
   */
  channelVals: number[]
}

/**
 * パターンFill設定
 */
export interface PatternFillConfig {
  type: 'pattern'

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
   * 各チャンネルのインク濃度（0-100）
   */
  channelVals: number[]
}

/**
 * グラデーションFill設定
 */
export interface GradientFillConfig {
  type: 'gradient'

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
}

/**
 * 画像Fill設定
 */
export interface ImageFillConfig {
  type: 'image'

  /**
   * 画像オブジェクト
   */
  image: p5.Image

  /**
   * フィット方式
   */
  fit?: ImageFit

  /**
   * 水平方向のアライメント
   */
  alignX?: AlignX

  /**
   * 垂直方向のアライメント
   */
  alignY?: AlignY

  /**
   * スケール倍率
   */
  scale?: number

  /**
   * オフセット [x, y]
   */
  offset?: [number, number]

  /**
   * 回転角度（度数法）
   */
  rotate?: number

  /**
   * 各チャンネルのインク濃度（0-100）
   */
  channelVals?: number[]
}

/**
 * Fill設定のDiscriminated Union
 *
 * typeフィールドでどのFill方式かを判別し、
 * TypeScriptが適切にnarrowingを行える
 */
export type FillConfig =
  | SolidFillConfig
  | PatternFillConfig
  | GradientFillConfig
  | ImageFillConfig
