/**
 * 破線Strokeレンダラー
 */
import { createInkDepth } from '../../utils/inkDepth.js';
/**
 * 破線Strokeをレンダリング
 *
 * @param stroke - 破線Stroke設定
 * @param pipeline - GraphicsPipeline
 */
export const renderDashedStroke = (stroke, pipeline) => {
    const options = pipeline.getOptions();
    const { channels } = options;
    const path = options.path;
    channels.forEach((channel, i) => {
        const channelVal = stroke.channelVals[i];
        if (channelVal !== undefined && channelVal > 0) {
            channel.push();
            channel.stroke(createInkDepth(channelVal));
            channel.strokeWeight(stroke.strokeWeight);
            channel.drawingContext.setLineDash(stroke.dashArgs);
            channel.drawingContext.lineCap = stroke.strokeCap;
            pipeline.drawPathToCanvas(path, channel.drawingContext);
            channel.drawingContext.stroke();
            channel.pop();
        }
    });
};
//# sourceMappingURL=dashed.js.map