/**
 * Graphics処理パイプライン
 *
 * pave2Risoの主要なGraphics処理を管理するクラス
 */
import { getPathBounds, drawPathToCanvas } from '../utils/pave-wrapper.js';
import { createVec2 } from '../utils/vec2-wrapper.js';
/**
 * GraphicsPipelineクラス
 *
 * Graphics生成、クリッピング、モード適用、クリーンアップを管理
 */
export class GraphicsPipeline {
    constructor(options) {
        this.graphicsToCleanup = [];
        this.options = options;
        // Pave.jsのPath.bounds()を使用してパスの境界を取得
        this.pathBounds = getPathBounds(options.path);
        // vec2を使用して位置とサイズを計算（整数化してp5.jsのcopy()エラーを防止）
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        this.gPos = createVec2(Math.floor(this.pathBounds[0][0]), Math.floor(this.pathBounds[0][1]));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        this.gSize = createVec2(Math.ceil(this.pathBounds[1][0] - this.pathBounds[0][0]), Math.ceil(this.pathBounds[1][1] - this.pathBounds[0][1]));
        // ベースGraphicsの作成
        this.baseG = createGraphics(options.canvasSize[0], options.canvasSize[1]);
        this.baseG.pixelDensity(1);
        this.graphicsToCleanup.push(this.baseG);
        this.baseG.background(255);
    }
    /**
     * 新しいGraphicsオブジェクトを作成し、クリーンアップリストに追加
     *
     * @param width - 幅
     * @param height - 高さ
     * @returns 新しいGraphicsオブジェクト
     */
    createGraphics(width, height) {
        const g = createGraphics(width, height);
        g.pixelDensity(1);
        this.graphicsToCleanup.push(g);
        return g;
    }
    /**
     * クリッピングパスを設定
     */
    setupClipping() {
        const { clippingPath, channels } = this.options;
        if (clippingPath) {
            channels.forEach((channel) => {
                channel.push();
                drawPathToCanvas(clippingPath, channel.drawingContext);
                channel.drawingContext.clip();
            });
        }
    }
    /**
     * クリッピングパスを解除
     */
    releaseClipping() {
        const { clippingPath, channels } = this.options;
        if (clippingPath) {
            channels.forEach((channel) => {
                channel.pop();
            });
        }
    }
    /**
     * 全てのGraphicsリソースをクリーンアップ
     */
    cleanup() {
        this.graphicsToCleanup.forEach((g) => {
            if (g && typeof g.remove === 'function') {
                g.remove();
            }
        });
    }
    /**
     * ゲッター
     */
    getOptions() {
        return this.options;
    }
    getPathBounds() {
        return this.pathBounds;
    }
    getPosition() {
        return this.gPos;
    }
    getSize() {
        return this.gSize;
    }
    getBaseGraphics() {
        return this.baseG;
    }
    setBaseGraphics(g) {
        this.baseG = g;
    }
    /**
     * パスをCanvasに描画（Pave.js APIのラッパー）
     */
    drawPathToCanvas(path, context) {
        drawPathToCanvas(path, context);
    }
}
//# sourceMappingURL=GraphicsPipeline.js.map