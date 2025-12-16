/**
 * Core type definitions
 */
import type { FillConfig } from './fill.js';
import type { StrokeConfig } from './stroke.js';
import type { FilterConfig, HalftoneConfig, DitherConfig } from './effects.js';
import type { PavePath } from './pave.js';
export type { PavePath };
/**
 * Rendering mode
 */
export type RenderMode = 'overprint' | 'cutout' | 'join';
/**
 * Pave.js curve vertex (structured format)
 * Represents a point on a path with command and optional bezier handles
 */
export interface PaveCurveVertex {
    /** Vertex coordinates [x, y] */
    point: [number, number];
    /** Command type: L=line, C=bezier curve, M=move, Z=close */
    command: 'L' | 'C' | 'M' | 'Z';
    /** Bezier curve control points [[cp1x, cp1y], [cp2x, cp2y]] (only when command is 'C') */
    args?: [[number, number], [number, number]];
}
/**
 * Pave.js legacy vertex (x/y object format)
 * Used in some legacy Pave.js operations
 */
export interface PaveCurveVertexXY {
    /** X coordinate */
    x: number;
    /** Y coordinate */
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
    /** Array of vertices */
    vertices: PaveCurveVertex[];
    /** Whether the path is closed */
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
 * Options for pave2Riso function
 */
export interface Pave2RisoOptions {
    /**
     * Pave path object
     */
    path: PavePath;
    /**
     * Stroke configuration (null for no stroke)
     */
    stroke: StrokeConfig | null;
    /**
     * Fill configuration (null for no fill)
     */
    fill: FillConfig | null;
    /**
     * Rendering mode
     */
    mode: RenderMode;
    /**
     * Canvas size [width, height]
     */
    canvasSize: [number, number];
    /**
     * Risograph channels (array of p5.Graphics objects)
     */
    channels: p5.Graphics[];
    /**
     * Filter configuration (array or single filter)
     */
    filter?: FilterConfig | FilterConfig[] | null;
    /**
     * Halftone configuration
     */
    halftone?: HalftoneConfig | null;
    /**
     * Dither configuration
     */
    dither?: DitherConfig | null;
    /**
     * Clipping path (optional)
     */
    clippingPath?: PavePath | null;
}
//# sourceMappingURL=core.d.ts.map