/**
 * Core type definitions
 */
/**
 * Type guard to check if a value has curves property
 */
export function hasCurves(path) {
    return (typeof path === 'object' &&
        path !== null &&
        'curves' in path &&
        Array.isArray(path.curves));
}
//# sourceMappingURL=core.js.map