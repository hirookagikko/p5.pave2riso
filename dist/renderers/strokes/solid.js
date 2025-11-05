/**
 * ベタ塗りStrokeレンダラー
 */
import { createInkDepth } from '../../utils/inkDepth.js';
/**
 * ベタ塗りStrokeをレンダリング
 *
 * @param stroke - ベタ塗りStroke設定
 * @param pipeline - GraphicsPipeline
 */
export const renderSolidStroke = (stroke, pipeline) => {
    const options = pipeline.getOptions();
    const { channels } = options;
    const path = options.path;
    channels.forEach((channel, i) => {
        const channelVal = stroke.channelVals[i];
        if (channelVal !== undefined && channelVal > 0) {
            channel.push();
            channel.stroke(createInkDepth(channelVal));
            channel.strokeWeight(stroke.strokeWeight);
            channel.strokeCap(stroke.strokeCap ?? ROUND);
            pipeline.drawPathToCanvas(path, channel.drawingContext);
            channel.drawingContext.stroke();
            channel.pop();
        }
    });
};
//# sourceMappingURL=solid.js.map