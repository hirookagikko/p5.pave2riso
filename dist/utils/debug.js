/**
 * Debug utilities for p5.pave2riso
 *
 * Provides controlled debug logging that can be enabled/disabled at runtime.
 *
 * @module utils/debug
 */
/**
 * Current debug configuration
 */
const config = {
    enabled: false,
    categories: []
};
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
export const enableDebug = (...categories) => {
    config.enabled = true;
    config.categories = categories;
};
/**
 * Disable debug logging
 */
export const disableDebug = () => {
    config.enabled = false;
    config.categories = [];
};
/**
 * Check if debug is enabled for a category
 *
 * @param category - Category to check
 * @returns true if debug is enabled for this category
 */
export const isDebugEnabled = (category) => {
    if (!config.enabled)
        return false;
    if (config.categories.length === 0)
        return true;
    if (!category)
        return true;
    return config.categories.includes(category);
};
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
export const debugLog = (category, ...args) => {
    if (isDebugEnabled(category)) {
        console.log(`[${category}]`, ...args);
    }
};
/**
 * Log a debug warning
 *
 * @param category - Debug category
 * @param args - Arguments to log
 */
export const debugWarn = (category, ...args) => {
    if (isDebugEnabled(category)) {
        console.warn(`[${category}]`, ...args);
    }
};
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
export const initDebugFromEnv = () => {
    // Check for global debug flag (can be set in browser console or script tag)
    if (typeof window !== 'undefined') {
        const globalDebug = window.__P5_PAVE2RISO_DEBUG__;
        if (globalDebug === true) {
            enableDebug();
        }
        else if (typeof globalDebug === 'string') {
            enableDebug(...globalDebug.split(',').map(s => s.trim()));
        }
    }
};
//# sourceMappingURL=debug.js.map