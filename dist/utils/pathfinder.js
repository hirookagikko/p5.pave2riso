/**
 * Pathfinder utilities for path boolean operations
 *
 * These functions provide safe wrappers around pave.js Path operations
 * with comprehensive error handling and edge case detection.
 */
import { createCircle, subtractPaths, unitePaths, getPathBounds, getPath } from './pave-wrapper.js';
import { getPaper, getPaperOffset } from './paper-wrapper.js';
// External dependencies for PathOffset (loaded via CDN or via DI)
// paper.js 0.12.4: https://cdn.jsdelivr.net/npm/paper@0.12.4/+esm
// paperjs-offset 1.0.8: https://cdn.jsdelivr.net/npm/paperjs-offset@1.0.8/+esm
// Types are imported from ../types/paper.js
/**
 * Type guard to check if a path has curves
 */
function hasCurves(path) {
    return path !== null && typeof path === 'object' && 'curves' in path && Array.isArray(path.curves);
}
/**
 * Computes the intersection of two paths (boolean AND operation)
 *
 * Returns a new path containing only the area where both paths overlap.
 * Handles edge cases including:
 * - Complete overlap (returns pathA)
 * - No overlap (returns empty path)
 * - Invalid paths (returns empty path with warning)
 *
 * @param pathA - First path
 * @param pathB - Second path
 * @returns Intersection path, or empty path if no intersection
 *
 * @example
 * ```typescript
 * const circle = Path.circle([100, 100], 50)
 * const rect = Path.rect([75, 75], [125, 125])
 * const intersection = PathIntersect(circle, rect)
 * ```
 */
