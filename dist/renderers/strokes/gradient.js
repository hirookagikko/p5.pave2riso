/**
 * グラデーションStrokeレンダラー
 */
import { createInkDepth } from '../../utils/inkDepth.js';
/**
 * グラデーションStrokeをレンダリング
 *
 * @param stroke - グラデーションStroke設定
 * @param pipeline - GraphicsPipeline
 */
export const renderGradientStroke = (stroke, pipeline) => {
    const options = pipeline.getOptions();
    const { channels } = options;
    const path = options.path;
    // Vec2 array index access - external library interface (linearly)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const gSize = pipeline.getSize();
    if (!stroke.colorStops)
        return;
    // Vec2 array index access - external library interface (linearly)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const gSizeWidth = gSize[0];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const gSizeHeight = gSize[1];
    stroke.colorStops.forEach((colorStop) => {
        // チャンネルインデックスの検証
        if (colorStop.channel < 0 || colorStop.channel >= channels.length) {
            console.warn(`Invalid channel index: ${colorStop.channel}`);
            return;
        }
        // グラデーショングラフィックスの作成
        const gradG = pipeline.createGraphics(gSizeWidth + stroke.strokeWeight / 2, gSizeHeight + stroke.strokeWeight / 2);
        gradG.strokeWeight(stroke.strokeWeight);
        gradG.noFill();
        gradG.background(255);
        // グラデーションの作成
        let grad;
        switch (stroke.gradientType) {
            case 'linear': {
                grad = gradG.drawingContext.createLinearGradient(0, 0, gSizeWidth + stroke.strokeWeight / 2, gSizeHeight + stroke.strokeWeight / 2);
                break;
            }
            case 'radial': {
                const cx = gSizeWidth / 2;
                const cy = gSizeHeight / 2;
                const innerRadius = gSizeWidth * 0.1;
                const outerRadius = gSizeWidth / 2 + stroke.strokeWeight / 2;
                grad = gradG.drawingContext.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);
                break;
            }
            case 'conic': {
                const cx = gSizeWidth / 2;
                const cy = gSizeHeight / 2;
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
        // グラデーションを描画
        gradG.drawingContext.strokeStyle = grad;
        pipeline.drawPathToCanvas(path, gradG.drawingContext);
        gradG.drawingContext.stroke();
    });
};
//# sourceMappingURL=gradient.js.map