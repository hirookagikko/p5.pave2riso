import { pave2Riso } from '../core.js';
/**
 * Factory function that creates a pre-configured pave2Riso renderer
 *
 * @param context - Channels and canvas size to bind
 * @returns A function that accepts path and style options
 *
 * @example
 * ```typescript
 * const render = p2r({ channels, canvasSize })
 * render({ path: myPath, fill: { color: blue, channelVals: [100, 0, 0] } })
 * ```
 */
export const p2r = (context) => {
    return (ops) => pave2Riso({ ...context, ...ops });
};
//# sourceMappingURL=factory.js.map