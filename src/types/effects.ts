/**
 * フィルター、ハーフトーン、ディザーのエフェクト設定型定義
 */

/**
 * フィルタータイプ
 */
export type FilterType =
  | 'posterize'
  | 'blur'
  | 'threshold'
  | 'gray'
  | 'opaque'
  | 'invert'
  | 'dilate'
  | 'erode'

/**
 * Posterizeフィルター設定
 * 画像の色数を削減する
 */
export interface PosterizeFilter {
  filterType: 'posterize'
  /** 色のレベル数（2-255） */
  levels: number
}

/**
 * Blurフィルター設定
 * ガウシアンブラーを適用する
 */
export interface BlurFilter {
  filterType: 'blur'
  /** ブラー半径（ピクセル、デフォルト: 4） */
  radius?: number
}

/**
 * Thresholdフィルター設定
 * 指定したしきい値で二値化する
 */
export interface ThresholdFilter {
  filterType: 'threshold'
  /** しきい値（0.0-1.0、デフォルト: 0.5） */
  threshold?: number
}

/**
 * 引数なしフィルター設定
 * gray, opaque, invert, dilate, erode
 */
export interface NoArgFilter {
  filterType: 'gray' | 'opaque' | 'invert' | 'dilate' | 'erode'
}

/**
 * フィルター設定（Discriminated Union）
 *
 * 各フィルタータイプに応じた引数を型安全に指定できる
 *
 * @example
 * // Posterize: 色数を削減
 * { filterType: 'posterize', levels: 4 }
 *
 * // Blur: ぼかし
 * { filterType: 'blur', radius: 3 }
 *
 * // Threshold: 二値化
 * { filterType: 'threshold', threshold: 0.5 }
 *
 * // 引数なしフィルター
 * { filterType: 'gray' }
 * { filterType: 'invert' }
 */
export type FilterConfig =
  | PosterizeFilter
  | BlurFilter
  | ThresholdFilter
  | NoArgFilter

/**
 * Legacy互換: 旧形式のフィルター設定
 * @deprecated FilterConfig Discriminated Unionを使用してください
 */
export interface LegacyFilterConfig {
  filterType: FilterType
  filterArgs?: number[]
}

/**
 * Legacy形式からDiscriminated Union形式への変換
 * 後方互換性のために使用
 */
export const normalizeFilterConfig = (config: FilterConfig | LegacyFilterConfig): FilterConfig => {
  // すでに新形式の場合はそのまま返す
  if ('levels' in config || 'radius' in config || 'threshold' in config) {
    return config as FilterConfig
  }

  // Legacy形式から新形式への変換
  const legacy = config as LegacyFilterConfig
  switch (legacy.filterType) {
    case 'posterize':
      return { filterType: 'posterize', levels: legacy.filterArgs?.[0] ?? 4 }
    case 'blur':
      return { filterType: 'blur', radius: legacy.filterArgs?.[0] ?? 4 }
    case 'threshold':
      return { filterType: 'threshold', threshold: legacy.filterArgs?.[0] ?? 0.5 }
    default:
      return { filterType: legacy.filterType } as NoArgFilter
  }
}

/**
 * ハーフトーン設定
 */
export interface HalftoneConfig {
  /**
   * ハーフトーン関数への引数
   * 通常は [dotSize, angle, density] など
   * p5.riso.jsのhalftoneImage()に渡される引数
   */
  halftoneArgs: (string | number)[]
}

/**
 * ディザー設定
 */
export interface DitherConfig {
  /**
   * ディザー関数への引数
   * p5.riso.jsのditherImage()に渡される引数
   * 例: ['floydSteinberg', 128] など文字列を含む場合がある
   */
  ditherArgs: (string | number)[]
}
