/**
 * グラデーションStrokeレンダラー
 */
import { createInkDepth } from '../../utils/inkDepth.js';
import { applyFilters, applyEffects } from '../../channels/operations.js';
import { mergeEffects } from '../../utils/effect-merge.js';
import { getStrokeCapConstant, getStrokeJoinConstant, getCanvasLineCap, getCanvasLineJoin } from '../../utils/stroke-style.js';
import { calculateDiagonalBuffer } from '../../utils/diagonal-buffer.js';
/**
 * グラデーションStrokeをレンダリング
 *
 * pattern strokeと同様の構造:
 * 1. ソリッドストローク画像を作成（cutout/join用）
 * 2. 各colorStopのグラデーション画像を作成
 * 3. cutoutモード: 全チャンネルからソリッドでREMOVE
 * 4. joinモード: 全チャンネルからソリッドでREMOVE
 * 5. 各colorStopのグラデーションを対象チャンネルに転送
 *
 * @param stroke - グラデーションStroke設定
 * @param pipeline - GraphicsPipeline
 */
export const renderGradientStroke = (stroke, pipeline) => {
    const options = pipeline.getOptions();
    const { channels, mode } = options;
    const path = options.path;
    // トップレベルとstroke内のエフェクトをマージ（stroke内が優先）
    const { filter, halftone, dither } = mergeEffects({ filter: options.filter, halftone: options.halftone, dither: options.dither }, { filter: stroke.filter, halftone: stroke.halftone, dither: stroke.dither });
    if (!stroke.colorStops)
        return;
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
    // 各colorStopのグラデーション画像を作成
    const gradImages = [];
    // halftone/dither使用時の対角線バッファ計算（角度付き回転でのクリップ防止）
    const { canvasSize } = options;
    const diag = calculateDiagonalBuffer(canvasSize, halftone, dither);
    stroke.colorStops.forEach((colorStop) => {
        // チャンネルインデックスの検証
        if (colorStop.channel < 0 || colorStop.channel >= channels.length) {
            console.warn(`Invalid channel index: ${colorStop.channel}`);
            return;
        }
        // グラデーショングラフィックス作成（パス境界 + strokeWeight サイズ）
        const gradG = pipeline.createGraphics(gWidth, gHeight);
        gradG.background(255);
        gradG.noStroke();
        // グラデーションの作成（座標はローカル基準）
        let grad;
        switch (stroke.gradientType) {
            case 'linear': {
                grad = gradG.drawingContext.createLinearGradient(0, 0, gWidth, gHeight);
                break;
            }
            case 'radial': {
                const cx = gWidth / 2;
                const cy = gHeight / 2;
                const outerRadius = Math.max(gWidth, gHeight) / 2;
                grad = gradG.drawingContext.createRadialGradient(cx, cy, 0, cx, cy, outerRadius);
                break;
            }
            case 'conic': {
                const cx = gWidth / 2;
                const cy = gHeight / 2;
                grad = gradG.drawingContext.createConicGradient(0, cx, cy);
                break;
            }
        }
        // カラーストップの追加
        colorStop.stops.forEach((stop) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const c = color(255 - createInkDepth(stop.depth), 255 - createInkDepth(stop.depth), 255 - createInkDepth(stop.depth));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            grad.addColorStop(stop.position / 100, c.toString());
        });
        // グラデーションを全面描画
        gradG.drawingContext.fillStyle = grad;
        gradG.drawingContext.fillRect(0, 0, gWidth, gHeight);
        // destination-in でストローク形状に切り抜き
        gradG.drawingContext.globalCompositeOperation = 'destination-in';
        gradG.noFill();
        gradG.stroke(0); // 色は関係ない、形状のみ
        gradG.strokeWeight(stroke.strokeWeight);
        gradG.strokeCap(getStrokeCapConstant(stroke.strokeCap));
        gradG.strokeJoin(getStrokeJoinConstant(stroke.strokeJoin));
        gradG.drawingContext.lineCap = getCanvasLineCap(stroke.strokeCap);
        gradG.drawingContext.lineJoin = getCanvasLineJoin(stroke.strokeJoin);
        if (stroke.dashArgs) {
            gradG.drawingContext.setLineDash(stroke.dashArgs);
        }
        gradG.drawingContext.save();
        gradG.drawingContext.translate(-gPosX, -gPosY);
        pipeline.drawPathToCanvas(path, gradG.drawingContext);
        gradG.drawingContext.stroke();
        gradG.drawingContext.restore();
        if (stroke.dashArgs) {
            gradG.drawingContext.setLineDash([]);
        }
        // 透明部分を白で塗りつぶし（バリ防止）
        gradG.drawingContext.globalCompositeOperation = 'destination-over';
        gradG.drawingContext.fillStyle = 'white';
        gradG.drawingContext.fillRect(0, 0, gWidth, gHeight);
        gradG.drawingContext.globalCompositeOperation = 'source-over';
        // エフェクト適用
        let finalGradG = gradG;
        if (filter) {
            finalGradG = applyFilters(finalGradG, filter);
        }
        // halftone/dither: 対角線サイズのグラフィックスにコピーしてから適用
        // (halftoneImageは角度付き回転で細長いキャンバスだとクリップされる)
        if (diag.usesDiagonalBuffer) {
            const fullG = pipeline.createGraphics(diag.diagonal, diag.diagonal);
            fullG.background(255);
            fullG.image(finalGradG, gPosX + diag.offsetX, gPosY + diag.offsetY);
            finalGradG = applyEffects(fullG, halftone, dither);
        }
        gradImages.push({ gradG: finalGradG, channelIndex: colorStop.channel });
    });
    // 3. cutoutモード: 前処理でeraseされた透明部分を白く埋める
    // （gradientは特定チャンネルにしか描画されないため、描画されないチャンネルの
    //  透明部分を白で埋める必要がある）
    if (mode === 'cutout') {
        // 白いストローク画像を作成
        const whiteG = pipeline.createGraphics(gWidth, gHeight);
        whiteG.background(255);
        whiteG.noFill();
        whiteG.stroke(255); // 白いストローク
        whiteG.strokeWeight(stroke.strokeWeight);
        whiteG.strokeCap(getStrokeCapConstant(stroke.strokeCap));
        whiteG.strokeJoin(getStrokeJoinConstant(stroke.strokeJoin));
        whiteG.drawingContext.lineCap = getCanvasLineCap(stroke.strokeCap);
        whiteG.drawingContext.lineJoin = getCanvasLineJoin(stroke.strokeJoin);
        if (stroke.dashArgs) {
            whiteG.drawingContext.setLineDash(stroke.dashArgs);
        }
        whiteG.drawingContext.save();
        whiteG.drawingContext.translate(-gPosX, -gPosY);
        pipeline.drawPathToCanvas(path, whiteG.drawingContext);
        whiteG.drawingContext.stroke();
        whiteG.drawingContext.restore();
        if (stroke.dashArgs) {
            whiteG.drawingContext.setLineDash([]);
        }
        // 全チャンネルに白いストロークを描画（透明部分を白で埋める）
        channels.forEach((channel) => {
            channel.push();
            channel.image(whiteG, gPosX, gPosY);
            channel.pop();
        });
    }
    // 4. 各colorStopのグラデーションを対象チャンネルに転送
    // halftone使用時は負のオフセットで描画、それ以外は(gPosX, gPosY)
    const drawPosX = diag.usesDiagonalBuffer ? diag.drawX : gPosX;
    const drawPosY = diag.usesDiagonalBuffer ? diag.drawY : gPosY;
    gradImages.forEach(({ gradG, channelIndex }) => {
        // joinモード: gradGで全チャンネルからREMOVE（グラデの黒い部分だけ削除）
        if (mode === 'join') {
            channels.forEach((channel) => {
                channel.push();
                channel.blendMode(REMOVE);
                channel.image(gradG, drawPosX, drawPosY);
                channel.pop();
            });
        }
        // 対象チャンネルにgradGを描画
        const channel = channels[channelIndex];
        if (channel) {
            channel.push();
            channel.image(gradG, drawPosX, drawPosY);
            channel.pop();
        }
    });
};
//# sourceMappingURL=gradient.js.map