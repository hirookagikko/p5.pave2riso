/**
 * インク濃度のBranded Type定義とユーティリティ
 */
/**
 * インク濃度パーセンテージ（0-100）をp5.jsカラー値（0-255）に変換
 *
 * @param value - インク濃度パーセンテージ（0-100）
 * @returns p5.jsカラー値（0-255）
 *
 * @example
 * const depth = createInkDepth(50) // 128
 * const full = createInkDepth(100) // 255
 * const none = createInkDepth(0)   // 0
 */
export const createInkDepth = (value) => {
    // p5.jsのmap関数を使用: map(value, start1, stop1, start2, stop2)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return Math.round(map(value, 0, 100, 0, 255));
};
/**
 * InkDepth型からnumber型への変換（安全な型キャスト）
 *
 * @param inkDepth - InkDepth値
 * @returns number値
 */
export const toNumber = (inkDepth) => {
    return inkDepth;
};
//# sourceMappingURL=inkDepth.js.map