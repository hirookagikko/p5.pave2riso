/**
 * パターンStrokeレンダラー
 */
import { ensurePTNAvailable, applyFilters, applyEffects } from '../../channels/operations.js';
import { degreesToRadians } from '../../utils/angleConverter.js';
import { createInkDepth } from '../../utils/inkDepth.js';
import { mergeEffects } from '../../utils/effect-merge.js';
import { getStrokeCapConstant, getStrokeJoinConstant, getCanvasLineCap, getCanvasLineJoin } from '../../utils/stroke-style.js';
import { calculateDiagonalBuffer } from '../../utils/diagonal-buffer.js';
/**
 * パターンStrokeをレンダリング
 *
 * destination-in 方式:
 * 1. パターングラフィックスを作成（全面にパターン描画）
 * 2. destination-in でストローク形状に切り抜き
 * 3. 各チャンネルに転送
 *
 * @param stroke - パターンStroke設定
 * @param pipeline - GraphicsPipeline
 */
export const renderPatternStroke = (stroke, pipeline) => {
    ensurePTNAvailable();
    const options = pipeline.getOptions();
    const { channels } = options;
    const path = options.path;
    // トップレベルとstroke内のエフェクトをマージ（stroke内が優先）
    const { filter, halftone, dither } = mergeEffects({ filter: options.filter, halftone: options.halftone, dither: options.dither }, { filter: stroke.filter, halftone: stroke.halftone, dither: stroke.dither });
    // パス境界 + strokeWeight でグラフィックスサイズを計算
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const gPos = pipeline.getPosition();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const gSize = pipeline.getSize();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const gPosX = gPos[0] - stroke.strokeWeight;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const gPosY = gPos[1] - stroke.strokeWeight;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const gWidth = (gSize[0]) + stroke.strokeWeight * 2;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const gHeight = (gSize[1]) + stroke.strokeWeight * 2;
    // 1. パターングラフィックス作成（パス境界 + strokeWeight サイズ）
    const patG = pipeline.createGraphics(gWidth, gHeight);
    patG.background(255);
    // patternAngleは度数法で指定されているのでラジアンに変換
    patG.patternAngle(degreesToRadians(stroke.patternAngle ?? 0));
    const patternFn = PTN[stroke.PTN];
    if (!patternFn) {
        throw new Error(`Pattern '${stroke.PTN}' not found in PTN object`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
    patG.pattern(patternFn(...stroke.patternArgs));
    patG.rectPattern(0, 0, gWidth, gHeight);
    // 2. destination-in でストローク形状に切り抜き
    // パターンの上にストローク形状を描画し、重なる部分だけパターンを残す
    patG.drawingContext.globalCompositeOperation = 'destination-in';
    patG.noFill();
    patG.stroke(0); // 色は関係ない、形状のみ
    patG.strokeWeight(stroke.strokeWeight);
    patG.strokeCap(getStrokeCapConstant(stroke.strokeCap));
    patG.strokeJoin(getStrokeJoinConstant(stroke.strokeJoin));
    patG.drawingContext.lineCap = getCanvasLineCap(stroke.strokeCap);
    patG.drawingContext.lineJoin = getCanvasLineJoin(stroke.strokeJoin);
    // 破線パターンの適用
    if (stroke.dashArgs) {
        patG.drawingContext.setLineDash(stroke.dashArgs);
    }
    // パス座標をグラフィックス座標に変換
    patG.drawingContext.save();
    patG.drawingContext.translate(-gPosX, -gPosY);
    pipeline.drawPathToCanvas(path, patG.drawingContext);
    patG.drawingContext.stroke();
    patG.drawingContext.restore();
    // 破線パターンのリセット
    if (stroke.dashArgs) {
        patG.drawingContext.setLineDash([]);
    }
    // 透明部分を白で塗りつぶし（バリ防止）
    // destination-over: 既存ピクセルの下に描画
    patG.drawingContext.globalCompositeOperation = 'destination-over';
    patG.drawingContext.fillStyle = 'white';
    patG.drawingContext.fillRect(0, 0, gWidth, gHeight);
    patG.drawingContext.globalCompositeOperation = 'source-over';
    // エフェクト適用
    let finalPatG = patG;
    const { canvasSize } = options;
    const diag = calculateDiagonalBuffer(canvasSize, halftone, dither);
    if (filter) {
        finalPatG = applyFilters(finalPatG, filter);
    }
    // halftone/dither: 対角線サイズのグラフィックスにコピーしてから適用
    // (halftoneImageは角度付き回転で細長いキャンバスだとクリップされる)
    let drawPosX = gPosX;
    let drawPosY = gPosY;
    if (diag.usesDiagonalBuffer) {
        const fullG = pipeline.createGraphics(diag.diagonal, diag.diagonal);
        fullG.background(255);
        fullG.image(finalPatG, gPosX + diag.offsetX, gPosY + diag.offsetY);
        finalPatG = applyEffects(fullG, halftone, dither);
        drawPosX = diag.drawX;
        drawPosY = diag.drawY;
    }
    // 3. 各チャンネルに転送
    const mode = options.mode;
    if (mode === 'join') {
        // joinモード: パターンの柄を全チャンネルから削除（blendMode REMOVE）
        channels.forEach((channel) => {
            channel.push();
            channel.blendMode(REMOVE);
            channel.image(finalPatG, drawPosX, drawPosY);
            channel.pop();
        });
    }
    // 各チャンネルに適用（joinモードでも描画する）
    channels.forEach((channel, i) => {
        const channelVal = stroke.channelVals[i];
        if (channelVal !== undefined && channelVal > 0) {
            channel.push();
            channel.fill(createInkDepth(channelVal));
            channel.image(finalPatG, drawPosX, drawPosY);
            channel.pop();
        }
    });
};
//# sourceMappingURL=pattern.js.map