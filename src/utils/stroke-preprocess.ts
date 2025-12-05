/**
 * Stroke前処理ヘルパー関数
 *
 * core.tsのStroke前処理ロジックを集約し、
 * if-else連鎖を解消する。
 */

import type { StrokeConfig, StrokeCap, StrokeJoin } from '../types/stroke.js'
import type { RenderMode } from '../types/core.js'
import type { DashPattern } from '../types/branded.js'

/**
 * Stroke前処理に必要な共通パラメータ
 */
export interface StrokePreprocessParams {
  strokeWeight: number
  dashArgs?: DashPattern
  strokeCap?: StrokeCap
  strokeJoin?: StrokeJoin
}

/**
 * Strokeタイプとモードに基づいて前処理が必要かどうかを判定
 *
 * 前処理ルール:
 * - solid/dashed: cutout/joinモードで常に前処理
 * - pattern: cutoutモードのみ前処理（joinはレンダラー内で処理）
 * - gradient: cutoutモードのみ前処理（joinはレンダラー内で処理）
 *
 * @param strokeType - Strokeタイプ
 * @param mode - レンダリングモード
 * @returns 前処理が必要な場合true
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
 * StrokeConfigから前処理に必要なパラメータを抽出
 *
 * @param stroke - Stroke設定
 * @returns 前処理パラメータ
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