export const PathIntersect = (pathA, pathB) => {
    // External library interface (pave.js) - return values are typed but ESLint sees them as any
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
    const emptyPath = createCircle([0, 0], 0);
    if (!pathA || !pathB) {
        console.warn("PathIntersect: pathA or pathB is invalid.");
        return emptyPath;
    }
    try {
        // 両方のPath.subtract操作をtry-catchで囲む
        const diff = subtractPaths(pathA, [pathB]);
        if (!diff || !hasCurves(diff) || diff.curves.length === 0) {
            console.warn("PathIntersect: Difference is empty or path is invalid.");
            return emptyPath;
        }
        const intersected = subtractPaths(pathA, [diff]);
        return intersected;
    }
    catch (e) {
        // Path.subtractでエラーが発生した場合（完全重複、完全分離など）
        if (e instanceof TypeError && e.message.includes("Cannot read properties of undefined")) {
            // Path.uniteで完全重複か完全分離かを判定
            try {
                const united = unitePaths([pathA, pathB]);
                // 結合後のcurves数が元のpathAと同じなら完全重複
                if (hasCurves(united) && hasCurves(pathA) && united.curves.length === pathA.curves.length) {
                    console.warn("PathIntersect: Paths completely overlap. Returning original path.");
                    return pathA;
                }
                else {
                    // 完全分離
                    console.warn("PathIntersect: Paths do not overlap. Returning empty path.");
                    return emptyPath;
                }
            }
            catch (uniteError) {
                // Path.uniteも失敗した場合は空パスを返す
                console.warn("PathIntersect: Intersection check failed. Returning empty path.");
                return emptyPath;
            }
        }
        else {
            // 予期しないエラーの場合は再スローする
            throw e;
        }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
};
/**
 * Subtracts pathB from pathA (boolean NOT operation)
 *
 * Returns a new path containing the area of pathA with pathB removed.
 * This is a simplified wrapper around Path.subtract(A, [B]).
 *
 * @param pathA - Base path to subtract from
 * @param pathB - Path to subtract
 * @returns Subtracted path, or empty path on error
 *
 * @example
 * ```typescript
 * const circle = Path.circle([100, 100], 50)
 * const rect = Path.rect([75, 75], [50, 50])
 * const result = PathSubtract(circle, rect)
 * // Returns circle with rect removed
 * ```
 */
export const PathSubtract = (pathA, pathB) => {
    // External library interface (pave.js) - return values are typed but ESLint sees them as any
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
    const emptyPath = createCircle([0, 0], 0);
    if (!pathA || !pathB) {
        console.warn("PathSubtract: pathA or pathB is invalid.");
        return emptyPath;
    }
    try {
        const result = subtractPaths(pathA, [pathB]);
        if (!result || !hasCurves(result)) {
            console.warn("PathSubtract: Result path is invalid.");
            return emptyPath;
        }
        return result;
    }
    catch (e) {
        // Path.subtractでエラーが発生した場合
        if (e instanceof TypeError && e.message.includes("Cannot read properties of undefined")) {
            console.warn("PathSubtract: Path subtraction failed. Returning empty path.");
            return emptyPath;
        }
        else {
            // 予期しないエラーの場合は再スローする
            throw e;
        }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
};
/**
 * Unite two paths (boolean OR operation)
 *
 * Returns a new path containing the combined area of both paths.
 * This is a simplified wrapper around Path.unite([A, B]).
 *
 * @param pathA - First path
 * @param pathB - Second path
 * @returns United path, or empty path on error
 *
 * @example
 * ```typescript
 * const circle1 = Path.circle([100, 100], 50)
 * const circle2 = Path.circle([150, 100], 50)
 * const result = PathUnite(circle1, circle2)
 * // Returns combined area of both circles
 * ```
 */
export const PathUnite = (pathA, pathB) => {
    // External library interface (pave.js) - return values are typed but ESLint sees them as any
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
    const emptyPath = createCircle([0, 0], 0);
    if (!pathA || !pathB) {
        console.warn("PathUnite: pathA or pathB is invalid.");
        return emptyPath;
    }
    try {
        const result = unitePaths([pathA, pathB]);
        if (!result || !hasCurves(result)) {
            console.warn("PathUnite: Result path is invalid.");
            return emptyPath;
        }
        return result;
    }
    catch (e) {
        console.warn("PathUnite: Path union failed.", e);
        return emptyPath;
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
};
/**
 * Computes the symmetric difference of two paths (boolean XOR operation)
 *
 * Returns a new path containing areas that are in either path but not in both.
 * This is equivalent to (A ∪ B) - (A ∩ B).
 *
 * @param pathA - First path
 * @param pathB - Second path
 * @returns Symmetric difference path, or empty path on error
 *
 * @example
 * ```typescript
 * const circle1 = Path.circle([100, 100], 50)
 * const circle2 = Path.circle([120, 100], 50)
 * const difference = PathExclude(circle1, circle2)
 * // Returns two crescent shapes
 * ```
 */
export const PathExclude = (pathA, pathB) => {
    // External library interface (pave.js) - return values are typed but ESLint sees them as any
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
    const emptyPath = createCircle([0, 0], 0);
    if (!pathA || !pathB) {
        console.warn("PathExclude: pathA or pathB is invalid.");
        return emptyPath;
    }
    const united = unitePaths([pathA, pathB]);
    if (!united || !hasCurves(united)) {
        console.warn("PathExclude: United path is invalid.");
        return emptyPath;
    }
    const intersected = PathIntersect(pathA, pathB);
    if (!intersected || !hasCurves(intersected)) {
        console.warn("PathExclude: Intersected path is invalid.");
        return emptyPath;
    }
    try {
        const excluded = subtractPaths(united, [intersected]);
        if (!excluded || !hasCurves(excluded)) {
            console.warn("PathExclude: Excluded path is invalid.");
            return emptyPath;
        }
        return excluded;
    }
    catch (e) {
        // Path.subtractでエラーが発生した場合（完全重複など）
        if (e instanceof TypeError && e.message.includes("Cannot read properties of undefined")) {
            console.warn("PathExclude: Intersection covers entire area. Returning empty path.");
            return emptyPath;
        }
        else {
            // 予期しないエラーの場合は再スローする
            throw e;
        }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
};
/**
 * Checks whether two paths overlap
 *
 * Uses PathIntersect to compute the intersection and checks if the result
 * has a non-zero area. This is more reliable than checking curve count changes,
 * which fails for cases like partially overlapping circles (where a crescent
 * shape still has the same curve count as the original circle).
 *
 * @param pathA - First path
 * @param pathB - Second path
 * @returns true if paths overlap, false otherwise
 *
 * @example
 * ```typescript
 * const circle = Path.circle([100, 100], 50)
 * const rect = Path.rect([75, 75], [125, 125])
 * if (isPathsOverlap(circle, rect)) {
 *   console.log('Paths overlap!')
 * }
 * ```
 */
export const isPathsOverlap = (pathA, pathB) => {
    // パスの有効性チェック
    if (!pathA || !pathB || !hasCurves(pathA) || !hasCurves(pathB)) {
        console.warn("isPathsOverlap: Invalid path provided");
        return false;
    }
    // PathIntersect を使って交差部分を計算
    const intersection = PathIntersect(pathA, pathB);
    // 交差部分が空かどうかをチェック
    if (!hasCurves(intersection) || intersection.curves.length === 0) {
        return false;
    }
    // 交差部分の bounds をチェックして、実質的に面積があるか確認
    // (半径0の円などの退化したケースを除外)
    try {
        const bounds = getPathBounds(intersection);
        const width = bounds[1][0] - bounds[0][0];
        const height = bounds[1][1] - bounds[0][1];
        // 面積が実質的に0より大きいかチェック (浮動小数点誤差を考慮)
        return width > 1e-10 && height > 1e-10;
    }
    catch (e) {
        // bounds 取得に失敗した場合は false を返す
        console.warn("isPathsOverlap: Failed to get bounds of intersection", e);
        return false;
    }
};
// ============================================
// PathOffset: Path offset using paperjs-offset
// ============================================
// Internal state for Paper.js initialization
let paperInitialized = false;
let paperCanvas = null;
/**
 * Initialize Paper.js if not already initialized
 */
function ensurePaperInitialized() {
    const paperInstance = getPaper();
    if (!paperInstance) {
        return false;
    }
    if (!paperInitialized) {
        paperCanvas = document.createElement('canvas');
        paperInstance.setup(paperCanvas);
        paperInitialized = true;
    }
    return true;
}
/**
 * Cleanup Paper.js resources to prevent memory leaks
 *
 * Should be called when PathOffset operations are no longer needed,
 * or periodically during long-running sessions.
 *
 * @example
 * ```typescript
 * // After completing path operations
 * cleanupPaperResources()
 * ```
 */
export function cleanupPaperResources() {
    const paperInstance = getPaper();
    if (paperInstance?.project) {
        paperInstance.project.clear();
    }
    // Explicitly release canvas memory by setting dimensions to 0
    // This helps the browser reclaim GPU/memory resources
    if (paperCanvas) {
        paperCanvas.width = 0;
        paperCanvas.height = 0;
        // Clear any 2D context to release associated resources
        const ctx = paperCanvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, 0, 0);
        }
        paperCanvas = null;
    }
    paperInitialized = false;
}
/**
 * Convert Pave.js path to Paper.js 0.12.4 path
 * @internal
 */
function paveToPaper(pavePath) {
    const paperInstance = getPaper();
    if (!paperInstance) {
        return null;
    }
    try {
        const PathGlobal = getPath();
        const pathData = PathGlobal.toSVGString(pavePath);
        if (!pathData) {
            console.warn('PathOffset: Empty path data');
            return null;
        }
        // Create a full SVG element for proper import
        const svgString = `<svg><path d="${pathData}"/></svg>`;
        // Use importSVG which properly initializes all path properties including curves
        const imported = paperInstance.project.importSVG(svgString);
        // Get the actual path from the imported group
        let resultPath = null;
        if (imported.children && imported.children.length > 0) {
            // SVG import creates a group, get the first path child
            const child = imported.children[0];
            if (child) {
                // Clone the path before removing the parent to preserve it
                resultPath = child.clone();
            }
        }
        else if (imported.firstChild) {
            resultPath = imported.firstChild.clone();
        }
        else {
            resultPath = imported;
        }
        // Remove the imported group from the project to avoid memory leaks
        // (the cloned path is now independent)
        imported.remove();
        return resultPath;
    }
    catch (e) {
        console.warn('PathOffset: Pave→Paper conversion failed', e);
        return null;
    }
}
/**
 * Convert Paper.js path to Pave.js path via segment iteration
 * This avoids SVG V/H commands that Pave.js doesn't support
 * @internal
 */
function paperToPave(paperPath) {
    const curves = [];
    // Handle CompoundPath (multiple children) or single Path
    const paths = paperPath.children ? paperPath.children : [paperPath];
    for (const path of paths) {
        const vertices = [];
        const segments = path.segments;
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            if (!seg)
                continue;
            const point = [seg.point.x, seg.point.y];
            if (i === 0) {
                vertices.push({ point, command: 'L' });
            }
            else {
                const prevSeg = segments[i - 1];
                if (!prevSeg)
                    continue;
                const hasHandles = !prevSeg.handleOut.isZero() || !seg.handleIn.isZero();
                if (hasHandles) {
                    const cp1 = [
                        prevSeg.point.x + prevSeg.handleOut.x,
                        prevSeg.point.y + prevSeg.handleOut.y
                    ];
                    const cp2 = [
                        seg.point.x + seg.handleIn.x,
                        seg.point.y + seg.handleIn.y
                    ];
                    vertices.push({ point, command: 'C', args: [cp1, cp2] });
                }
                else {
                    vertices.push({ point, command: 'L' });
                }
            }
        }
        // Handle closing segment for closed paths
        if (path.closed && segments.length > 0 && vertices.length > 0) {
            const lastSeg = segments[segments.length - 1];
            const firstSeg = segments[0];
            const firstVertex = vertices[0];
            if (lastSeg && firstSeg && firstVertex) {
                const hasHandles = !lastSeg.handleOut.isZero() || !firstSeg.handleIn.isZero();
                if (hasHandles) {
                    const cp1 = [
                        lastSeg.point.x + lastSeg.handleOut.x,
                        lastSeg.point.y + lastSeg.handleOut.y
                    ];
                    const cp2 = [
                        firstSeg.point.x + firstSeg.handleIn.x,
                        firstSeg.point.y + firstSeg.handleIn.y
                    ];
                    vertices[0] = { point: firstVertex.point, command: 'C', args: [cp1, cp2] };
                }
            }
        }
        curves.push({ vertices, closed: path.closed });
    }
    return { curves };
}
/**
 * Offset a path by a given distance using paperjs-offset
 *
 * This function works around Pave.js's Path.offset issue by:
 * 1. Converting Pave path to Paper.js 0.12.4 path
 * 2. Applying PaperOffset.offset
 * 3. Converting result back to Pave path
 *
 * IMPORTANT: Requires paper.js 0.12.4 and paperjs-offset 1.0.8 to be loaded:
 * ```html
 * <script type="importmap">
 * {
 *   "imports": {
 *     "paper": "https://cdn.jsdelivr.net/npm/paper@0.12.4/+esm",
 *     "paperjs-offset": "https://cdn.jsdelivr.net/npm/paperjs-offset@1.0.8/+esm"
 *   }
 * }
 * </script>
 * <script type="module">
 *   import paper from 'paper'
 *   import { PaperOffset } from 'paperjs-offset'
 *   window.paper = paper
 *   window.PaperOffset = PaperOffset
 * </script>
 * ```
 *
 * @param path - Pave.js path to offset
 * @param distance - Offset distance (positive = outward, negative = inward)
 * @param options - Optional settings for join and cap style
 * @returns Offset path, or original path if offset fails
 *
 * @example
 * ```typescript
 * const rect = Path.rect([100, 100], [300, 200])
 * const expanded = PathOffset(rect, 20) // 20px outward
 * const shrunk = PathOffset(rect, -10) // 10px inward
 * ```
 */
export const PathOffset = (path, distance, options) => {
    // Check if dependencies are available
    const paperInstance = getPaper();
    const paperOffsetInstance = getPaperOffset();
    if (!paperInstance) {
        console.warn('PathOffset: paper.js 0.12.4 is not loaded. Returning original path.');
        return path;
    }
    if (!paperOffsetInstance) {
        console.warn('PathOffset: paperjs-offset is not loaded. Returning original path.');
        return path;
    }
    // Ensure Paper.js is initialized
    if (!ensurePaperInitialized()) {
        console.warn('PathOffset: Failed to initialize Paper.js. Returning original path.');
        return path;
    }
    // Convert Pave path to Paper.js path
    const paperPath = paveToPaper(path);
    if (!paperPath) {
        console.warn('PathOffset: Failed to convert path. Returning original path.');
        return path;
    }
    try {
        // Apply offset using paperjs-offset
        const offsetted = paperOffsetInstance.offset(paperPath, distance, options);
        // Convert back to Pave path
        const result = paperToPave(offsetted);
        return result;
    }
    catch (e) {
        console.warn('PathOffset: Offset operation failed', e);
        return path;
    }
};
// ============================================
// PathRemoveHoles: Remove holes from a path
// ============================================
/**
 * Determines the winding direction of a single curve using the Shoelace formula
 *
 * In a coordinate system where Y-axis points down (like pave.js/p5.js):
 * - Positive signed area = Counter-clockwise (CCW) = hole
 * - Negative signed area = Clockwise (CW) = solid
 *
 * @param curve - Single curve from a Pave path
 * @returns Signed area (positive = CCW/hole, negative = CW/solid)
 * @internal
 */
function getCurveWindingDirection(curve) {
    let signedArea = 0;
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    /* eslint-disable @typescript-eslint/no-explicit-any */
    // Handle structured curve (with vertices property)
    if (curve && typeof curve === 'object' && 'vertices' in curve && Array.isArray(curve.vertices)) {
        const vertices = curve.vertices;
        for (let j = 0; j < vertices.length; j++) {
            const current = vertices[j];
            const next = vertices[(j + 1) % vertices.length];
            if (!current?.point || !next?.point)
                continue;
            const x1 = current.point[0];
            const y1 = current.point[1];
            const x2 = next.point[0];
            const y2 = next.point[1];
            signedArea += (x1 * y2 - x2 * y1);
        }
    }
    // Handle array format curve
    else if (Array.isArray(curve)) {
        for (let j = 0; j < curve.length; j++) {
            const segment = curve[j];
            const nextSegment = curve[(j + 1) % curve.length];
            let x1, y1;
            let x2, y2;
            if (Array.isArray(segment) && segment.length >= 2) {
                x1 = segment[0];
                y1 = segment[1];
            }
            else if (segment && typeof segment === 'object') {
                const seg = segment;
                x1 = seg.x ?? seg[0];
                y1 = seg.y ?? seg[1];
            }
            if (Array.isArray(nextSegment) && nextSegment.length >= 2) {
                x2 = nextSegment[0];
                y2 = nextSegment[1];
            }
            else if (nextSegment && typeof nextSegment === 'object') {
                const nextSeg = nextSegment;
                x2 = nextSeg.x ?? nextSeg[0];
                y2 = nextSeg.y ?? nextSeg[1];
            }
            if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
                signedArea += (x1 * y2 - x2 * y1);
            }
        }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
    /* eslint-enable @typescript-eslint/no-explicit-any */
    // Y軸が下向きの座標系では符号が逆になる
    return -(signedArea / 2);
}
/**
 * Remove all holes from a path, keeping only the outer contours
 *
 * This function analyzes the winding direction of each sub-path and removes
 * any that are detected as holes (counter-clockwise winding in a Y-down
 * coordinate system).
 *
 * Useful after PathOffset operations on text where you want to fill the
 * holes of letters like 'e', 'o', 'a', 'd', etc.
 *
 * @param path - Pave.js path (may be a compound path with holes)
 * @returns New path with only solid (outer) contours, or original path if no holes
 *
 * @example
 * ```typescript
 * const textPath = ot2pave(font.getPath('echo', 0, 100, 72).commands)
 * const offsetPath = PathOffset(textPath, 10)
 * const filledPath = PathRemoveHoles(offsetPath)
 * // 'e', 'c', 'o' の穴が埋められた太い文字パス
 * ```
 */
export const PathRemoveHoles = (path) => {
    const emptyPath = createCircle([0, 0], 0);
    // Validate input
    if (!path || !hasCurves(path) || path.curves.length === 0) {
        console.warn('PathRemoveHoles: Invalid path provided');
        return emptyPath;
    }
    // Single curve - no holes possible
    if (path.curves.length === 1) {
        return path;
    }
    // Log Pave.js curves info
    console.log(`PathRemoveHoles: Pave path has ${path.curves.length} curves`);
    for (let i = 0; i < Math.min(path.curves.length, 10); i++) {
        const curve = path.curves[i];
        const vertexCount = curve?.vertices?.length || 0;
        console.log(`  Pave curve ${i}: vertices=${vertexCount}, closed=${curve?.closed}`);
    }
    // Use Paper.js for accurate area calculation if available
    const paperInstance = getPaper();
    console.log('PathRemoveHoles: Paper.js available:', !!paperInstance, 'initialized:', paperInstance ? ensurePaperInitialized() : false);
    if (paperInstance && ensurePaperInitialized()) {
        return removeHolesWithPaper(path, emptyPath);
    }
    // Fallback: use Shoelace formula (less accurate for bezier curves)
    console.log('PathRemoveHoles: Using Shoelace fallback');
    return removeHolesWithShoelace(path, emptyPath);
};
/**
 * Recursively collect all Path children from a Paper.js item
 * This handles CompoundPath, Group, and nested structures
 * @internal
 */
function collectAllPaperPaths(item, paths, depth = 0) {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const itemAny = item;
    const indent = '  '.repeat(depth);
    console.log(`${indent}collectAllPaperPaths: className=${itemAny.className}, hasSegments=${!!itemAny.segments}, segmentCount=${itemAny.segments?.length || 0}, childCount=${itemAny.children?.length || 0}`);
    // Check if this is a Path (not CompoundPath)
    if (itemAny.className === 'Path' && itemAny.segments && itemAny.segments.length > 0) {
        paths.push(item);
        return;
    }
    // If it has children, recurse into them
    if (itemAny.children && itemAny.children.length > 0) {
        for (const child of itemAny.children) {
            collectAllPaperPaths(child, paths, depth + 1);
        }
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
}
/**
 * Convert Pave path to array of individual Paper.js paths
 * Uses Paper.js native parsing to properly separate all subpaths
 * @internal
 */
function paveToSeparatePaperPaths(pavePath) {
    const paperInstance = getPaper();
    if (!paperInstance) {
        return [];
    }
    try {
        const PathGlobal = getPath();
        const pathData = PathGlobal.toSVGString(pavePath);
        if (!pathData) {
            return [];
        }
        // Import SVG into Paper.js
        const svgString = `<svg><path d="${pathData}"/></svg>`;
        const imported = paperInstance.project.importSVG(svgString);
        // Collect all Path children recursively
        const paperPaths = [];
        collectAllPaperPaths(imported, paperPaths);
        console.log(`PathRemoveHoles: Paper.js found ${paperPaths.length} path children`);
        // Clone paths before removing the imported group
        const clonedPaths = [];
        for (const p of paperPaths) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            clonedPaths.push(p.clone());
        }
        // Remove the imported group
        imported.remove();
        return clonedPaths;
    }
    catch (e) {
        console.warn('PathRemoveHoles: Pave→Paper conversion failed', e);
        return [];
    }
}
/**
 * Remove holes using pure containment-based detection
 * A path is an outer contour if it's not fully contained by any other path
 * A path is a hole if it's contained within another path
 * @internal
 */
function removeHolesWithPaper(path, emptyPath) {
    const paperInstance = getPaper();
    if (!paperInstance) {
        return path;
    }
    // Convert Pave path to individual Paper.js paths
    const allPaths = paveToSeparatePaperPaths(path);
    console.log(`PathRemoveHoles: Found ${allPaths.length} individual paths`);
    if (allPaths.length <= 1) {
        // Cleanup and return original
        for (const p of allPaths)
            p.remove();
        return path;
    }
    /* eslint-disable @typescript-eslint/no-explicit-any */
    // Debug: show clockwise and area for each path
    for (let i = 0; i < allPaths.length; i++) {
        const p = allPaths[i];
        console.log(`  Path ${i}: clockwise=${p.clockwise}, area=${p.area?.toFixed(2)}`);
    }
    // SIMPLE STRATEGY: Remove ALL counter-clockwise paths as holes
    // clockwise=true → OUTER (keep)
    // clockwise=false → HOLE (remove)
    // Note: Gaps between paths (inter-row spaces) are NOT holes - they're just empty space
    const outerPaths = [];
    let ccwCount = 0;
    for (let i = 0; i < allPaths.length; i++) {
        const currentPath = allPaths[i];
        if (currentPath.clockwise) {
            outerPaths.push(allPaths[i]);
        }
        else {
            ccwCount++;
        }
    }
    console.log(`  Keeping ${outerPaths.length} CW paths, removing ${ccwCount} CCW paths`);
    /* eslint-enable @typescript-eslint/no-explicit-any */
    // If no outer paths found, return empty
    if (outerPaths.length === 0) {
        console.warn('PathRemoveHoles: No outer paths found');
        for (const p of allPaths)
            p.remove();
        return emptyPath;
    }
    // If all paths are outer, return original (no holes detected)
    if (outerPaths.length === allPaths.length) {
        console.log('PathRemoveHoles: No holes detected, returning original path');
        for (const p of allPaths)
            p.remove();
        return path;
    }
    console.log(`PathRemoveHoles: Removed ${allPaths.length - outerPaths.length} holes, kept ${outerPaths.length} paths`);
    // Build new CompoundPath with only outer paths
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CompoundPath = paperInstance.CompoundPath;
    const newCompound = new CompoundPath();
    for (const p of outerPaths) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cloned = p.clone();
        newCompound.addChild(cloned);
    }
    console.log(`PathRemoveHoles: Built CompoundPath with ${outerPaths.length} outer paths`);
    // Convert back to Pave
    const result = paperToPave(newCompound);
    // Log the result structure
    if (result && result.curves) {
        console.log(`PathRemoveHoles: Result has ${result.curves.length} curves`);
    }
    // Cleanup all paths
    for (const p of allPaths)
        p.remove();
    newCompound.remove();
    return result || emptyPath;
}
/**
 * Remove holes using Shoelace formula (fallback when Paper.js unavailable)
 * @internal
 */
