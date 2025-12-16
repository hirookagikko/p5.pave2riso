/**
 * Stroke preprocessing helper functions
 *
 * Consolidates stroke preprocessing logic from core.ts
 * and eliminates if-else chains.
 */

import type { StrokeConfig, StrokeCap, StrokeJoin } from '../types/stroke.js'
import type { RenderMode } from '../types/core.js'
import type { DashPattern } from '../types/branded.js'

/**
 * Common parameters required for stroke preprocessing
 */
export interface StrokePreprocessParams {
  strokeWeight: number
  dashArgs?: DashPattern
  strokeCap?: StrokeCap
  strokeJoin?: StrokeJoin
}

/**
 * Determine if preprocessing is needed based on stroke type and mode
 *
 * Preprocessing rules:
 * - solid/dashed: Always preprocess in cutout/join modes
 * - pattern: Preprocess only in cutout mode (join handled in renderer)
 * - gradient: Preprocess only in cutout mode (join handled in renderer)
 *
 * @param strokeType - Stroke type
 * @param mode - Rendering mode
 * @returns true if preprocessing is required
 */
export const shouldApplyStrokePreprocess = (
  strokeType: StrokeConfig['type'],
  mode: RenderMode
): boolean => {
  // overprintモードでは前処理不要
  if (mode === 'overprint') {
    return false
  }

  switch (strokeType) {
    case 'solid':
    case 'dashed':
      // solid/dashedは常に前処理（cutout/join両方）
      return true
    case 'pattern':
    case 'gradient':
      // pattern/gradientはcutoutモードのみ
      // joinモードはレンダラー内で柄/グラデーションを使ってREMOVE処理
      return mode === 'cutout'
    default: {
      // 網羅性チェック
      const _exhaustiveCheck: never = strokeType
      console.warn(`Unknown stroke type: ${String(_exhaustiveCheck)}`)
      return false
    }
  }
}

/**
 * Extract parameters needed for preprocessing from StrokeConfig
 *
 * @param stroke - Stroke configuration
 * @returns Preprocessing parameters
 */
export const extractStrokePreprocessParams = (
  stroke: StrokeConfig
): StrokePreprocessParams => {
  // 共通プロパティ（undefinedの場合はプロパティを設定しない）
  const params: StrokePreprocessParams = {
    strokeWeight: stroke.strokeWeight
  }

  // strokeCapとstrokeJoinはundefinedでない場合のみ設定
  if (stroke.strokeCap !== undefined) {
    params.strokeCap = stroke.strokeCap
  }
  if (stroke.strokeJoin !== undefined) {
    params.strokeJoin = stroke.strokeJoin
  }

  // dashArgsはdashed/pattern/gradientタイプで存在する可能性がある
  if (stroke.type === 'dashed') {
    params.dashArgs = stroke.dashArgs
  } else if (stroke.type === 'pattern' && stroke.dashArgs !== undefined) {
    params.dashArgs = stroke.dashArgs
  } else if (stroke.type === 'gradient' && stroke.dashArgs !== undefined) {
    params.dashArgs = stroke.dashArgs
  }

  return params
}
