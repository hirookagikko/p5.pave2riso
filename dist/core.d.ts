/**
 * pave2Riso main function
 *
 * Converts Pave path to Risograph channels
 */
import type { Pave2RisoOptions } from './types/core.js';
/**
 * Converts Pave path to Risograph channels
 *
 * @param options - Conversion options
 *
 * @example
 * pave2Riso({
 *   path: myPath,
 *   fill: { type: 'solid', channelVals: [100, 0, 0] },
 *   stroke: null,
 *   mode: 'overprint',
 *   canvasSize: [800, 600],
 *   channels: [channel1, channel2, channel3]
 * })
 */
export declare const pave2Riso: (options: Pave2RisoOptions) => void;
//# sourceMappingURL=core.d.ts.map