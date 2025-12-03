/**
 * Type-safe wrappers for Paper.js and PaperOffset
 *
 * Provides a centralized, typed interface to Paper.js and paperjs-offset.
 * Supports both dependency injection and global fallback for backward compatibility.
 *
 * @module utils/paper-wrapper
 */
/**
 * Cached paper instance for dependency injection
 * @internal
 */
let cachedPaper = null;
/**
 * Cached PaperOffset instance for dependency injection
 * @internal
 */
let cachedPaperOffset = null;
/**
 * Inject paper dependency
 *
 * @param p - paper instance from paper.js
 */
export function setPaper(p) {
    cachedPaper = p;
}
/**
 * Reset paper dependency to null
 */
export function resetPaper() {
    cachedPaper = null;
}
/**
 * Inject PaperOffset dependency
 *
 * @param po - PaperOffset instance from paperjs-offset
 */
export function setPaperOffset(po) {
    cachedPaperOffset = po;
}
/**
 * Reset PaperOffset dependency to null
 */
export function resetPaperOffset() {
    cachedPaperOffset = null;
}
/**
 * Get paper instance with dependency injection support
 *
 * Priority:
 * 1. Injected dependency (via setPaper)
 * 2. Global paper variable (backward compatibility)
 *
 * @returns paper instance or undefined if not available
 */
export function getPaper() {
    if (cachedPaper)
        return cachedPaper;
    if (typeof paper !== 'undefined')
        return paper;
    return undefined;
}
/**
 * Get PaperOffset instance with dependency injection support
 *
 * Priority:
 * 1. Injected dependency (via setPaperOffset)
 * 2. Global PaperOffset variable (backward compatibility)
 *
 * @returns PaperOffset instance or undefined if not available
 */
export function getPaperOffset() {
    if (cachedPaperOffset)
        return cachedPaperOffset;
    if (typeof PaperOffset !== 'undefined')
        return PaperOffset;
    return undefined;
}
//# sourceMappingURL=paper-wrapper.js.map