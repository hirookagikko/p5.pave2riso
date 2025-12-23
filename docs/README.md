# p5.pave2riso

## 概要

p5.pave2risoは、[Pave.js](https://baku89.com/Dec_9%EF%BC%8C_2024%EF%BC%9A_Pave.js)で作成したベクターパスを、[p5.riso.js](https://antiboredom.github.io/p5.riso/)の複数のリソグラフチャンネルに一括展開するためのp5.jsライブラリです。

### 対象読者

- p5.jsでクリエイティブコーディングをしている人
- リソグラフ印刷に興味がある人
- p5.riso.jsを使っている/使いたい人

### 何がうれしいか

リソグラフ印刷では、色ごとに「版」を作ります。たとえば赤・青・黄の3色で印刷する場合は3枚の版を用意します。色を混ぜるには、同じ図形をそれぞれの版に描画する必要があります。
p5.riso.jsでこれを再現するには、各チャンネルに個別に描画コードを書く必要があります。

```javascript
// チャンネルの数だけ図形を描画
channel1.fill(255 * 1.0)  // 赤: 100%
channel1.ellipse(x, y, r)

channel2.fill(255 * 0.5)  // 青: 50%
channel2.ellipse(x, y, r)

channel3.fill(255 * 0)    // 黄: 0%
channel3.ellipse(x, y, r)
```

p5.pave2risoでは、これを1回の呼び出しで済むようにしました。

```javascript
// パスを各チャンネルに一括展開
pave2Riso({
  path: Path.circle([x, y], r),
  fill: {
    type: 'solid',
    channelVals: [100, 50, 0] // 赤100%, 青50%, 黄0%
  },
  ...
})
```

「...」で省略しましたが、パスの塗りと線に対してそれぞれベタ・パターン・グラデーションを指定し、フィルタをかけ、ハーフトーンやディザ加工を加えて一括展開できます。
なお、塗りには画像を指定でき、線には点線を指定できます。

---

## もくじ

### 入門

- [はじめに](getting-started.md) - セットアップと最初の一歩

### リファレンス

- [Fill の種類](fill-types.md) - 塗りつぶしの設定方法
- [Stroke の種類](stroke-types.md) - 線の設定方法
- [エフェクト](effects.md) - Filter / Halftone / Dither
- [モード](modes.md) - overprint / cutout / join
- [ユーティリティ](utilities.md) - パス操作・フォント変換など
- APIリファレンス（準備中） - 関数・型の一覧

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
| `cutout` | パス形状で重なりを削除 |
| `join` | Fill/Stroke設定に応じて重なりを削除 |

---

## 必要なライブラリ

p5.pave2risoを使うには、以下のライブラリが必要です：

### 必須

- [p5.js](https://p5js.org/)
- [Pave.js](https://github.com/baku89/pave) + [linearly](https://github.com/baku89/linearly)
- [p5.riso.js](https://antiboredom.github.io/p5.riso/)

### オプション

- [p5.pattern](https://github.com/SYM380/p5.pattern) - パターンFill/Stroke用
- [Paper.js](http://paperjs.org/) + [paperjs-offset](https://github.com/luz-alphacode/paperjs-offset) - パスのオフセット機能用