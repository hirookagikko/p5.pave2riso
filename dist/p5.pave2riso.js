/**
 * Pave-Riso TypeScript Library
 *
 * Public API exports
 */
// Dependency Injection factory (recommended for ESM)
export { createP5Pave2Riso } from './create.js';
// メイン関数 (backward compatible - uses global variables)
export { pave2Riso } from './core.js';
// ユーティリティ
export { createInkDepth } from './utils/inkDepth.js';
// Factory function
export { p2r } from './utils/factory.js';
// Pathfinder utilities
export { PathIntersect, PathSubtract, PathUnite, PathExclude, isPathsOverlap, PathOffset, cleanupPaperResources } from './utils/pathfinder.js';
// Font utilities
export { ot2pave } from './utils/font-utils.js';
// Debug utilities
export { enableDebug, disableDebug, isDebugEnabled, initDebugFromEnv } from './utils/debug.js';
export { normalizeFilterConfig } from './types/effects.js';
//# sourceMappingURL=index.js.map