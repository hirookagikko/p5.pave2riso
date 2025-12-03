/**
 * Type-safe wrappers for Paper.js and PaperOffset
 *
 * Provides a centralized, typed interface to Paper.js and paperjs-offset.
 * Supports both dependency injection and global fallback for backward compatibility.
 *
 * @module utils/paper-wrapper
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Global declarations for fallback (backward compatibility)
declare const paper: any
declare const PaperOffset: any

/**
 * Cached paper instance for dependency injection
 * @internal
 */
let cachedPaper: any = null

/**
 * Cached PaperOffset instance for dependency injection
 * @internal
 */
let cachedPaperOffset: any = null

/**
 * Inject paper dependency
 *
 * @param p - paper instance from paper.js
 */
export function setPaper(p: any): void {
  cachedPaper = p
}

/**
 * Reset paper dependency to null
 */
export function resetPaper(): void {
  cachedPaper = null
}

/**
 * Inject PaperOffset dependency
 *
 * @param po - PaperOffset instance from paperjs-offset
 */
export function setPaperOffset(po: any): void {
  cachedPaperOffset = po
}

/**
 * Reset PaperOffset dependency to null
 */
export function resetPaperOffset(): void {
  cachedPaperOffset = null
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
export function getPaper(): any {
  if (cachedPaper) return cachedPaper
  if (typeof paper !== 'undefined') return paper
  return undefined
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
export function getPaperOffset(): any {
  if (cachedPaperOffset) return cachedPaperOffset
  if (typeof PaperOffset !== 'undefined') return PaperOffset
  return undefined
}
