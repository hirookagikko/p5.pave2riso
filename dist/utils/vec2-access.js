/**
 * Vec2アクセスヘルパー関数
 *
 * Linearly.jsのVec2型は配列インデックスでアクセスするが、
 * TypeScriptの型推論では適切に認識されないため、
 * eslint-disableの注釈をこのファイルに集約する。
 *
 * @see https://github.com/baku89/linearly
 */
/**
 * Vec2から座標を抽出
 *
 * @param vec - Vec2オブジェクト
 * @returns x, y座標
 */
export const extractVec2 = (vec) => {
    // Vec2は [0] と [1] を持つことが保証されている
    return { x: vec[0], y: vec[1] };
};
/**
 * GraphicsPipelineからサイズを抽出
 *
 * @param pipeline - GraphicsPipeline
 * @returns width, height
 */
export const extractSize = (pipeline) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const size = pipeline.getSize();
    const coords = extractVec2(size);
    return { width: coords.x, height: coords.y };
};
/**
 * GraphicsPipelineから位置を抽出
 *
 * @param pipeline - GraphicsPipeline
 * @returns x, y座標
 */
export const extractPosition = (pipeline) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const pos = pipeline.getPosition();
    return extractVec2(pos);
};
/**
 * GraphicsPipelineからストローク用のサイズと位置を抽出
 * （strokeWeight分のパディングを含む）
 *
 * @param pipeline - GraphicsPipeline
 * @param strokeWeight - ストローク幅
 * @returns 位置とサイズ（strokeWeight分のパディング込み）
 */
export const extractStrokeBounds = (pipeline, strokeWeight) => {
    const pos = extractPosition(pipeline);
    const size = extractSize(pipeline);
    return {
        x: pos.x - strokeWeight,
        y: pos.y - strokeWeight,
        width: size.width + strokeWeight * 2,
        height: size.height + strokeWeight * 2
    };
};
//# sourceMappingURL=vec2-access.js.map