# はじめに

このページでは、p5.pave2risoのセットアップから最初の描画までを説明します。

---

## 前提知識

### Pave.jsについて

p5.pave2risoを使うには、まず[Pave.js](https://github.com/baku89/pave)でパスを作る必要があります。

Pave.jsは、ベクターパスをデータとして扱えるようにするライブラリです。p5.jsの`ellipse()`や`rect()`とは違って、パスを「オブジェクト」として持ち回せるので、後から変形したり、他のパスと合成したりできます。

Pave.jsについての詳しい解説は、作者のbaku89さんによる記事をご覧ください：
→ [Pave.js - baku89.com](https://baku89.com/Dec_9%EF%BC%8C_2024%EF%BC%9A_Pave.js)

### p5.riso.jsについて

[p5.riso.js](https://antiboredom.github.io/p5.riso/)は、p5.jsでRisograph風の表現を作るためのライブラリです。複数の「チャンネル」（色版）を重ねて印刷するリソグラフの仕組みを再現しています。

---

## セットアップ

### HTMLファイルの準備

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My p5.pave2riso Sketch</title>

  <!-- p5.js -->
  <script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.js"></script>

  <!-- p5.riso.js -->
  <script src="https://cdn.jsdelivr.net/gh/antiboredom/p5.riso@master/lib/p5.riso.js"></script>

  <!-- p5.pattern.js（パターン塗りを使う場合） -->
  <script src="https://cdn.jsdelivr.net/gh/SYM380/p5.pattern@master/p5.pattern.min.js"></script>
</head>
<body>
  <!-- ES Modulesとして読み込む -->
  <script type="module" src="sketch.js"></script>
</body>
</html>
```

### JavaScriptファイル（ES Modules）

Pave.jsとlinearlyはES ModulesとしてCDNから直接インポートします。p5.pave2risoは依存性注入（DI）パターンで初期化します：

```javascript
// sketch.js

// 1. ライブラリをESモジュールとしてインポート
import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from './dist/p5.pave2riso.js'

// 2. 依存性注入でp2rファクトリを作成（グローバル変数不要！）
const { p2r } = createP5Pave2Riso({ Path, vec2 })

let channels = []
let render

window.setup = () => {
  createCanvas(800, 600)
  pixelDensity(1)

  // 3. Risographチャンネルを作成
  channels = [
    new Riso('red'),
    new Riso('blue'),
    new Riso('yellow')
  ]

  // 4. p2rファクトリにチャンネルとキャンバスサイズをバインド
  render = p2r({
    channels,
    canvasSize: [width, height]
  })

  noLoop()
}

window.draw = () => {
  background(255)
  channels.forEach(ch => ch.clear())

  // 5. パスを作成
  const circlePath = Path.circle([width / 2, height / 2], 100)

  // 6. render()で描画
  render({
    path: circlePath,
    fill: {
      type: 'solid',
      channelVals: [100, 50, 0]  // 赤100%, 青50%, 黄0%
    },
    stroke: null,
    mode: 'overprint'
  })

  // 7. チャンネルを合成して表示
  drawRiso()
}
```

---

## 依存性注入（DI）パターンについて

p5.pave2risoでは、`createP5Pave2Riso()`を使った依存性注入パターンを推奨しています。

```javascript
// PathとVec2を明示的に渡す
const { p2r } = createP5Pave2Riso({ Path, vec2 })
```

**メリット：**
- グローバル変数（`window.Path`など）を汚染しない
- どのライブラリに依存しているか明確
- テストしやすい
- ES Modulesと相性が良い

---

## channelValsを理解する

ここが**p5.pave2risoの核心**です

### リソグラフ印刷の仕組み

リソグラフは「孔版印刷」の一種で、色ごとに別々の「版」を作って重ね刷りします。

```
赤の版  +  青の版  +  黄の版  =  最終的な印刷物
```

つまり、1つの図形を印刷するにも、使う色の数だけ版にデータを分ける必要があります。

### channelValsで版に展開する

`channelVals`は、**各チャンネル（版）にどれだけインクを乗せるか**を0-100%で指定する配列です。

```javascript
channelVals: [100, 50, 0]
//            ↑    ↑   ↑
//            赤   青  黄
//           100%  50%  0%
```

この例だと：
- 赤の版には **100%** のインク（べったり）
- 青の版には **50%** のインク（薄め）
- 黄の版には **0%** のインク（何も刷らない）

重ね刷りすると、赤が強くて少し青みがかった紫っぽい色になります。

### なぜこれが便利？

p5.riso.jsを直接使う場合、同じ図形を各チャンネルに個別に描画する必要があります：

```javascript
// 普通のp5.riso.js（チャンネルごとに書く）
channel1.fill(createInkDepth(100))
channel1.beginShape()
// ...頂点を列挙...
channel1.endShape(CLOSE)

channel2.fill(createInkDepth(50))
channel2.beginShape()
// ...同じ頂点を列挙...
channel2.endShape(CLOSE)

// channel3も同様に...
```

p5.pave2risoなら、**1回の呼び出しで全チャンネルに展開**されます：

```javascript
// p5.pave2riso（1回で済む！）
render({
  path: myPath,
  fill: { type: 'solid', channelVals: [100, 50, 0] },
  stroke: null,
  mode: 'overprint'
})
```

図形が複雑になればなるほど、この差は大きくなります。Pave.jsのパスをそのまま渡せばOKなので、パス操作と版展開がシームレスにつながります。

---

## 次のステップ

- [Fill の種類](fill-types.md) - いろんな塗りつぶし方法を試す
- [Stroke の種類](stroke-types.md) - 線を描く
- [モード](modes.md) - 重ね方を変える

---

## 補足：pave2Riso()を直接使う場合

`p2r()`ファクトリを使わず、`pave2Riso()`関数を直接呼ぶこともできます：

```javascript
import { pave2Riso } from './dist/p5.pave2riso.js'

// 毎回すべてのオプションを指定
pave2Riso({
  path: circlePath,
  fill: {
    type: 'solid',
    channelVals: [100, 50, 0]
  },
  stroke: null,
  mode: 'overprint',
  canvasSize: [width, height],
  channels: [channel1, channel2, channel3]
})
```

ただし、`p2r()`ファクトリを使う方が、共通オプションを一度だけ設定すればよいので便利です。

詳しくは[ユーティリティ](utilities.md)を参照してください。
