/**
 * Type-safe wrappers for Paper.js and PaperOffset
 *
 * Provides a centralized, typed interface to Paper.js and paperjs-offset.
 * Supports both dependency injection and global fallback for backward compatibility.
 *
 * @module utils/paper-wrapper
 */
/**
 * Inject paper dependency
 *
 * @param p - paper instance from paper.js
 */
export declare function setPaper(p: any): void;
/**
 * Reset paper dependency to null
 */
export declare function resetPaper(): void;
/**
 * Inject PaperOffset dependency
 *
 * @param po - PaperOffset instance from paperjs-offset
 */
export declare function setPaperOffset(po: any): void;
/**
 * Reset PaperOffset dependency to null
 */
export declare function resetPaperOffset(): void;
/**
 * Get paper instance with dependency injection support
 *
 * Priority:
 * 1. Injected dependency (via setPaper)
 * 2. Global paper variable (backward compatibility)
 *
 * @returns paper instance or undefined if not available
 */
export declare function getPaper(): any;
/**
 * Get PaperOffset instance with dependency injection support
 *
 * Priority:
 * 1. Injected dependency (via setPaperOffset)
 * 2. Global PaperOffset variable (backward compatibility)
 *
 * @returns PaperOffset instance or undefined if not available
 */
export declare function getPaperOffset(): any;
//# sourceMappingURL=paper-wrapper.d.ts.map