/**
 * パターンStrokeレンダラー
 */
import { ensurePTNAvailable } from '../../channels/operations.js';
import { degreesToRadians } from '../../utils/angleConverter.js';
/**
 * パターンStrokeをレンダリング
 *
 * @param stroke - パターンStroke設定
 * @param pipeline - GraphicsPipeline
 */
export const renderPatternStroke = (stroke, pipeline) => {
    ensurePTNAvailable();
    const options = pipeline.getOptions();
    const path = options.path;
    // Vec2 array index access - external library interface (linearly)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const gPos = pipeline.getPosition();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const gSize = pipeline.getSize();
    const baseG = pipeline.getBaseGraphics();
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
    patG.noFill();
    patG.strokeWeight(stroke.strokeWeight);
    // patternAngleは度数法で指定されているのでラジアンに変換
    patG.patternAngle(degreesToRadians(stroke.patternAngle ?? 0));
    const patternFn = PTN[stroke.PTN];
    if (!patternFn) {
        throw new Error(`Pattern '${stroke.PTN}' not found in PTN object`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
    patG.pattern(patternFn(...stroke.patternArgs));
    patG.rectPattern(0, 0, gSizeWidth, gSizeHeight);
    // ベースグラフィックスにパターンを適用
    pipeline.drawPathToCanvas(path, baseG.drawingContext);
    baseG.drawingContext.clip();
    baseG.image(patG, gPosX, gPosY);
};
//# sourceMappingURL=pattern.js.map