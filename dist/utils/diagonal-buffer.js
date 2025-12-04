/**
 * 対角線バッファ計算ユーティリティ
 *
 * halftone/dither適用時、角度付き回転でキャンバスがクリップされるのを防ぐため
 * 対角線サイズのバッファを使用する
 */
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
export const calculateDiagonalBuffer = (canvasSize, halftone, dither) => {
    const usesDiagonalBuffer = !!(halftone ?? dither);
    if (!usesDiagonalBuffer) {
        return {
            usesDiagonalBuffer: false,
            diagonal: 0,
            offsetX: 0,
            offsetY: 0,
            bufferWidth: canvasSize[0],
            bufferHeight: canvasSize[1],
            drawX: 0,
            drawY: 0
        };
    }
    const diagonal = Math.ceil(Math.sqrt(canvasSize[0] ** 2 + canvasSize[1] ** 2));
    const offsetX = Math.floor((diagonal - canvasSize[0]) / 2);
    const offsetY = Math.floor((diagonal - canvasSize[1]) / 2);
    return {
        usesDiagonalBuffer: true,
        diagonal,
        offsetX,
        offsetY,
        bufferWidth: diagonal,
        bufferHeight: diagonal,
        drawX: -offsetX,
        drawY: -offsetY
    };
};
//# sourceMappingURL=diagonal-buffer.js.map