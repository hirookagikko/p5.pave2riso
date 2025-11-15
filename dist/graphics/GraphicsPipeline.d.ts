/**
 * Graphics処理パイプライン
 *
 * pave2Risoの主要なGraphics処理を管理するクラス
 */
import type { Pave2RisoOptions } from '../types/core.js';
import type { PavePath } from '../types/pave.js';
import type { Vec2 } from '../types/linearly.js';
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
    getPosition(): Vec2;
    getSize(): Vec2;
    getBaseGraphics(): p5.Graphics;
    setBaseGraphics(g: p5.Graphics): void;
    /**
     * パスをCanvasに描画（Pave.js APIのラッパー）
     */
    drawPathToCanvas(path: PavePath, context: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=GraphicsPipeline.d.ts.map