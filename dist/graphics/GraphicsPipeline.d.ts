/**
 * Graphics処理パイプライン
 *
 * pave2Risoの主要なGraphics処理を管理するクラス
 */
import type { Pave2RisoOptions, PavePath } from '../types/core.js';
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly/+esm';
/**
 * GraphicsPipelineクラス
 *
 * Graphics生成、クリッピング、モード適用、クリーンアップを管理
 */
export declare class GraphicsPipeline {
    private readonly options;
    private readonly graphicsToCleanup;
    private readonly pathBounds;
    private readonly gPos;
    private readonly gSize;
    private baseG;
    constructor(options: Pave2RisoOptions);
    /**
     * 新しいGraphicsオブジェクトを作成し、クリーンアップリストに追加
     *
     * @param width - 幅
     * @param height - 高さ
     * @returns 新しいGraphicsオブジェクト
     */
    createGraphics(width: number, height: number): p5.Graphics;
    /**
     * クリッピングパスを設定
     */
    setupClipping(): void;
    /**
     * クリッピングパスを解除
     */
    releaseClipping(): void;
    /**
     * 全てのGraphicsリソースをクリーンアップ
     */
    cleanup(): void;
    /**
     * ゲッター
     */
    getOptions(): Pave2RisoOptions;
    getPathBounds(): [[number, number], [number, number]];
    getPosition(): ReturnType<typeof vec2.of>;
    getSize(): ReturnType<typeof vec2.of>;
    getBaseGraphics(): p5.Graphics;
    setBaseGraphics(g: p5.Graphics): void;
    /**
     * パスをCanvasに描画（Pave.js APIのラッパー）
     */
    drawPathToCanvas(path: PavePath, context: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=GraphicsPipeline.d.ts.map