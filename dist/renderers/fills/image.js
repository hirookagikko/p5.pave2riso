/**
 * 画像Fillレンダラー
 */
import { createInkDepth } from '../../utils/inkDepth.js';
import { normalizeAlignX, normalizeAlignY } from '../../utils/alignment.js';
import { mergeEffects } from '../../utils/effect-merge.js';
import { applyEffectPipeline } from '../shared/effect-pipeline.js';
import { extractSize, extractPosition } from '../../utils/vec2-access.js';
/**
 * 画像フィット計算
 *
 * @param imageWidth - 画像の幅
 * @param imageHeight - 画像の高さ
 * @param targetWidth - ターゲットの幅
 * @param targetHeight - ターゲットの高さ
 * @param fit - フィット方式
 * @param scaleMul - スケール倍率
 * @returns [描画幅, 描画高さ]
 */
const calculateImageDimensions = (imageWidth, imageHeight, targetWidth, targetHeight, fit, scaleMul) => {
    let dw;
    let dh;
    switch (fit) {
        case 'contain': {
            const s = Math.min(targetWidth / imageWidth, targetHeight / imageHeight) * scaleMul;
            dw = imageWidth * s;
            dh = imageHeight * s;
            break;
        }
        case 'cover': {
            const s = Math.max(targetWidth / imageWidth, targetHeight / imageHeight) * scaleMul;
            dw = imageWidth * s;
            dh = imageHeight * s;
            break;
        }
        case 'fill':
            dw = targetWidth * scaleMul;
            dh = targetHeight * scaleMul;
            break;
        case 'none':
        default: {
            const s = scaleMul;
            dw = imageWidth * s;
            dh = imageHeight * s;
            break;
        }
    }
    return [dw, dh];
};
/**
 * 画像Fillをレンダリング
 *
 * @param fill - 画像Fill設定
 * @param pipeline - GraphicsPipeline
 */
export const renderImageFill = (fill, pipeline) => {
    const img = fill.image;
    if (!img)
        return;
    const options = pipeline.getOptions();
    const { channels, mode } = options;
    const path = options.path;
    // トップレベルとfill内のエフェクトをマージ（fill内が優先）
    const { filter, halftone, dither } = mergeEffects({ filter: options.filter, halftone: options.halftone, dither: options.dither }, { filter: fill.filter, halftone: fill.halftone, dither: fill.dither });
    // Vec2ヘルパーで座標を抽出
    const { width: tw, height: th } = extractSize(pipeline);
    const { x: gPosX, y: gPosY } = extractPosition(pipeline);
    const iw = img.width;
    const ih = img.height;
    // パラメータのデフォルト値
    const fit = fill.fit ?? 'cover';
    const alignX = fill.alignX ?? 'center';
    const alignY = fill.alignY ?? 'middle';
    const scaleMul = fill.scale ?? 1;
    const offset = fill.offset ?? [0, 0];
    const rotateDeg = fill.rotate ?? 0;
    // 画像サイズの計算
    const [dw, dh] = calculateImageDimensions(iw, ih, tw, th, fit, scaleMul);
    // アライメントの計算
    const ax = normalizeAlignX(alignX);
    const ay = normalizeAlignY(alignY);
    const dx = gPosX + (tw - dw) * ax + (offset[0] || 0);
    const dy = gPosY + (th - dh) * ay + (offset[1] || 0);
    // 画像グラフィックスの作成
    const imgBaseG = pipeline.createGraphics(options.canvasSize[0], options.canvasSize[1]);
    imgBaseG.background(255);
    imgBaseG.drawingContext.save();
    pipeline.drawPathToCanvas(path, imgBaseG.drawingContext);
    imgBaseG.drawingContext.clip();
    // 画像の描画（回転あり/なし）
    imgBaseG.push();
    if (rotateDeg) {
        const cx = dx + dw / 2;
        const cy = dy + dh / 2;
        imgBaseG.translate(cx, cy);
        imgBaseG.rotate(radians(rotateDeg));
        imgBaseG.image(img, -dw / 2, -dh / 2, dw, dh);
    }
    else {
        imgBaseG.image(img, dx, dy, dw, dh);
    }
    imgBaseG.pop();
    imgBaseG.drawingContext.restore();
    // 自動グレースケール変換（Risograph印刷用）
    imgBaseG.filter(GRAY);
    // エフェクトパイプライン適用（フィルター → 対角線バッファ → halftone/dither）
    const { canvasSize } = options;
    const { graphics: processedG, drawX, drawY } = applyEffectPipeline(imgBaseG, filter, halftone, dither, canvasSize, pipeline);
    // joinモードの場合は全チャンネルから削除
    if (mode === 'join') {
        channels.forEach((channel) => {
            channel.push();
            channel.blendMode(REMOVE);
            channel.image(processedG, drawX, drawY);
            channel.pop();
        });
    }
    // 各チャンネルに適用
    channels.forEach((channel, i) => {
        const channelVal = fill.channelVals?.[i];
        if (channelVal !== undefined && channelVal > 0) {
            channel.push();
            channel.fill(createInkDepth(channelVal));
            channel.image(processedG, drawX, drawY);
            channel.pop();
        }
    });
};
//# sourceMappingURL=image.js.map