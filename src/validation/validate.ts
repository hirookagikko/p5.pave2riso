/**
 * 入力バリデーション
 */

import type { Pave2RisoOptions, RenderMode } from '../types/core.js'

/**
 * Pave2RisoOptionsの妥当性を検証
 *
 * @param options - 検証するオプション
 * @throws {TypeError} 必須パラメータが不足または無効な場合
 */
export const validateOptions = (options: Pave2RisoOptions): void => {
  // pathの検証
  if (!options.path) {
    throw new TypeError('path is required')
  }

  // canvasSizeの検証
  if (!Array.isArray(options.canvasSize) || options.canvasSize.length !== 2) {
    throw new TypeError('canvasSize must be [width, height]')
  }

  // channelsの検証
  if (!Array.isArray(options.channels) || options.channels.length === 0) {
    throw new TypeError('channels must be a non-empty array')
  }

  // modeの検証
  const validModes: RenderMode[] = ['overprint', 'cutout', 'join']
  if (!options.mode || !validModes.includes(options.mode)) {
    throw new TypeError(`mode must be one of: ${validModes.join(', ')}`)
  }
}
