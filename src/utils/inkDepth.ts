/**
 * インク濃度のBranded Type定義とユーティリティ
 */

/**
 * インク濃度（0-255のp5.jsカラー値）
 * Branded Typeでドメイン概念を明確化
 */
export type InkDepth = number & { readonly __brand: 'InkDepth' }

/**
 * インク濃度パーセンテージ（0-100）をp5.jsカラー値（0-255）に変換
 *
 * p5.jsのグローバルmap関数に依存せず、直接線形補間を実装
 *
 * @param value - インク濃度パーセンテージ（0-100）
 * @returns p5.jsカラー値（0-255）
 *
 * @example
 * const depth = createInkDepth(50) // 128
 * const full = createInkDepth(100) // 255
 * const none = createInkDepth(0)   // 0
 */
export const createInkDepth = (value: number): InkDepth => {
  // 線形補間: (value / 100) * 255
  // p5.jsのmap(value, 0, 100, 0, 255)と同等
  const mapped = (value / 100) * 255
  return Math.round(mapped) as InkDepth
}

/**
 * InkDepth型からnumber型への変換（安全な型キャスト）
 *
 * @param inkDepth - InkDepth値
 * @returns number値
 */
export const toNumber = (inkDepth: InkDepth): number => {
  return inkDepth as number
}
