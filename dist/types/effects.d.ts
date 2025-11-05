/**
 * フィルター、ハーフトーン、ディザーのエフェクト設定型定義
 */
/**
 * フィルタータイプ
 */
export type FilterType = 'posterize' | 'blur' | 'threshold' | 'gray' | 'opaque' | 'invert' | 'dilate' | 'erode';
/**
 * フィルター設定
 */
export interface FilterConfig {
    /**
     * フィルタータイプ
     */
    filterType: FilterType;
    /**
     * フィルター引数（posterize、blurなど一部のフィルターで必要）
     */
    filterArgs?: number[];
}
/**
 * ハーフトーン設定
 */
export interface HalftoneConfig {
    /**
     * ハーフトーン関数への引数
     * 通常は [dotSize, angle, density] など
     */
    halftoneArgs: number[];
}
/**
 * ディザー設定
 */
export interface DitherConfig {
    /**
     * ディザー関数への引数
     * 通常は [threshold, pattern] など
     */
    ditherArgs: number[];
}
//# sourceMappingURL=effects.d.ts.map