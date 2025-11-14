/**
 * Font utilities for converting OpenType.js font paths to pave.js paths
 *
 * This module provides functions to convert OpenType.js font commands
 * into pave.js Path objects with proper handling of holes and compound paths.
 */
/**
 * Get Path from global context
 */
const getPath = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Path = globalThis.Path;
    if (!Path) {
        throw new Error('Path from pave.js is not available. Make sure pave.js is loaded.');
    }
    return Path;
};
/**
 * Calculates the area of a path using bounding box approximation
 *
 * @param path - Path to calculate area for
 * @returns Approximate area
 */
const getPathArea = (path) => {
    const Path = getPath();
    if (!path || !path.curves || path.curves.length === 0)
        return 0;
    const bounds = Path.bounds(path);
    const width = bounds[1][0] - bounds[0][0];
    const height = bounds[1][1] - bounds[0][1];
    return width * height;
};
/**
 * Determines the winding direction of a path using the Shoelace formula
 *
 * In a coordinate system where Y-axis points down (like pave.js/p5.js):
 * - Positive signed area = Counter-clockwise (CCW) = hole
 * - Negative signed area = Clockwise (CW) = solid
 *
 * @param path - Path to analyze
 * @returns Signed area (positive = CCW, negative = CW)
 */
const getPathWindingDirection = (path) => {
    if (!path || !path.curves || path.curves.length === 0)
        return 0;
    let signedArea = 0;
    // 各curveのポイントを取得して面積を計算
    for (let i = 0; i < path.curves.length; i++) {
        const curve = path.curves[i];
        // curveが配列の場合（各要素がセグメント）
        if (Array.isArray(curve)) {
            // 各セグメントから頂点を抽出
            for (let j = 0; j < curve.length; j++) {
                const segment = curve[j];
                const nextSegment = curve[(j + 1) % curve.length];
                // セグメントの最初の点を取得
                let x1, y1;
                let x2, y2;
                if (Array.isArray(segment) && segment.length >= 2) {
                    x1 = segment[0];
                    y1 = segment[1];
                }
                else if (segment && typeof segment === 'object') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    x1 = segment.x ?? segment[0];
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    y1 = segment.y ?? segment[1];
                }
                if (Array.isArray(nextSegment) && nextSegment.length >= 2) {
                    x2 = nextSegment[0];
                    y2 = nextSegment[1];
                }
                else if (nextSegment && typeof nextSegment === 'object') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    x2 = nextSegment.x ?? nextSegment[0];
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    y2 = nextSegment.y ?? nextSegment[1];
                }
                if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
                    signedArea += (x1 * y2 - x2 * y1);
                }
            }
        }
        // curveがverticesプロパティを持つオブジェクトの場合
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        else if (curve.vertices && Array.isArray(curve.vertices)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const vertices = curve.vertices;
            // Shoelace formula: 各頂点ペアで計算
            // vertices[i] は {point: [x, y], command: 'L'} 形式
            for (let j = 0; j < vertices.length; j++) {
                const current = vertices[j];
                const next = vertices[(j + 1) % vertices.length];
                // point プロパティから座標を取得
                const x1 = current.point[0];
                const y1 = current.point[1];
                const x2 = next.point[0];
                const y2 = next.point[1];
                signedArea += (x1 * y2 - x2 * y1);
            }
        }
    }
    // 符号付き面積を2で割る
    signedArea = signedArea / 2;
    // Y軸が下向きの座標系（pave.js/p5.js）では符号が逆になる：
    // 正の値 = 時計回り (CW) = 本体
    // 負の値 = 反時計回り (CCW) = 穴
    // したがって符号を反転して返す
    return -signedArea;
};
/**
 * Checks if two bounding boxes overlap
 *
 * @param bounds1 - First bounding box
 * @param bounds2 - Second bounding box
 * @returns true if boxes overlap
 */
const boundsOverlap = (bounds1, bounds2) => {
    const overlapX = bounds1[0][0] < bounds2[1][0] && bounds1[1][0] > bounds2[0][0];
    const overlapY = bounds1[0][1] < bounds2[1][1] && bounds1[1][1] > bounds2[0][1];
    return overlapX && overlapY;
};
/**
 * Determines the relationship between two bounding boxes
 *
 * @param bounds1 - First bounding box
 * @param bounds2 - Second bounding box
 * @returns Relationship type
 */
const checkBoundsRelation = (bounds1, bounds2) => {
    // 重なっていない場合
    if (!boundsOverlap(bounds1, bounds2)) {
        return 'INDEPENDENT';
    }
    // bounds2がbounds1に完全に含まれているかチェック
    const bounds2InBounds1 = bounds2[0][0] >= bounds1[0][0] && // minX
        bounds2[0][1] >= bounds1[0][1] && // minY
        bounds2[1][0] <= bounds1[1][0] && // maxX
        bounds2[1][1] <= bounds1[1][1]; // maxY
    if (bounds2InBounds1) {
        return 'CONTAINED';
    }
    // 部分的な重なり
    return 'OVERLAP';
};
/**
 * Determines which path operation to use (SUBTRACT or UNITE)
 *
 * @param largerPath - Larger path (by area)
 * @param smallerPath - Smaller path (by area)
 * @param largerOriginalWinding - Original winding of larger path (if known)
 * @param smallerOriginalWinding - Original winding of smaller path (if known)
 * @returns Operation to perform
 */
