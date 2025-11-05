/**
 * ベタ塗りFillレンダラー
 */
import { createInkDepth } from '../../utils/inkDepth.js';
import { applyFilters, applyEffects } from '../../channels/operations.js';
/**
 * ベタ塗りFillをレンダリング
 *
 * @param fill - ベタ塗りFill設定
 * @param pipeline - GraphicsPipeline
 */
export const renderSolidFill = (fill, pipeline) => {
    const options = pipeline.getOptions();
    const { channels, filter, halftone, dither, mode } = options;
    const path = options.path;
    // JOINモードの場合は全チャンネルから削除
    if (mode === 'join') {
        if (filter) {
            // フィルター適用パス
            let eraseG = pipeline.createGraphics(options.canvasSize[0], options.canvasSize[1]);
            eraseG.background(255);
            eraseG.fill(0);
            eraseG.noStroke();
            pipeline.drawPathToCanvas(path, eraseG.drawingContext);
            eraseG.drawingContext.fill();
            eraseG = applyFilters(eraseG, filter);
            eraseG = applyEffects(eraseG, halftone, dither);
            channels.forEach((channel) => {
                channel.push();
                channel.fill(255);
                channel.noStroke();
                channel.blendMode(REMOVE);
                channel.image(eraseG, 0, 0);
                channel.blendMode(BLEND);
                channel.pop();
            });
        }
        else if (halftone && typeof window.halftoneImage === 'function') {
            // ハーフトーン適用パス
            const eraseG = pipeline.createGraphics(options.canvasSize[0], options.canvasSize[1]);
            eraseG.push();
            eraseG.background(255);
            eraseG.noStroke();
            eraseG.fill(0);
            pipeline.drawPathToCanvas(path, eraseG.drawingContext);
            eraseG.drawingContext.fill();
            eraseG.pop();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const halftoned = window.halftoneImage(eraseG, ...halftone.halftoneArgs);
            channels.forEach((channel) => {
                channel.push();
                channel.blendMode(REMOVE);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                channel.image(halftoned, 0, 0);
                channel.blendMode(BLEND);
                channel.pop();
            });
        }
        else if (dither && typeof window.ditherImage === 'function') {
            // ディザー適用パス
            const eraseG = pipeline.createGraphics(options.canvasSize[0], options.canvasSize[1]);
            eraseG.push();
            eraseG.background(255);
            eraseG.noStroke();
            eraseG.fill(0);
            pipeline.drawPathToCanvas(path, eraseG.drawingContext);
            eraseG.drawingContext.fill();
            eraseG.pop();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const dithered = window.ditherImage(eraseG, ...dither.ditherArgs);
            channels.forEach((channel) => {
                channel.push();
                channel.blendMode(REMOVE);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                channel.image(dithered, 0, 0);
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
        let baseG = pipeline.getBaseGraphics();
        baseG.push();
        baseG.noStroke();
        baseG.fill(0);
        pipeline.drawPathToCanvas(path, baseG.drawingContext);
        baseG.drawingContext.fill();
        baseG.pop();
        baseG = applyFilters(baseG, filter);
        baseG = applyEffects(baseG, halftone, dither);
        pipeline.setBaseGraphics(baseG);
        channels.forEach((channel, i) => {
            const channelVal = fill.channelVals[i];
            if (channelVal !== undefined && channelVal > 0) {
                channel.push();
                channel.fill(createInkDepth(channelVal));
                channel.image(baseG, 0, 0);
                channel.pop();
            }
        });
    }
    else if (halftone && typeof window.halftoneImage === 'function') {
        // ハーフトーン専用パス
        const solidG = pipeline.createGraphics(options.canvasSize[0], options.canvasSize[1]);
        solidG.push();
        solidG.background(255);
        solidG.noStroke();
        solidG.fill(0);
        pipeline.drawPathToCanvas(path, solidG.drawingContext);
        solidG.drawingContext.fill();
        solidG.pop();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const halftoned = window.halftoneImage(solidG, ...halftone.halftoneArgs);
        channels.forEach((channel, i) => {
            const channelVal = fill.channelVals[i];
            if (channelVal !== undefined && channelVal > 0) {
                channel.push();
                channel.fill(createInkDepth(channelVal));
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                channel.image(halftoned, 0, 0);
                channel.pop();
            }
        });
    }
    else if (dither && typeof window.ditherImage === 'function') {
        // ディザー専用パス
        const solidG = pipeline.createGraphics(options.canvasSize[0], options.canvasSize[1]);
        solidG.push();
        solidG.background(255);
        solidG.noStroke();
        solidG.fill(0);
        pipeline.drawPathToCanvas(path, solidG.drawingContext);
        solidG.drawingContext.fill();
        solidG.pop();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const dithered = window.ditherImage(solidG, ...dither.ditherArgs);
        channels.forEach((channel, i) => {
            const channelVal = fill.channelVals[i];
            if (channelVal !== undefined && channelVal > 0) {
                channel.push();
                channel.fill(createInkDepth(channelVal));
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                channel.image(dithered, 0, 0);
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