/**
 * Type-safe wrappers for Paper.js and PaperOffset
 *
 * Provides a centralized, typed interface to Paper.js and paperjs-offset.
 * Supports both dependency injection and global fallback for backward compatibility.
 *
 * @module utils/paper-wrapper
 */

import type { PaperInstance, PaperOffsetStatic } from '../types/paper.js'

// Global declarations for fallback (backward compatibility)
// These are untyped because we can't control what's on the global scope
declare const paper: PaperInstance | undefined
declare const PaperOffset: PaperOffsetStatic | undefined

/**
 * Cached paper instance for dependency injection
 * @internal
 */
let cachedPaper: PaperInstance | null = null

/**
 * Cached PaperOffset instance for dependency injection
 * @internal
 */
let cachedPaperOffset: PaperOffsetStatic | null = null

/**
 * Inject paper dependency
 *
 * @param p - paper instance from paper.js
 */
export function setPaper(p: PaperInstance): void {
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
export function setPaperOffset(po: PaperOffsetStatic): void {
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
export function getPaper(): PaperInstance | undefined {
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
export function getPaperOffset(): PaperOffsetStatic | undefined {
  if (cachedPaperOffset) return cachedPaperOffset
  if (typeof PaperOffset !== 'undefined') return PaperOffset
  return undefined
}