const determinePathOperation = (largerPath, smallerPath, largerOriginalWinding = null, smallerOriginalWinding = null) => {
    const Path = getPath();
    const largerBounds = Path.bounds(largerPath);
    const smallerBounds = Path.bounds(smallerPath);
    const largerArea = getPathArea(largerPath);
    const smallerArea = getPathArea(smallerPath);
    const largerWinding = largerOriginalWinding !== null ? largerOriginalWinding : getPathWindingDirection(largerPath);
    const smallerWinding = smallerOriginalWinding !== null ? smallerOriginalWinding : getPathWindingDirection(smallerPath);
    const relation = checkBoundsRelation(largerBounds, smallerBounds);
    const areaRatio = smallerArea / largerArea;
    const windingsSame = (largerWinding > 0 && smallerWinding > 0) ||
        (largerWinding <= 0 && smallerWinding <= 0);
    console.log(`  determinePathOperation:`);
    console.log(`    Relation: ${relation}`);
    console.log(`    Area ratio: ${areaRatio.toFixed(3)}`);
    console.log(`    Larger winding: ${largerWinding > 0 ? 'CW' : 'CCW'}${largerOriginalWinding !== null ? ' (original)' : ''}`);
    console.log(`    Smaller winding: ${smallerWinding > 0 ? 'CW' : 'CCW'}`);
    console.log(`    Windings same: ${windingsSame}`);
    if (relation === 'INDEPENDENT') {
        console.log(`  → UNITE (independent paths)`);
        return 'UNITE';
    }
    if (relation === 'CONTAINED') {
        // より正確な包含判定：SUBTRACTを試して、実際に穴として機能するかチェック
        let fullyContained = true;
        try {
            const subtracted = Path.subtract(largerPath, [smallerPath]);
            if (subtracted && subtracted.curves && subtracted.curves.length > 0) {
                // SUBTRACTの結果のcurve数が増えたら、実際に穴として機能している
                const largerCurves = largerPath.curves ? largerPath.curves.length : 0;
                const subtractedCurves = subtracted.curves ? subtracted.curves.length : 0;
                fullyContained = subtractedCurves > largerCurves;
                console.log(`    Larger curves: ${largerCurves}, Subtracted curves: ${subtractedCurves}`);
                console.log(`    Fully contained: ${fullyContained}`);
            }
            else {
                // SUBTRACT の結果が空なら、完全に外側にある
                fullyContained = false;
                console.log(`    Subtract resulted in empty path - smaller is outside`);
                console.log(`    Fully contained: ${fullyContained}`);
            }
        }
        catch (e) {
            console.warn(`    Warning: Path.subtract check failed, using bounds-based判定`, e.message);
            // エラーの場合はbounding boxベースの判定にフォールバック
            fullyContained = true;
        }
        // 完全に包含されていない場合（はみ出している）は solid として扱う
        if (!fullyContained) {
            console.log(`  → UNITE (contained by bounds but protruding from actual path - treating as solid)`);
            return 'UNITE';
        }
        // 完全に包含されている場合は、元のロジックで判定
        // 巻き方向が異なる場合、smallerを穴として扱う
        if (!windingsSame) {
            console.log(`  → SUBTRACT (fully contained, opposite winding - treating smaller as hole)`);
            return 'SUBTRACT';
        }
        // 巻き方向が同じ場合は、smallerの巻き方向で判定
        if (smallerWinding > 0) {
            // CCW = 穴 → SUBTRACT
            console.log(`  → SUBTRACT (fully contained, same winding but smaller is CCW hole)`);
            return 'SUBTRACT';
        }
        else {
            // CW = ソリッド → UNITE
            console.log(`  → UNITE (fully contained, same winding and smaller is CW solid)`);
            return 'UNITE';
        }
    }
    // OVERLAP
    if (windingsSame) {
        console.log(`  → UNITE (overlap, same winding)`);
        return 'UNITE';
    }
    else {
        // 巻き方向が逆でも、飛び出している場合は統合
        console.log(`  → UNITE (overlap, opposite winding but protruding)`);
        return 'UNITE';
    }
};
/**
 * Converts OpenType.js font commands to a pave.js Path
 *
 * This function handles the complex task of converting font outlines to paths,
 * including proper handling of:
 * - Multiple contours (outer shapes and holes)
 * - Winding direction detection
 * - Path union and subtraction operations
 * - Edge cases and error conditions
 *
 * Algorithm overview:
 * 1. Collect all individual paths from OpenType commands
 * 2. Sort paths by area (largest first)
 * 3. Use largest path as base (always treated as solid)
 * 4. Sequentially integrate remaining paths based on their relationship to the result
 *
 * @param commands - Array of OpenType.js path commands
 * @param options - Conversion options
 * @returns Combined pave.js Path
 *
 * @example
 * ```typescript
 * // Load font with opentype.js
 * const font = opentype.load('font.ttf')
 * const path = font.getPath('A', 0, 100, 72)
 * const pavePath = ot2pave(path.commands)
 * ```
 */
