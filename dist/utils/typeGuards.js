/**
 * Type guard functions
 */
/**
 * Type guards for FillConfig
 */
export const isSolidFill = (fill) => {
    return fill.type === 'solid';
};
export const isPatternFill = (fill) => {
    return fill.type === 'pattern';
};
export const isGradientFill = (fill) => {
    return fill.type === 'gradient';
};
export const isImageFill = (fill) => {
    return fill.type === 'image';
};
/**
 * Type guards for StrokeConfig
 */
export const isSolidStroke = (stroke) => {
    return stroke.type === 'solid';
};
export const isDashedStroke = (stroke) => {
    return stroke.type === 'dashed';
};
export const isPatternStroke = (stroke) => {
    return stroke.type === 'pattern';
};
export const isGradientStroke = (stroke) => {
    return stroke.type === 'gradient';
};
//# sourceMappingURL=typeGuards.js.map