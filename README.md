# p5.pave2riso

Pave.jsで作成したベクターパスをp5.riso.jsのリソグラフ印刷チャンネルに変換するp5.js用のライブラリです。p5.pattern.jsによるパターン描画にも対応しています。

## 依存関係

このライブラリは以下に依存しています：

- **[p5.js](https://p5js.org/)** - クリエイティブコーディングのためのJavaScriptライブラリ
- **[Pave.js](https://github.com/baku89/pave)** (MIT) by Baku Hashimoto - ベクターパス操作
- **[Linearly](https://github.com/baku89/linearly)** (MIT) by Baku Hashimoto - ベクター演算（Pave.jsの依存関係）
- **[p5.riso.js](https://github.com/antiboredom/p5.riso)** (ANTI-CAPITALIST) by Sam Lavigne and Tega Brain - Risograph印刷シミュレーション
- **[p5.pattern.js](https://github.com/SYM380/p5.pattern)** (MIT) by Taichi Sayama - パターン描画（オプション）

## 主な特徴

### 1. リソグラフの印刷モード
- **overprint**: インクを重ねて印刷（デフォルト）
  - 全チャンネルで塗りとストロークが重なる

- **cutout**: パス領域を削除してから印刷
  - ソリッドな形状で全チャンネルからパス領域を削除
  - その後、指定チャンネルに塗り/ストロークを適用

- **join**: パス領域を塗りの濃度・パターンに応じて削除してから印刷
  - **ソリッド塗り**: 完全に削除（cutoutと同じ挙動）
  - **パターン塗り**: パターンの模様（濃淡）に応じて削除
  - **グラデーション塗り**: グラデーションの濃度に応じて削除
  - **画像塗り**: 画像の濃度に応じて削除

### 2. 多様な塗りタイプ
- **ソリッド**: チャンネルごとのインク濃度（0-100%）で塗りつぶし
- **パターン**: p5.patternライブラリを使用したパターン塗り
- **グラデーション**: 線形・放射・円錐グラデーション
- **画像**: 画像を塗りとして使用（位置調整、スケール、回転対応）

### 3. 多様なストロークタイプ
- **ソリッド**: 単色の線
- **破線**: カスタマイズ可能な破線パターン
- **パターン**: パターンで描く線
- **グラデーション**: グラデーションで描く線

### 4. エフェクト対応
- **フィルター**: 画像処理フィルター適用
- **ハーフトーン**: 網点表現
- **ディザリング**: ディザパターンによる階調表現

## アーキテクチャ

### 処理フロー

1. **バリデーション**: 必須パラメータ（path, canvasSize, channels, mode）をチェック
2. **GraphicsPipelineの初期化**: p5.Graphicsオブジェクトの管理と準備
3. **クリッピングパスの適用**: オプションのクリッピングパスを設定
4. **印刷モードの適用**: overprint/cutout/joinモードに応じた前処理
5. **塗りの描画**: 設定に応じて適切な塗りレンダラーを実行
6. **ストロークの描画**: 設定に応じて適切なストロークレンダラーを実行
7. **クリッピングの解除**: クリッピングパスを解放
8. **クリーンアップ**: 一時的なグラフィックスリソースを破棄

### 主要コンポーネント

```
src/
├── core.ts                    # pave2Riso()メイン関数
├── graphics/
│   └── GraphicsPipeline.ts   # グラフィックス処理の中心
├── modes/
│   └── modes.ts              # 印刷モード処理
├── renderers/
│   ├── fills/                # 塗りレンダラー
│   │   ├── solid.ts
│   │   ├── pattern.ts
│   │   ├── gradient.ts
│   │   └── image.ts
│   └── strokes/              # ストロークレンダラー
│       ├── solid.ts
│       ├── dashed.ts
│       ├── pattern.ts
│       └── gradient.ts
├── channels/
│   └── operations.ts         # エフェクト処理
├── types/                    # 型定義
├── utils/                    # ユーティリティ
└── validation/               # バリデーション
```

**主な役割**:
- **pave2Riso()**: 全体の処理を統括
- **GraphicsPipeline**: p5.Graphicsオブジェクトの作成・管理、Paveパスの描画、クリッピング処理
- **モード処理**: 印刷モードごとの描画前処理
- **レンダラー**: 塗りタイプ別・ストロークタイプ別の描画実装
- **エフェクト処理**: フィルター、ハーフトーン、ディザリングの適用

### 型安全な設計

- **塗りとストロークの設定**: `type`フィールドで種類を指定すると、それに応じた設定項目が自動的に決まる（TypeScriptのDiscriminated Unions）
- **インク濃度**: 0-100%の範囲でチェックされ、型安全に管理される（Branded Types）

## インストール

### ローカルビルド

```bash
# リポジトリをクローン
git clone https://github.com/hirookagikko/p5.pave2riso.git
cd p5.pave2riso

# 依存関係をインストール
npm install

# ビルド
npm run build
```

ビルド後、`dist/p5.pave2riso.js`を使用します。

### GitHubから直接読み込み

```html
<script src="https://cdn.jsdelivr.net/gh/hirookagikko/p5.pave2riso@main/dist/p5.pave2riso.js"></script>
```

### HTMLテンプレート

※p5.riso.jsはダウンロードして任意の場所に配置

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>html sample</title>
  <script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.js"></script>
  <script src="../libraries/p5.riso.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/SYM380/p5.pattern@master/p5.pattern.min.js"></script>
</head>
<body style="padding: 0; margin: 0; zoom: 0.5;">
  <main></main>
  <button id="export-btn" type="button" style="position:fixed; top:12px; right:12px; z-index:1000;">Export</button>
  <script type="module" src="sample.js"></script>
</body>
</html>
```

## 使用例

### 基本的な使い方

```javascript
// ESモジュールとしてpave, linearlyをインポート
import { Path, Distort } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { mat2d, vec2 } from 'https://cdn.jsdelivr.net/npm/linearly/+esm'
// pave2Risoをインポート
import { pave2Riso } from '../dist/p5.pave2riso.js'
```

### ソリッド塗り

サンプルコード：[samples/sample.html](samples/sample.html) / [samples/sample.js](samples/sample.js) | **[デモを見る](https://hirookagikko.github.io/p5.pave2riso/)**

6つの円を使って、異なるチャンネルの組み合わせをデモンストレーション。

### パターン塗り

（準備中）

### グラデーション塗り

（準備中）

### 画像塗り

（準備中）

### ストローク

（準備中）

### 印刷モード

（準備中）

### エフェクト

（準備中）

## License

MIT License - see LICENSE file

**Important**: This library depends on p5.riso.js at runtime, which uses the ANTI-CAPITALIST SOFTWARE LICENSE.
