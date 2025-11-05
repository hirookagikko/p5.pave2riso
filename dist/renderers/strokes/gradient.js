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
    const gSize = pipeline.getSize();
    if (!stroke.colorStops)
        return;
    stroke.colorStops.forEach((colorStop) => {
        // チャンネルインデックスの検証
        if (colorStop.channel < 0 || colorStop.channel >= channels.length) {
            console.warn(`Invalid channel index: ${colorStop.channel}`);
            return;
        }
        // グラデーショングラフィックスの作成
        const gradG = pipeline.createGraphics(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        gSize[0] + stroke.strokeWeight / 2, 
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        gSize[1] + stroke.strokeWeight / 2);
        gradG.strokeWeight(stroke.strokeWeight);
        gradG.noFill();
        gradG.background(255);
        // グラデーションの作成
        let grad;
        switch (stroke.gradientType) {
            case 'linear': {
                grad = gradG.drawingContext.createLinearGradient(0, 0, 
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                gSize[0] + stroke.strokeWeight / 2, 
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                gSize[1] + stroke.strokeWeight / 2);
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
                const outerRadius = gSize[0] / 2 + stroke.strokeWeight / 2;
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
        gradG.drawingContext.strokeStyle = grad;
        pipeline.drawPathToCanvas(path, gradG.drawingContext);
        gradG.drawingContext.stroke();
    });
};
//# sourceMappingURL=gradient.js.map