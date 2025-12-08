/**
 * グラデーションStrokeレンダラー
 */
import { createInkDepth } from '../../utils/inkDepth.js';
import { mergeEffects } from '../../utils/effect-merge.js';
import { getStrokeCapConstant, getStrokeJoinConstant, getCanvasLineCap, getCanvasLineJoin } from '../../utils/stroke-style.js';
import { applyEffectPipelineWithOffset } from '../shared/effect-pipeline.js';
import { extractStrokeBounds } from '../../utils/vec2-access.js';
/**
 * グラデーション方向から座標を計算
 *
 * @param direction - グラデーション方向
 * @param width - 幅
 * @param height - 高さ
 * @returns [x1, y1, x2, y2]
 */
const getGradientCoords = (direction, width, height) => {
    switch (direction) {
        case 'TD':
            return [width / 2, 0, width / 2, height];
        case 'DT':
            return [width / 2, height, width / 2, 0];
        case 'LR':
            return [0, height / 2, width, height / 2];
        case 'RL':
            return [width, height / 2, 0, height / 2];
        case 'LTRB':
            return [0, 0, width, height];
        case 'RTLB':
            return [width, 0, 0, height];
        case 'LBRT':
            return [0, height, width, 0];
        case 'RBLT':
            return [width, height, 0, 0];
        default:
            return [0, 0, width, height];
    }
};
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
    const { x: gPosX, y: gPosY, width: gWidth, height: gHeight } = extractStrokeBounds(pipeline, stroke.strokeWeight);
    // 各colorStopのグラデーション画像を作成
    const gradImages = [];
    const { canvasSize } = options;
    // 描画位置（エフェクトパイプライン適用後に更新される可能性あり）
    let finalDrawPosX = gPosX;
    let finalDrawPosY = gPosY;
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
                const coords = getGradientCoords(stroke.gradientDirection, gWidth, gHeight);
                grad = gradG.drawingContext.createLinearGradient(...coords);
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
        // エフェクトパイプライン適用
        const { graphics: finalGradG, drawX, drawY } = applyEffectPipelineWithOffset(gradG, filter, halftone, dither, canvasSize, pipeline, gPosX, gPosY);
        // 描画位置を更新（全colorStopで同じ値になる）
        finalDrawPosX = drawX;
        finalDrawPosY = drawY;
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
    gradImages.forEach(({ gradG, channelIndex }) => {
        // joinモード: gradGで全チャンネルからREMOVE（グラデの黒い部分だけ削除）
        if (mode === 'join') {
            channels.forEach((channel) => {
                channel.push();
                channel.blendMode(REMOVE);
                channel.image(gradG, finalDrawPosX, finalDrawPosY);
                channel.pop();
            });
        }
        // 対象チャンネルにgradGを描画
        const channel = channels[channelIndex];
        if (channel) {
            channel.push();
            channel.image(gradG, finalDrawPosX, finalDrawPosY);
            channel.pop();
        }
    });
};
//# sourceMappingURL=gradient.js.map