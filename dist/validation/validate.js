/**
 * 入力バリデーション
 */
import { hasCurves } from '../types/core.js';
/** 有効なグラデーションタイプ */
const VALID_GRADIENT_TYPES = ['linear', 'radial', 'conic'];
/** 有効なストロークキャップ */
const VALID_STROKE_CAPS = ['round', 'square', 'butt'];
/** 有効なストロークジョイン */
const VALID_STROKE_JOINS = ['miter', 'bevel', 'round'];
/**
 * channelValsの範囲を検証 (0-100)
 */
const validateChannelVals = (vals, context) => {
    if (!Array.isArray(vals)) {
        throw new TypeError(`${context}.channelVals must be an array`);
    }
    for (let i = 0; i < vals.length; i++) {
        const val = vals[i];
        if (typeof val !== 'number' || !Number.isFinite(val)) {
            throw new TypeError(`${context}.channelVals[${i}] must be a finite number`);
        }
        if (val < 0 || val > 100) {
            throw new TypeError(`${context}.channelVals[${i}] must be between 0 and 100`);
        }
    }
};
/**
 * ColorStopEntryの検証
 */
const validateColorStopEntry = (entry, context) => {
    if (typeof entry.position !== 'number' || !Number.isFinite(entry.position)) {
        throw new TypeError(`${context}.position must be a finite number`);
    }
    if (entry.position < 0 || entry.position > 100) {
        throw new TypeError(`${context}.position must be between 0 and 100`);
    }
    if (typeof entry.depth !== 'number' || !Number.isFinite(entry.depth)) {
        throw new TypeError(`${context}.depth must be a finite number`);
    }
    if (entry.depth < 0 || entry.depth > 100) {
        throw new TypeError(`${context}.depth must be between 0 and 100`);
    }
};
/**
 * ColorStopsの検証（順序と値の検証）
 */
const validateColorStops = (colorStops, context) => {
    if (!Array.isArray(colorStops) || colorStops.length === 0) {
        throw new TypeError(`${context}.colorStops must be a non-empty array`);
    }
    for (const cs of colorStops) {
        const csIndex = colorStops.indexOf(cs);
        const csContext = `${context}.colorStops[${csIndex}]`;
        if (typeof cs.channel !== 'number' || !Number.isInteger(cs.channel) || cs.channel < 0) {
            throw new TypeError(`${csContext}.channel must be a non-negative integer`);
        }
        if (!Array.isArray(cs.stops) || cs.stops.length === 0) {
            throw new TypeError(`${csContext}.stops must be a non-empty array`);
        }
        // 各stopエントリの検証とposition順序の検証
        let prevPosition = -1;
        for (const entry of cs.stops) {
            const entryIndex = cs.stops.indexOf(entry);
            validateColorStopEntry(entry, `${csContext}.stops[${entryIndex}]`);
            // position順序検証（昇順であること）
            if (entry.position < prevPosition) {
                throw new TypeError(`${csContext}.stops[${entryIndex}].position must be >= previous position (${prevPosition})`);
            }
            prevPosition = entry.position;
        }
    }
};
/**
 * Fill設定の詳細検証
 */
const validateFillConfig = (fill) => {
    switch (fill.type) {
        case 'solid':
            validateChannelVals(fill.channelVals, 'fill');
            break;
        case 'pattern':
            validateChannelVals(fill.channelVals, 'fill');
            if (!fill.PTN || typeof fill.PTN !== 'string') {
                throw new TypeError('fill.PTN must be a non-empty string');
            }
            if (!Array.isArray(fill.patternArgs)) {
                throw new TypeError('fill.patternArgs must be an array');
            }
            break;
        case 'gradient':
            if (!VALID_GRADIENT_TYPES.includes(fill.gradientType)) {
                throw new TypeError(`fill.gradientType must be one of: ${VALID_GRADIENT_TYPES.join(', ')}`);
            }
            validateColorStops(fill.colorStops, 'fill');
            break;
        case 'image':
            if (!fill.image) {
                throw new TypeError('fill.image is required for image fill');
            }
            if (fill.channelVals) {
                validateChannelVals(fill.channelVals, 'fill');
            }
            break;
        default: {
            const exhaustiveCheck = fill;
            throw new TypeError(`Unknown fill type: ${exhaustiveCheck.type}`);
        }
    }
};
/**
 * Stroke設定の詳細検証
 */
