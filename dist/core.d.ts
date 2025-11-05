/**
 * pave2Riso メイン関数
 *
 * Pave pathをRisographチャンネルに変換する
 */
import type { Pave2RisoOptions } from './types/core.js';
/**
 * Pave pathをRisographチャンネルに変換
 *
 * @param options - 変換オプション
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