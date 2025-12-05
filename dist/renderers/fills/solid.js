/**
 * ベタ塗りFillレンダラー
 */
import { createInkDepth } from '../../utils/inkDepth.js';
import { mergeEffects } from '../../utils/effect-merge.js';
import { calculateDiagonalBuffer } from '../../utils/diagonal-buffer.js';
import { applyEffectPipeline } from '../shared/effect-pipeline.js';
/**
 * ベタ塗りFillをレンダリング
 *
 * @param fill - ベタ塗りFill設定
 * @param pipeline - GraphicsPipeline
 */
export const renderSolidFill = (fill, pipeline) => {
    const options = pipeline.getOptions();
    const { channels, mode } = options;
    const path = options.path;
    // トップレベルとfill内のエフェクトをマージ（fill内が優先）
    const { filter, halftone, dither } = mergeEffects({ filter: options.filter, halftone: options.halftone, dither: options.dither }, { filter: fill.filter, halftone: fill.halftone, dither: fill.dither });
    // halftone/dither使用時の対角線バッファ計算（角度付き回転でのクリップ防止）
    const { canvasSize } = options;
    const diag = calculateDiagonalBuffer(canvasSize, halftone, dither);
    // JOINモードの場合は全チャンネルから削除
    if (mode === 'join') {
        if (filter) {
            // フィルター適用パス
            const eraseG = pipeline.createGraphics(canvasSize[0], canvasSize[1]);
            eraseG.background(255);
            eraseG.fill(0);
            eraseG.noStroke();
            pipeline.drawPathToCanvas(path, eraseG.drawingContext);
            eraseG.drawingContext.fill();
            // エフェクトパイプライン適用
            const { graphics: processedG, drawX, drawY } = applyEffectPipeline(eraseG, filter, halftone, dither, canvasSize, pipeline);
            channels.forEach((channel) => {
                channel.push();
                channel.fill(255);
                channel.noStroke();
                channel.blendMode(REMOVE);
                channel.image(processedG, drawX, drawY);
                channel.blendMode(BLEND);
                channel.pop();
            });
        }
        else if (halftone && typeof window.halftoneImage === 'function') {
            // ハーフトーン適用パス - 対角線バッファを使用
            const eraseG = pipeline.createGraphics(diag.diagonal, diag.diagonal);
            eraseG.push();
            eraseG.background(255);
            eraseG.noStroke();
            eraseG.fill(0);
            eraseG.drawingContext.save();
            eraseG.drawingContext.translate(diag.offsetX, diag.offsetY);
            pipeline.drawPathToCanvas(path, eraseG.drawingContext);
            eraseG.drawingContext.fill();
            eraseG.drawingContext.restore();
            eraseG.pop();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const halftoned = window.halftoneImage(eraseG, ...halftone.halftoneArgs);
            channels.forEach((channel) => {
                channel.push();
                channel.blendMode(REMOVE);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                channel.image(halftoned, diag.drawX, diag.drawY);
                channel.blendMode(BLEND);
                channel.pop();
            });
        }
        else if (dither && typeof window.ditherImage === 'function') {
            // ディザー適用パス - 対角線バッファを使用
            const eraseG = pipeline.createGraphics(diag.diagonal, diag.diagonal);
            eraseG.push();
            eraseG.background(255);
            eraseG.noStroke();
            eraseG.fill(0);
            eraseG.drawingContext.save();
            eraseG.drawingContext.translate(diag.offsetX, diag.offsetY);
            pipeline.drawPathToCanvas(path, eraseG.drawingContext);
            eraseG.drawingContext.fill();
            eraseG.drawingContext.restore();
            eraseG.pop();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const dithered = window.ditherImage(eraseG, ...dither.ditherArgs);
            channels.forEach((channel) => {
                channel.push();
                channel.blendMode(REMOVE);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                channel.image(dithered, diag.drawX, diag.drawY);
                channel.blendMode(BLEND);
                channel.pop();
            });
        }
        else {
            // 通常のカットアウト
            channels.forEach((channel) => {
                channel.push();
                channel.fill(255);
                channel.erase();
                channel.noStroke();
                pipeline.drawPathToCanvas(path, channel.drawingContext);
                channel.drawingContext.fill();
                channel.noErase();
                channel.pop();
            });
        }
    }
    if (filter) {
        // フィルター適用パス
        const baseG = pipeline.getBaseGraphics();
        baseG.push();
        baseG.noStroke();
        baseG.fill(0);
        pipeline.drawPathToCanvas(path, baseG.drawingContext);
        baseG.drawingContext.fill();
        baseG.pop();
        // エフェクトパイプライン適用
        const { graphics: processedG, drawX, drawY } = applyEffectPipeline(baseG, filter, halftone, dither, canvasSize, pipeline);
        pipeline.setBaseGraphics(processedG);
        channels.forEach((channel, i) => {
            const channelVal = fill.channelVals[i];
            if (channelVal !== undefined && channelVal > 0) {
                channel.push();
                channel.fill(createInkDepth(channelVal));
                channel.image(processedG, drawX, drawY);
                channel.pop();
            }
        });
    }
    else if (halftone && typeof window.halftoneImage === 'function') {
        // ハーフトーン専用パス - 対角線バッファを使用
        const solidG = pipeline.createGraphics(diag.diagonal, diag.diagonal);
        solidG.push();
        solidG.background(255);
        solidG.noStroke();
        solidG.fill(0);
        solidG.drawingContext.save();
        solidG.drawingContext.translate(diag.offsetX, diag.offsetY);
        pipeline.drawPathToCanvas(path, solidG.drawingContext);
        solidG.drawingContext.fill();
        solidG.drawingContext.restore();
        solidG.pop();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const halftoned = window.halftoneImage(solidG, ...halftone.halftoneArgs);
        channels.forEach((channel, i) => {
            const channelVal = fill.channelVals[i];
            if (channelVal !== undefined && channelVal > 0) {
                channel.push();
                channel.fill(createInkDepth(channelVal));
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                channel.image(halftoned, diag.drawX, diag.drawY);
                channel.pop();
            }
        });
    }
    else if (dither && typeof window.ditherImage === 'function') {
        // ディザー専用パス - 対角線バッファを使用
        const solidG = pipeline.createGraphics(diag.diagonal, diag.diagonal);
        solidG.push();
        solidG.background(255);
        solidG.noStroke();
        solidG.fill(0);
        solidG.drawingContext.save();
        solidG.drawingContext.translate(diag.offsetX, diag.offsetY);
        pipeline.drawPathToCanvas(path, solidG.drawingContext);
        solidG.drawingContext.fill();
        solidG.drawingContext.restore();
        solidG.pop();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const dithered = window.ditherImage(solidG, ...dither.ditherArgs);
        channels.forEach((channel, i) => {
            const channelVal = fill.channelVals[i];
            if (channelVal !== undefined && channelVal > 0) {
                channel.push();
                channel.fill(createInkDepth(channelVal));
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                channel.image(dithered, diag.drawX, diag.drawY);
                channel.pop();
            }
        });
    }
    else {
        // 通常パス（エフェクトなし）
        channels.forEach((channel, i) => {
            const channelVal = fill.channelVals[i];
            if (channelVal !== undefined && channelVal > 0) {
                channel.push();
                channel.fill(createInkDepth(channelVal));
                pipeline.drawPathToCanvas(path, channel.drawingContext);
                channel.drawingContext.fill();
                channel.pop();
            }
        });
    }
};
//# sourceMappingURL=solid.js.map