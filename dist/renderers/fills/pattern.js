/**
 * パターンFillレンダラー
 */
import { createInkDepth } from '../../utils/inkDepth.js';
import { ensurePTNAvailable } from '../../channels/operations.js';
import { degreesToRadians } from '../../utils/angleConverter.js';
import { mergeEffects } from '../../utils/effect-merge.js';
import { applyEffectPipeline } from '../shared/effect-pipeline.js';
import { extractSize, extractPosition } from '../../utils/vec2-access.js';
/**
 * パターンFillをレンダリング
 *
 * @param fill - パターンFill設定
 * @param pipeline - GraphicsPipeline
 */
export const renderPatternFill = (fill, pipeline) => {
    ensurePTNAvailable();
    const options = pipeline.getOptions();
    const { channels, mode } = options;
    const path = options.path;
    // トップレベルとfill内のエフェクトをマージ（fill内が優先）
    const { filter, halftone, dither } = mergeEffects({ filter: options.filter, halftone: options.halftone, dither: options.dither }, { filter: fill.filter, halftone: fill.halftone, dither: fill.dither });
    // Vec2ヘルパーで座標を抽出
    const { width: gSizeWidth, height: gSizeHeight } = extractSize(pipeline);
    const { x: gPosX, y: gPosY } = extractPosition(pipeline);
    // パターングラフィックスの作成
    const patG = pipeline.createGraphics(gSizeWidth, gSizeHeight);
    patG.background(255);
    patG.noStroke();
    // patternAngleは度数法で指定されているのでラジアンに変換
    patG.patternAngle(degreesToRadians(fill.patternAngle ?? 0));
    const patternFn = PTN[fill.PTN];
    if (!patternFn) {
        throw new Error(`Pattern '${fill.PTN}' not found in PTN object`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
    patG.pattern(patternFn(...fill.patternArgs));
    patG.rectPattern(0, 0, gSizeWidth, gSizeHeight);
    // ベースグラフィックスにパターンを適用（クリップ後にfilter適用するためここではfilterなし）
    const baseG = pipeline.getBaseGraphics();
    baseG.drawingContext.save();
    pipeline.drawPathToCanvas(path, baseG.drawingContext);
    baseG.drawingContext.clip();
    baseG.image(patG, gPosX, gPosY);
    baseG.drawingContext.restore();
    // エフェクトパイプライン適用（フィルター → 対角線バッファ → halftone/dither）
    const { canvasSize } = options;
    const { graphics: processedG, drawX, drawY } = applyEffectPipeline(baseG, filter, halftone, dither, canvasSize, pipeline);
    pipeline.setBaseGraphics(processedG);
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
//# sourceMappingURL=pattern.js.map