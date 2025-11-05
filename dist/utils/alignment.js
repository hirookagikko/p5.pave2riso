/**
 * アライメント変換ユーティリティ
 */
/**
 * 水平方向のアライメントを0-1の数値に変換
 *
 * @param alignX - アライメント値
 * @returns 0-1の数値（0=left, 0.5=center, 1=right）
 *
 * @example
 * normalizeAlignX('left')   // 0
 * normalizeAlignX('center') // 0.5
 * normalizeAlignX('right')  // 1
 * normalizeAlignX(0.3)      // 0.3
 */
export const normalizeAlignX = (alignX) => {
    if (typeof alignX === 'number') {
        return alignX;
    }
    switch (alignX) {
        case 'left':
            return 0;
        case 'center':
            return 0.5;
        case 'right':
            return 1;
        default: {
            const _exhaustiveCheck = alignX;
            return _exhaustiveCheck;
        }
    }
};
/**
 * 垂直方向のアライメントを0-1の数値に変換
 *
 * @param alignY - アライメント値
 * @returns 0-1の数値（0=top, 0.5=middle, 1=bottom）
 *
 * @example
 * normalizeAlignY('top')    // 0
 * normalizeAlignY('middle') // 0.5
 * normalizeAlignY('bottom') // 1
 * normalizeAlignY(0.7)      // 0.7
 */
export const normalizeAlignY = (alignY) => {
    if (typeof alignY === 'number') {
        return alignY;
    }
    switch (alignY) {
        case 'top':
            return 0;
        case 'middle':
            return 0.5;
        case 'bottom':
            return 1;
        default: {
            const _exhaustiveCheck = alignY;
            return _exhaustiveCheck;
        }
    }
};
//# sourceMappingURL=alignment.js.map