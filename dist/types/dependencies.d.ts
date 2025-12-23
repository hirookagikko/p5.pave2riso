/**
 * Dependency injection types for p5.pave2riso
 *
 * This module defines the interface for explicitly passing dependencies
 * to the library, enabling better testability and ESM compatibility.
 *
 * @module types/dependencies
 */
import type { PavePathStatic } from './pave.js';
import type { Vec2Static } from './linearly.js';
import type { PaperInstance, PaperOffsetStatic } from './paper.js';
/**
 * Dependencies required by p5.pave2riso
 *
 * Use this interface with `createP5Pave2Riso()` to explicitly inject
 * dependencies instead of relying on global variables.
 *
 * @example
 * ```typescript
 * import { Path } from '@baku89/pave'
 * import { vec2 } from 'linearly'
 * import { createP5Pave2Riso } from 'p5.pave2riso'
 *
 * const { p2r, PathIntersect } = createP5Pave2Riso({ Path, vec2 })
 * ```
 */
export interface P5Pave2RisoDeps {
    /**
     * Path constructor from Pave.js (@baku89/pave)
     * Required for all path operations
     */
    Path: PavePathStatic;
    /**
     * vec2 constructor from linearly
     * Required for vector math operations
     */
    vec2: Vec2Static;
    /**
     * Paper.js paper object (optional)
     * Required only for PathOffset functionality
     */
    paper?: PaperInstance;
    /**
     * PaperOffset library (optional)
     * Required only for PathOffset functionality
     */
    PaperOffset?: PaperOffsetStatic;
}
//# sourceMappingURL=dependencies.d.ts.map