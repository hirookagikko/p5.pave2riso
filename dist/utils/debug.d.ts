/**
 * Debug utilities for p5.pave2riso
 *
 * Provides controlled debug logging that can be enabled/disabled at runtime.
 *
 * @module utils/debug
 */
/**
 * Enable debug logging
 *
 * @param categories - Optional list of categories to enable (empty = all)
 *
 * @example
 * ```typescript
 * // Enable all debug logging
 * enableDebug()
 *
 * // Enable specific categories
 * enableDebug('font', 'pathfinder')
 * ```
 */
export declare const enableDebug: (...categories: string[]) => void;
/**
 * Disable debug logging
 */
export declare const disableDebug: () => void;
/**
 * Check if debug is enabled for a category
 *
 * @param category - Category to check
 * @returns true if debug is enabled for this category
 */
export declare const isDebugEnabled: (category?: string) => boolean;
/**
 * Log a debug message
 *
 * @param category - Debug category (e.g., 'font', 'pathfinder')
 * @param args - Arguments to log
 *
 * @example
 * ```typescript
 * debugLog('font', 'Processing path:', pathInfo)
 * debugLog('pathfinder', 'Intersection result:', result)
 * ```
 */
export declare const debugLog: (category: string, ...args: unknown[]) => void;
/**
 * Log a debug warning
 *
 * @param category - Debug category
 * @param args - Arguments to log
 */
export declare const debugWarn: (category: string, ...args: unknown[]) => void;
/**
 * Set debug state from environment variable (for testing)
 *
 * Checks for window.__P5_PAVE2RISO_DEBUG__ global variable.
 * Since this library runs in the browser, Node.js process.env is not available.
 *
 * @example
 * ```html
 * <script>
 *   // Enable debug before loading the library
 *   window.__P5_PAVE2RISO_DEBUG__ = true
 *   // Or enable specific categories
 *   window.__P5_PAVE2RISO_DEBUG__ = 'font,pathfinder'
 * </script>
 * ```
 */
export declare const initDebugFromEnv: () => void;
//# sourceMappingURL=debug.d.ts.map