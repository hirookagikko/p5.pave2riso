/**
 * パターンFillレンダラー
 */
import { createInkDepth } from '../../utils/inkDepth.js';
import { applyFilters, applyEffects, ensurePTNAvailable } from '../../channels/operations.js';
import { degreesToRadians } from '../../utils/angleConverter.js';
/**
 * パターンFillをレンダリング
 *
 * @param fill - パターンFill設定
 * @param pipeline - GraphicsPipeline
 */
export const renderPatternFill = (fill, pipeline) => {
    ensurePTNAvailable();
    const options = pipeline.getOptions();
    const { channels, filter, halftone, dither, mode } = options;
    const path = options.path;
    // Vec2 array index access - external library interface (linearly)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const gPos = pipeline.getPosition();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const gSize = pipeline.getSize();
    // Vec2 array index access - external library interface (linearly)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const gSizeWidth = gSize[0];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const gSizeHeight = gSize[1];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const gPosX = gPos[0];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const gPosY = gPos[1];
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
    // フィルター適用
    const filteredPatG = applyFilters(patG, filter);
    // ベースグラフィックスにパターンを適用
    let baseG = pipeline.getBaseGraphics();
    pipeline.drawPathToCanvas(path, baseG.drawingContext);
    baseG.drawingContext.clip();
    baseG.image(filteredPatG, gPosX, gPosY);
    // エフェクト適用
    baseG = applyEffects(baseG, halftone, dither);
    pipeline.setBaseGraphics(baseG);
    // joinモードの場合は全チャンネルから削除
    if (mode === 'join') {
        channels.forEach((channel) => {
            channel.push();
            channel.blendMode(REMOVE);
            channel.image(baseG, 0, 0);
            channel.pop();
        });
    }
    // 各チャンネルに適用
    channels.forEach((channel, i) => {
        const channelVal = fill.channelVals?.[i];
        if (channelVal !== undefined && channelVal > 0) {
            channel.push();
            channel.fill(createInkDepth(channelVal));
            channel.image(baseG, 0, 0);
            channel.pop();
        }
    });
};
//# sourceMappingURL=pattern.js.map