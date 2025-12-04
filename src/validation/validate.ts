/**
 * 入力バリデーション
 */

import type { Pave2RisoOptions, RenderMode } from '../types/core.js'
import { hasCurves } from '../types/core.js'

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

  // pathの構造検証
  if (!hasCurves(options.path)) {
    throw new TypeError('path must have curves property')
  }

  // canvasSizeの検証
  if (!Array.isArray(options.canvasSize) || options.canvasSize.length !== 2) {
    throw new TypeError('canvasSize must be [width, height]')
  }

  // canvasSizeの値検証
  const [width, height] = options.canvasSize
  if (width <= 0 || height <= 0) {
    throw new TypeError('canvasSize must contain positive numbers')
  }
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new TypeError('canvasSize must contain finite numbers')
  }

  // channelsの検証
  if (!Array.isArray(options.channels) || options.channels.length === 0) {
    throw new TypeError('channels must be a non-empty array')
  }

  // channelsの各要素がp5.Graphicsかどうか検証
  for (let i = 0; i < options.channels.length; i++) {
    const channel = options.channels[i]
    if (!channel || typeof channel.drawingContext === 'undefined') {
      throw new TypeError(`channels[${i}] is not a valid p5.Graphics object`)
    }
  }

  // modeの検証
  const validModes: RenderMode[] = ['overprint', 'cutout', 'join']
  if (!options.mode || !validModes.includes(options.mode)) {
    throw new TypeError(`mode must be one of: ${validModes.join(', ')}`)
  }

  // fill/strokeの基本検証
  if (options.fill && !options.fill.type) {
    throw new TypeError('fill must have a type property')
  }
  if (options.stroke && !options.stroke.type) {
    throw new TypeError('stroke must have a type property')
  }

  // clippingPathの検証
  if (options.clippingPath && !hasCurves(options.clippingPath)) {
    throw new TypeError('clippingPath must be a valid Pave path with curves')
  }
}
