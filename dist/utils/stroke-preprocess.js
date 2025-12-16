/**
 * Stroke preprocessing helper functions
 *
 * Consolidates stroke preprocessing logic from core.ts
 * and eliminates if-else chains.
 */
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
export const shouldApplyStrokePreprocess = (strokeType, mode) => {
    // overprintモードでは前処理不要
    if (mode === 'overprint') {
        return false;
    }
    switch (strokeType) {
        case 'solid':
        case 'dashed':
            // solid/dashedは常に前処理（cutout/join両方）
            return true;
        case 'pattern':
        case 'gradient':
            // pattern/gradientはcutoutモードのみ
            // joinモードはレンダラー内で柄/グラデーションを使ってREMOVE処理
            return mode === 'cutout';
        default: {
            // 網羅性チェック
            const _exhaustiveCheck = strokeType;
            console.warn(`Unknown stroke type: ${String(_exhaustiveCheck)}`);
            return false;
        }
    }
};
/**
 * Extract parameters needed for preprocessing from StrokeConfig
 *
 * @param stroke - Stroke configuration
 * @returns Preprocessing parameters
 */
export const extractStrokePreprocessParams = (stroke) => {
    // 共通プロパティ（undefinedの場合はプロパティを設定しない）
    const params = {
        strokeWeight: stroke.strokeWeight
    };
    // strokeCapとstrokeJoinはundefinedでない場合のみ設定
    if (stroke.strokeCap !== undefined) {
        params.strokeCap = stroke.strokeCap;
    }
    if (stroke.strokeJoin !== undefined) {
        params.strokeJoin = stroke.strokeJoin;
    }
    // dashArgsはdashed/pattern/gradientタイプで存在する可能性がある
    if (stroke.type === 'dashed') {
        params.dashArgs = stroke.dashArgs;
    }
    else if (stroke.type === 'pattern' && stroke.dashArgs !== undefined) {
        params.dashArgs = stroke.dashArgs;
    }
    else if (stroke.type === 'gradient' && stroke.dashArgs !== undefined) {
        params.dashArgs = stroke.dashArgs;
    }
    return params;
};
//# sourceMappingURL=stroke-preprocess.js.map