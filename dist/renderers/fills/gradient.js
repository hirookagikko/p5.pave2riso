/**
 * グラデーションFillレンダラー
 */
import { createInkDepth } from '../../utils/inkDepth.js';
import { applyFilters, applyEffects } from '../../channels/operations.js';
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
 * グラデーションFillをレンダリング
 *
 * @param fill - グラデーションFill設定
 * @param pipeline - GraphicsPipeline
 */
export const renderGradientFill = (fill, pipeline) => {
    const options = pipeline.getOptions();
    const { channels, filter, halftone, dither, mode } = options;
    const path = options.path;
    const gPos = pipeline.getPosition();
    const gSize = pipeline.getSize();
    if (!fill.colorStops)
        return;
    fill.colorStops.forEach((colorStop) => {
        // チャンネルインデックスの検証
        if (colorStop.channel < 0 || colorStop.channel >= channels.length) {
            console.warn(`Invalid channel index: ${colorStop.channel}`);
            return;
        }
        // グラデーショングラフィックスの作成
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const gradBaseG = pipeline.createGraphics(options.canvasSize[0], options.canvasSize[1]);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const gradG = pipeline.createGraphics(gSize[0], gSize[1]);
        gradBaseG.background(255);
        gradG.noStroke();
        gradG.background(255);
        // グラデーションの作成
        let grad;
        switch (fill.gradientType) {
            case 'linear': {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const coords = getGradientCoords(fill.gradientDirection, gSize[0], gSize[1]);
                grad = gradG.drawingContext.createLinearGradient(...coords);
                break;
            }
            case 'radial': {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const cx = gSize[0] / 2;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const cy = gSize[1] / 2;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const innerRadius = gSize[0] * 0.1;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const outerRadius = gSize[0] / 2;
                grad = gradG.drawingContext.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);
                break;
            }
            case 'conic': {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const cx = gSize[0] / 2;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const cy = gSize[1] / 2;
                grad = gradG.drawingContext.createConicGradient(0, cx, cy);
                break;
            }
        }
        // カラーストップの追加
        colorStop.stops.forEach((stop) => {
            const c = color(255 - createInkDepth(stop.depth), 255 - createInkDepth(stop.depth), 255 - createInkDepth(stop.depth));
            grad.addColorStop(stop.position / 100, c.toString());
        });
        // グラデーションを描画
        gradG.drawingContext.fillStyle = grad;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        gradG.rect(0, 0, gSize[0], gSize[1]);
        // クリッピングとエフェクト適用
        pipeline.drawPathToCanvas(path, gradBaseG.drawingContext);
        gradBaseG.drawingContext.clip();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        gradBaseG.image(gradG, gPos[0], gPos[1]);
        const finalG = applyEffects(applyFilters(gradBaseG, filter), halftone, dither);
        // JOINモードの場合は全チャンネルから削除
        if (mode === 'join') {
            channels.forEach((channel) => {
                channel.push();
                channel.blendMode(REMOVE);
                channel.image(finalG, 0, 0);
                channel.pop();
            });
        }
        // チャンネルに適用
        const channel = channels[colorStop.channel];
        if (channel) {
            channel.push();
            channel.image(finalG, 0, 0);
            channel.pop();
        }
    });
};
//# sourceMappingURL=gradient.js.map