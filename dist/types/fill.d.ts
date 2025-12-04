/**
 * Fill設定のDiscriminated Union型定義
 */
import type { FilterConfig, HalftoneConfig, DitherConfig } from './effects.js';
import type { Percentage } from './branded.js';
/**
 * グラデーションタイプ
 */
export type GradientType = 'linear' | 'radial' | 'conic';
/**
 * グラデーション方向（線形グラデーション用）
 */
export type GradientDirection = 'TD' | 'DT' | 'LR' | 'RL' | 'LTRB' | 'RTLB' | 'LBRT' | 'RBLT';
/**
 * グラデーションカラーストップの個別エントリ
 */
export interface ColorStopEntry {
    /**
     * 位置（0-100%）
     * グラデーション内での位置を表す
     */
    position: Percentage | number;
    /**
     * インク濃度（0-100%）
     * この位置でのインクの濃さ
     */
    depth: Percentage | number;
}
/**
 * グラデーションカラーストップ
 */
export interface ColorStop {
    /**
     * チャンネルインデックス
     */
    channel: number;
    /**
     * カラーストップの配列
     */
    stops: ColorStopEntry[];
}
/**
 * 画像フィット方式
 */
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none';
/**
 * 水平方向のアライメント
 */
export type AlignX = 'left' | 'center' | 'right' | number;
/**
 * 垂直方向のアライメント
 */
export type AlignY = 'top' | 'middle' | 'bottom' | number;
/**
 * ベタ塗りFill設定
 */
export interface SolidFillConfig {
    type: 'solid';
    /**
     * 各チャンネルのインク濃度（0-100）
     */
    channelVals: number[];
    /**
     * フィルター設定
     */
    filter?: FilterConfig | FilterConfig[] | null;
    /**
     * ハーフトーン設定
     */
    halftone?: HalftoneConfig | null;
    /**
     * ディザー設定
     */
    dither?: DitherConfig | null;
}
/**
 * パターンFill設定
 */
export interface PatternFillConfig {
    type: 'pattern';
    /**
     * パターン名（PTNオブジェクトのキー）
     */
    PTN: string;
    /**
     * パターン関数への引数
     */
    patternArgs: unknown[];
    /**
     * パターンの回転角度（度数法）
     * @example
     * patternAngle: 45  // 45度回転
     * patternAngle: 90  // 90度回転
     */
    patternAngle?: number;
    /**
     * 各チャンネルのインク濃度（0-100）
     */
    channelVals: number[];
    /**
     * フィルター設定
     */
    filter?: FilterConfig | FilterConfig[] | null;
    /**
     * ハーフトーン設定
     */
    halftone?: HalftoneConfig | null;
    /**
     * ディザー設定
     */
    dither?: DitherConfig | null;
}
/**
 * グラデーションFill設定
 */
export interface GradientFillConfig {
    type: 'gradient';
    /**
     * グラデーションタイプ
     */
    gradientType: GradientType;
    /**
     * グラデーション方向（線形グラデーションのみ）
     */
    gradientDirection?: GradientDirection;
    /**
     * カラーストップ
     */
    colorStops: ColorStop[];
    /**
     * フィルター設定
     */
    filter?: FilterConfig | FilterConfig[] | null;
    /**
     * ハーフトーン設定
     */
    halftone?: HalftoneConfig | null;
    /**
     * ディザー設定
     */
    dither?: DitherConfig | null;
}
/**
 * 画像Fill設定
 */
export interface ImageFillConfig {
    type: 'image';
    /**
     * 画像オブジェクト
     */
    image: p5.Image;
    /**
     * フィット方式
     */
    fit?: ImageFit;
    /**
     * 水平方向のアライメント
     */
    alignX?: AlignX;
    /**
     * 垂直方向のアライメント
     */
    alignY?: AlignY;
    /**
     * スケール倍率
     */
    scale?: number;
    /**
     * オフセット [x, y]
     */
    offset?: [number, number];
    /**
     * 回転角度（度数法）
     */
    rotate?: number;
    /**
     * 各チャンネルのインク濃度（0-100）
     */
    channelVals?: number[];
    /**
     * フィルター設定
     */
    filter?: FilterConfig | FilterConfig[] | null;
    /**
     * ハーフトーン設定
     */
    halftone?: HalftoneConfig | null;
    /**
     * ディザー設定
     */
    dither?: DitherConfig | null;
}
/**
 * Fill設定のDiscriminated Union
 *
 * typeフィールドでどのFill方式かを判別し、
 * TypeScriptが適切にnarrowingを行える
 */
export type FillConfig = SolidFillConfig | PatternFillConfig | GradientFillConfig | ImageFillConfig;
//# sourceMappingURL=fill.d.ts.map