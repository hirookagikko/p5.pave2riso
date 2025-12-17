# p5.pave2riso ドキュメント

## これは何？

p5.pave2risoは、[Pave.js](https://baku89.com/Dec_9%EF%BC%8C_2024%EF%BC%9A_Pave.js)で作成したベクターパスを、[p5.riso.js](https://antiboredom.github.io/p5.riso/)の**複数のRisographチャンネルに一括展開**するためのTypeScriptライブラリです。

### なぜ必要？

リソグラフ印刷では、**色ごとに別々の「版」**を作ります。赤・青・黄の3色で印刷するなら、3枚の版が必要です。

p5.riso.jsでこれを再現するには、1つの図形を描くにも各チャンネルに個別に描画コードを書く必要があります：

```javascript
// 普通にやると...3色分のコードを書く必要がある 😫
channel1.fill(255 * 1.0)  // 赤: 100%
channel1.ellipse(x, y, r)

channel2.fill(255 * 0.5)  // 青: 50%
channel2.ellipse(x, y, r)

channel3.fill(255 * 0)    // 黄: 0%
channel3.ellipse(x, y, r)
```

p5.pave2risoなら、これが**1回の呼び出しで済みます**：

```javascript
// p5.pave2risoなら...1回でOK！ 🎉
pave2Riso({
  path: Path.circle([x, y], r),
  fill: { type: 'solid', channelVals: [100, 50, 0] },  // 赤100%, 青50%, 黄0%
  ...
})
```

`channelVals`で各チャンネルへのインク濃度（0-100%）を指定するだけで、**パスが自動的に複数の版に展開**されます。これがこのライブラリの肝です 🖨️

### 対象読者

- p5.jsでクリエイティブコーディングをしている人
- リソグラフ印刷に興味がある人
- p5.riso.jsを使っている/使いたい人

---

## ドキュメント目次

### 入門

- [はじめに](getting-started.md) - セットアップと最初の一歩

### リファレンス

- [API リファレンス](api-reference.md) - 関数・型の一覧
- [Fill の種類](fill-types.md) - 塗りつぶしの設定方法
- [Stroke の種類](stroke-types.md) - 線の設定方法
- [エフェクト](effects.md) - Filter / Halftone / Dither
- [モード](modes.md) - overprint / cutout / join
- [ユーティリティ](utilities.md) - パス操作・フォント変換など

---

## クイックリファレンス

### 基本的な使い方

```javascript
// Pave.jsでパスを作成
const myPath = Path.circle([400, 300], 100)

// p5.pave2risoで描画
pave2Riso({
  path: myPath,
  fill: { type: 'solid', channelVals: [100, 0, 0] },
  stroke: null,
  mode: 'overprint',
  canvasSize: [800, 600],
  channels: [channel1, channel2, channel3]
})
```

### Fill の種類

| タイプ | 説明 |
|--------|------|
| `solid` | ベタ塗り |
| `pattern` | パターン（p5.pattern使用） |
| `gradient` | グラデーション |
| `image` | 画像 |

### Stroke の種類

| タイプ | 説明 |
|--------|------|
| `solid` | ベタ線 |
| `dashed` | 破線 |
| `pattern` | パターン線 |
| `gradient` | グラデーション線 |

### モード

| モード | 説明 |
|--------|------|
| `overprint` | 重ね刷り（デフォルト） |
| `cutout` | 下のレイヤーを切り抜く |
| `join` | 同じFill/Stroke内で重なりを削除 |

---

## 必要なライブラリ

p5.pave2risoを使うには、以下のライブラリが必要です：

### 必須

- [p5.js](https://p5js.org/)
- [p5.riso.js](https://antiboredom.github.io/p5.riso/)
- [Pave.js](https://github.com/baku89/pave) + [linearly](https://github.com/baku89/linearly)

### オプション

- [p5.pattern](https://github.com/SYM380/p5.pattern) - パターンFill/Stroke用
- [Paper.js](http://paperjs.org/) + [paperjs-offset](https://github.com/nicholaswmin/paperjs-offset) - PathOffset機能用
