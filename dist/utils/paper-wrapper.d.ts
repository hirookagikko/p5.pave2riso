/**
 * Type-safe wrappers for Paper.js and PaperOffset
 *
 * Provides a centralized, typed interface to Paper.js and paperjs-offset.
 * Supports both dependency injection and global fallback for backward compatibility.
 *
 * @module utils/paper-wrapper
 */
import type { PaperInstance, PaperOffsetStatic } from '../types/paper.js';
/**
 * Inject paper dependency
 *
 * @param p - paper instance from paper.js
 */
export declare function setPaper(p: PaperInstance): void;
/**
 * Reset paper dependency to null
 */
export declare function resetPaper(): void;
/**
 * Inject PaperOffset dependency
 *
 * @param po - PaperOffset instance from paperjs-offset
 */
export declare function setPaperOffset(po: PaperOffsetStatic): void;
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
export declare function getPaper(): PaperInstance | undefined;
/**
 * Get PaperOffset instance with dependency injection support
 *
 * Priority:
 * 1. Injected dependency (via setPaperOffset)
 * 2. Global PaperOffset variable (backward compatibility)
 *
 * @returns PaperOffset instance or undefined if not available
 */
export declare function getPaperOffset(): PaperOffsetStatic | undefined;
//# sourceMappingURL=paper-wrapper.d.ts.map