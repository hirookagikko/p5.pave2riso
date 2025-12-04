/**
 * コア型定義
 */
import type { FillConfig } from './fill.js';
import type { StrokeConfig } from './stroke.js';
import type { FilterConfig, HalftoneConfig, DitherConfig } from './effects.js';
import type { PavePath } from './pave.js';
export type { PavePath };
/**
 * レンダリングモード
 */
export type RenderMode = 'overprint' | 'cutout' | 'join';
/**
 * Pave.js curve vertex (structured format)
 * Represents a point on a path with command and optional bezier handles
 */
export interface PaveCurveVertex {
    /** 頂点座標 [x, y] */
    point: [number, number];
    /** コマンドタイプ: L=直線, C=ベジェ曲線, M=移動, Z=閉じる */
    command: 'L' | 'C' | 'M' | 'Z';
    /** ベジェ曲線の制御点 [[cp1x, cp1y], [cp2x, cp2y]]（commandが'C'の場合のみ） */
    args?: [[number, number], [number, number]];
}
/**
 * Pave.js legacy vertex (x/y object format)
 * Used in some legacy Pave.js operations
 */
export interface PaveCurveVertexXY {
    /** X座標 */
    x: number;
    /** Y座標 */
    y: number;
}
/**
 * Pave.js curve point (simple array format)
 * Basic [x, y] coordinate
 */
export type PaveCurvePoint = [number, number];
/**
 * Pave.js curve element
 * Can be any of the supported vertex formats
 */
export type PaveCurveElement = PaveCurveVertex | PaveCurveVertexXY | PaveCurvePoint;
/**
 * Pave.js curve segment (structured format with vertices array)
 * A single curve within a path, containing vertices and closed state
 */
export interface PaveCurveSegment {
    /** 頂点の配列 */
    vertices: PaveCurveVertex[];
    /** パスが閉じているかどうか */
    closed: boolean;
}
/**
 * Pave.js curve type
 * Can be a structured segment or an array of curve elements
 */
export type PaveCurve = PaveCurveSegment | PaveCurveElement[];
/**
 * Type guard to check if a value has curves property
 */
export declare function hasCurves(path: unknown): path is {
    curves: PaveCurve[];
};
/**
 * pave2Riso関数のオプション
 */
export interface Pave2RisoOptions {
    /**
     * Pave pathオブジェクト
     */
    path: PavePath;
    /**
     * Stroke設定（nullの場合はストロークなし）
     */
    stroke: StrokeConfig | null;
    /**
     * Fill設定（nullの場合は塗りつぶしなし）
     */
    fill: FillConfig | null;
    /**
     * レンダリングモード
     */
    mode: RenderMode;
    /**
     * キャンバスサイズ [width, height]
     */
    canvasSize: [number, number];
    /**
     * Risographチャンネル（p5.Graphicsオブジェクトの配列）
     */
    channels: p5.Graphics[];
    /**
     * フィルター設定（配列または単一のフィルター）
     */
    filter?: FilterConfig | FilterConfig[] | null;
    /**
     * ハーフトーン設定
     */
    halftone?: HalftoneConfig | null;
    /**
     * ディザー設定
     */
    dither?: DitherConfig | null;
    /**
     * クリッピングパス（オプション）
     */
    clippingPath?: PavePath | null;
}
//# sourceMappingURL=core.d.ts.map