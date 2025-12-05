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
 *
 * リソース管理:
 * - cleanup()メソッドで全てのGraphicsリソースを解放
 * - try-finallyパターンで使用することを推奨
 * - cleanup()は冪等（複数回呼び出しても安全）
 * - cleanup()後のcreateGraphics()呼び出しはエラー
 *
 * NOTE: ES2023+ Symbol.dispose support planned for future TypeScript upgrade
 */
export declare class GraphicsPipeline {
    private readonly options;
    private graphicsToCleanup;
    private readonly pathBounds;
    private readonly gPos;
    private readonly gSize;
    private baseG;
    private disposed;
    constructor(options: Pave2RisoOptions);
    /**
     * 新しいGraphicsオブジェクトを作成し、クリーンアップリストに追加
     *
     * @param width - 幅
     * @param height - 高さ
     * @returns 新しいGraphicsオブジェクト
     * @throws {Error} cleanup()後に呼び出された場合
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
     *
     * 複数回呼び出しても安全（冪等）
     * cleanup()後のcreateGraphics()呼び出しはエラーになる
     */
    cleanup(): void;
    /**
     * パイプラインが破棄済みかどうかを確認
     */
    isDisposed(): boolean;
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