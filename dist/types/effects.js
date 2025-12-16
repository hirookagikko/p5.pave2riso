/**
 * Effect configuration type definitions for filters, halftone, and dither
 */
/**
 * Converts from Legacy format to Discriminated Union format
 * Used for backward compatibility
 */
export const normalizeFilterConfig = (config) => {
    // すでに新形式の場合はそのまま返す
    if ('levels' in config || 'radius' in config || 'threshold' in config) {
        return config;
    }
    // Legacy形式から新形式への変換
    const legacy = config;
    switch (legacy.filterType) {
        case 'posterize':
            return { filterType: 'posterize', levels: legacy.filterArgs?.[0] ?? 4 };
        case 'blur':
            return { filterType: 'blur', radius: legacy.filterArgs?.[0] ?? 4 };
        case 'threshold':
            return { filterType: 'threshold', threshold: legacy.filterArgs?.[0] ?? 0.5 };
        default:
            return { filterType: legacy.filterType };
    }
};
//# sourceMappingURL=effects.js.map