export const ot2pave = (commands, options = {}) => {
    const Path = getPath();
    const debugPaths = options.debugPaths || null;
    // フェーズ1: 全パスを収集
    const allPaths = [];
    let tempPath = []; // 処理用の一時的なパス
    let presentPos = [0, 0]; // 現在の座標
    console.log('\n=== PHASE 1: Collecting all paths ===');
    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        if (!cmd)
            continue;
        switch (cmd.type) {
            case 'M': // MoveTo
                break;
            case 'Z': { // ClosePath
                const newPath = Path.close(Path.join(tempPath), { fuse: false, group: -1 });
                const newArea = getPathArea(newPath);
                const newWinding = getPathWindingDirection(newPath);
                const newBounds = Path.bounds(newPath);
                allPaths.push({
                    path: newPath,
                    area: newArea,
                    winding: newWinding,
                    bounds: newBounds
                });
                console.log(`Path ${allPaths.length}: area=${newArea.toFixed(2)}, winding=${newWinding > 0 ? 'CCW' : 'CW'}`);
                // デバッグモード：個別パスを記録
                if (debugPaths) {
                    debugPaths.push({
                        path: newPath,
                        area: newArea,
                        winding: newWinding,
                        bounds: newBounds
                    });
                }
                tempPath = [];
                break;
            }
            case 'L': // LineTo
                tempPath.push(Path.line(presentPos, [cmd.x, cmd.y]));
                break;
            case 'C': // CubicBezier
                if (cmd.x1 !== undefined && cmd.y1 !== undefined && cmd.x2 !== undefined && cmd.y2 !== undefined) {
                    tempPath.push(Path.cubicBezier(presentPos, [cmd.x1, cmd.y1], [cmd.x2, cmd.y2], [cmd.x, cmd.y]));
                }
                break;
            case 'Q': // QuadraticBezier
                if (cmd.x1 !== undefined && cmd.y1 !== undefined) {
                    tempPath.push(Path.quadraticBezier(presentPos, [cmd.x1, cmd.y1], [cmd.x, cmd.y]));
                }
                break;
            default:
                break;
        }
        presentPos = [cmd.x, cmd.y];
    }
    // パスが1つもない場合は空のパスを返す
    if (allPaths.length === 0) {
        console.warn('⚠️ No paths found in commands');
        return Path.empty();
    }
    // フェーズ2: 面積の大きい順にソート
    console.log('\n=== PHASE 2: Sorting by area (largest first) ===');
    allPaths.sort((a, b) => b.area - a.area);
    for (let i = 0; i < allPaths.length; i++) {
        const path = allPaths[i];
        console.log(`Sorted[${i}]: area=${path.area.toFixed(2)}, winding=${path.winding > 0 ? 'CCW' : 'CW'}`);
    }
    // フェーズ3: 最大パスをベースに設定（巻き方向に関わらず無条件でsolid扱い）
    console.log('\n=== PHASE 3: Setting base path (largest) ===');
    const firstPath = allPaths[0];
    let result = firstPath.path;
    const basePathOriginalWinding = firstPath.winding; // 最初の要素の元の巻き方向を保持
    console.log(`Base path: area=${firstPath.area.toFixed(2)}, winding=${firstPath.winding > 0 ? 'CCW' : 'CW'}`);
    console.log('Note: Largest path is always treated as solid (base), regardless of winding direction');
    // フェーズ4: 逐次統合
    console.log('\n=== PHASE 4: Sequential integration ===');
    for (let i = 1; i < allPaths.length; i++) {
        const currentPath = allPaths[i];
        console.log(`\n--- Processing path ${i}/${allPaths.length - 1} ---`);
        console.log(`  Current path: area=${currentPath.area.toFixed(2)}, winding=${currentPath.winding > 0 ? 'CCW' : 'CW'}`);
        // 最初の統合（i=1）では、元の巻き方向を渡す
        const largerOriginalWinding = (i === 1) ? basePathOriginalWinding : null;
        const smallerOriginalWinding = currentPath.winding; // 常に元の巻き方向を使用
        const operation = determinePathOperation(result, currentPath.path, largerOriginalWinding, smallerOriginalWinding);
        if (operation === 'SUBTRACT') {
            const before = result;
            result = Path.subtract(result, [currentPath.path]);
            // 結果が空でないかチェック
            if (!result || !result.curves || result.curves.length === 0) {
                console.warn('⚠️ SUBTRACT resulted in empty path, keeping previous result');
                result = before;
            }
        }
        else if (operation === 'UNITE') {
            const before = result;
            result = Path.unite([result, currentPath.path]);
            // 結果が空でないかチェック
            if (!result || !result.curves || result.curves.length === 0) {
                console.warn('⚠️ UNITE resulted in empty path, keeping previous result');
                result = before;
            }
        }
    }
    console.log('\n=== FINAL RESULT ===');
    console.log(`Final path curves: ${result.curves ? result.curves.length : 0}`);
    return result;
};
//# sourceMappingURL=font-utils.js.map