function removeHolesWithShoelace(path, emptyPath) {
    const curves = path.curves;
    if (!curves) {
        return emptyPath;
    }
    // Calculate winding for all curves
    const curveInfo = [];
    for (let i = 0; i < curves.length; i++) {
        const curve = curves[i];
        if (!curve)
            continue;
        const winding = getCurveWindingDirection(curve);
        curveInfo.push({ index: i, winding, absWinding: Math.abs(winding) });
    }
    // Find the largest curve by absolute area
    const maxAbsWinding = Math.max(...curveInfo.map(c => c.absWinding));
    const largestCurve = curveInfo.find(c => c.absWinding === maxAbsWinding);
    if (!largestCurve) {
        return path;
    }
    const outerSign = largestCurve.winding >= 0 ? 1 : -1;
    // Filter: keep curves with the same sign as the outer contour
    const solidCurves = [];
    for (const info of curveInfo) {
        const curve = curves[info.index];
        if (!curve)
            continue;
        const sameSign = (info.winding >= 0) === (outerSign > 0) || info.winding === 0;
        if (sameSign) {
            solidCurves.push(curve);
        }
    }
    if (solidCurves.length === 0) {
        return emptyPath;
    }
    return { curves: solidCurves };
}
//# sourceMappingURL=pathfinder.js.map