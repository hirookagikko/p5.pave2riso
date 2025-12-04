/**
 * 対角線バッファ計算ユーティリティ
 *
 * halftone/dither適用時、角度付き回転でキャンバスがクリップされるのを防ぐため
 * 対角線サイズのバッファを使用する
 */
import type { HalftoneConfig, DitherConfig } from '../types/effects.js';
/**
 * 対角線バッファ計算結果
 */
export interface DiagonalBufferConfig {
    /** 対角線バッファを使用するか */
    usesDiagonalBuffer: boolean;
    /** 対角線サイズ（使用しない場合は0） */
    diagonal: number;
    /** 中央揃えのためのXオフセット */
    offsetX: number;
    /** 中央揃えのためのYオフセット */
    offsetY: number;
    /** バッファ幅（対角線またはcanvasSize[0]） */
    bufferWidth: number;
    /** バッファ高さ（対角線またはcanvasSize[1]） */
    bufferHeight: number;
    /** 描画X位置（負のオフセット） */
    drawX: number;
    /** 描画Y位置（負のオフセット） */
    drawY: number;
}
/**
 * 対角線バッファ設定を計算
 *
 * halftone/dither使用時は対角線サイズのバッファを使用し、
 * そうでない場合はキャンバスサイズをそのまま使用
 *
 * @param canvasSize - キャンバスサイズ [width, height]
 * @param halftone - ハーフトーン設定（null/undefinedで無効）
 * @param dither - ディザー設定（null/undefinedで無効）
 * @returns 対角線バッファ設定
 *
 * @example
 * const config = calculateDiagonalBuffer(canvasSize, halftone, dither)
 * const buffer = pipeline.createGraphics(config.bufferWidth, config.bufferHeight)
 * // ... 描画処理 ...
 * channel.image(buffer, config.drawX, config.drawY)
 */
export declare const calculateDiagonalBuffer: (canvasSize: [number, number], halftone: HalftoneConfig | null | undefined, dither: DitherConfig | null | undefined) => DiagonalBufferConfig;
//# sourceMappingURL=diagonal-buffer.d.ts.map