const validateStrokeConfig = (stroke) => {
    // strokeWeight検証
    if (typeof stroke.strokeWeight !== 'number' || !Number.isFinite(stroke.strokeWeight)) {
        throw new TypeError('stroke.strokeWeight must be a finite number');
    }
    if (stroke.strokeWeight <= 0) {
        throw new TypeError('stroke.strokeWeight must be a positive number');
    }
    // strokeCap検証
    if (stroke.strokeCap !== undefined && !VALID_STROKE_CAPS.includes(stroke.strokeCap)) {
        throw new TypeError(`stroke.strokeCap must be one of: ${VALID_STROKE_CAPS.join(', ')}`);
    }
    // strokeJoin検証
    if (stroke.strokeJoin !== undefined && !VALID_STROKE_JOINS.includes(stroke.strokeJoin)) {
        throw new TypeError(`stroke.strokeJoin must be one of: ${VALID_STROKE_JOINS.join(', ')}`);
    }
    switch (stroke.type) {
        case 'solid':
            validateChannelVals(stroke.channelVals, 'stroke');
            break;
        case 'dashed':
            validateChannelVals(stroke.channelVals, 'stroke');
            if (!Array.isArray(stroke.dashArgs) || stroke.dashArgs.length < 2) {
                throw new TypeError('stroke.dashArgs must be an array with at least 2 elements');
            }
            if (stroke.dashArgs.some(v => typeof v !== 'number' || v < 0)) {
                throw new TypeError('stroke.dashArgs must contain non-negative numbers');
            }
            break;
        case 'pattern':
            validateChannelVals(stroke.channelVals, 'stroke');
            if (!stroke.PTN || typeof stroke.PTN !== 'string') {
                throw new TypeError('stroke.PTN must be a non-empty string');
            }
            if (!Array.isArray(stroke.patternArgs)) {
                throw new TypeError('stroke.patternArgs must be an array');
            }
            if (stroke.dashArgs) {
                if (!Array.isArray(stroke.dashArgs) || stroke.dashArgs.length < 2) {
                    throw new TypeError('stroke.dashArgs must be an array with at least 2 elements');
                }
                if (stroke.dashArgs.some(v => typeof v !== 'number' || v < 0)) {
                    throw new TypeError('stroke.dashArgs must contain non-negative numbers');
                }
            }
            break;
        case 'gradient':
            if (!VALID_GRADIENT_TYPES.includes(stroke.gradientType)) {
                throw new TypeError(`stroke.gradientType must be one of: ${VALID_GRADIENT_TYPES.join(', ')}`);
            }
            validateColorStops(stroke.colorStops, 'stroke');
            if (stroke.dashArgs) {
                if (!Array.isArray(stroke.dashArgs) || stroke.dashArgs.length < 2) {
                    throw new TypeError('stroke.dashArgs must be an array with at least 2 elements');
                }
                if (stroke.dashArgs.some(v => typeof v !== 'number' || v < 0)) {
                    throw new TypeError('stroke.dashArgs must contain non-negative numbers');
                }
            }
            break;
        default: {
            const exhaustiveCheck = stroke;
            throw new TypeError(`Unknown stroke type: ${exhaustiveCheck.type}`);
        }
    }
};
/**
 * Pave2RisoOptionsの妥当性を検証
 *
 * @param options - 検証するオプション
 * @throws {TypeError} 必須パラメータが不足または無効な場合
 */
export const validateOptions = (options) => {
    // pathの検証
    if (!options.path) {
        throw new TypeError('path is required');
    }
    // pathの構造検証
    if (!hasCurves(options.path)) {
        throw new TypeError('path must have curves property');
    }
    // canvasSizeの検証
    if (!Array.isArray(options.canvasSize) || options.canvasSize.length !== 2) {
        throw new TypeError('canvasSize must be [width, height]');
    }
    // canvasSizeの値検証
    const [width, height] = options.canvasSize;
    if (width <= 0 || height <= 0) {
        throw new TypeError('canvasSize must contain positive numbers');
    }
    if (!Number.isFinite(width) || !Number.isFinite(height)) {
        throw new TypeError('canvasSize must contain finite numbers');
    }
    // channelsの検証
    if (!Array.isArray(options.channels) || options.channels.length === 0) {
        throw new TypeError('channels must be a non-empty array');
    }
    // channelsの各要素がp5.Graphicsかどうか検証
    for (let i = 0; i < options.channels.length; i++) {
        const channel = options.channels[i];
        if (!channel || typeof channel.drawingContext === 'undefined') {
            throw new TypeError(`channels[${i}] is not a valid p5.Graphics object`);
        }
    }
    // modeの検証
    const validModes = ['overprint', 'cutout', 'join'];
    if (!options.mode || !validModes.includes(options.mode)) {
        throw new TypeError(`mode must be one of: ${validModes.join(', ')}`);
    }
    // fill/strokeの詳細検証
    if (options.fill) {
        if (!options.fill.type) {
            throw new TypeError('fill must have a type property');
        }
        validateFillConfig(options.fill);
    }
    if (options.stroke) {
        if (!options.stroke.type) {
            throw new TypeError('stroke must have a type property');
        }
        validateStrokeConfig(options.stroke);
    }
    // clippingPathの検証
    if (options.clippingPath && !hasCurves(options.clippingPath)) {
        throw new TypeError('clippingPath must be a valid Pave path with curves');
    }
};
//# sourceMappingURL=validate.js.map