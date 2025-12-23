# ユーティリティ

p5.pave2risoが提供する便利関数です。

---

## パス操作関数

Pave.jsのパス同士を組み合わせたり、変形したりする関数です。

### PathIntersect（交差）

2つのパスの重なっている部分（AND）を取得します。

```javascript
const pathA = Path.circle([200, 200], 100)
const pathB = Path.circle([250, 200], 100)

// 2つの円の重なり部分
const intersection = PathIntersect(pathA, pathB)
```

### PathSubtract（差分）

pathAからpathBを引いた部分を取得します。Pave.jsのPath.subtractをそのまま使っています。

```javascript
const pathA = Path.circle([200, 200], 100)
const pathB = Path.circle([250, 200], 50)

// 大きい円から小さい円を引いた三日月形
const crescent = PathSubtract(pathA, pathB)
```

### PathExclude（排他）

2つのパスのXOR（どちらか一方だけにある部分）を取得します。

```javascript
const pathA = Path.circle([200, 200], 100)
const pathB = Path.circle([250, 200], 100)

// 重なっていない部分だけ残る
const excluded = PathExclude(pathA, pathB)
```

### PathUnite（結合）

2つのパスを結合します。Pave.jsのPath.uniteをそのまま使っています。

```javascript
const pathA = Path.circle([200, 200], 100)
const pathB = Path.circle([250, 200], 100)

// 2つの円を1つのパスに結合
const united = PathUnite(pathA, pathB)
```

### PathOffset（オフセット）

パスを太らせたり細らせたりします。この関数を使うには、Paper.jsとpaperjs-offsetが必要です（後述）。

```javascript
const path = Path.circle([200, 200], 100)

// 10px太らせる
const expanded = PathOffset(path, 10)

// 10px細らせる
const shrunk = PathOffset(path, -10)
```

### isPathsOverlap（重複判定）

2つのパスが重なっているかどうかを判定します。

```javascript
const pathA = Path.circle([200, 200], 100)
const pathB = Path.circle([500, 200], 100)

if (isPathsOverlap(pathA, pathB)) {
  console.log('重なっています')
} else {
  console.log('離れています')
}
```

---

## フォント変換

### ot2pave

> [動作サンプルを見る](https://hirookagikko.github.io/p5.pave2riso/examples/text-paths.html)

OpenType.jsのパスコマンドをPave.jsのパスに変換し、テキストをパスとして扱えます。

```javascript
// OpenType.jsでフォントを読み込み
let font
function preload() {
  opentype.load('myfont.otf', (err, loadedFont) => {
    font = loadedFont
  })
}

function draw() {
  // テキストをパスに変換
  const otPath = font.getPath('Hello', 100, 200, 72)

  // Pave.jsパスに変換
  const textPath = ot2pave(otPath.commands)

  // p5.pave2risoで描画
  pave2Riso({
    path: textPath,
    fill: { type: 'solid', channelVals: [100, 0, 0] },
    mode: 'overprint',
    canvasSize: [width, height],
    channels: [ch1, ch2, ch3]
  })
}
```

### オプション

```javascript
// スケールを指定
const textPath = ot2pave(otPath.commands, { scale: 2 })
```

---

## ファクトリ関数

### p2r

共通オプションを事前に設定しておき、描画時は差分だけ指定できる便利な関数です。
同じcanvasSizeやchannelsを何度も書くのが面倒なときに使います。

```javascript
// ファクトリを作成
const render = p2r({
  canvasSize: [width, height],
  channels: [ch1, ch2, ch3]
})

// 以降はシンプルに書ける
render({
  path: circlePath,
  fill: {
    type: 'solid',
    channelVals: [100, 0, 0]
  },
  mode: 'overprint'
})

render({
  path: rectPath,
  fill: {
    type: 'solid',
    channelVals: [0, 100, 0]
  },
  mode: 'overprint'
})

```

---

## 依存性注入（DI）

### createP5Pave2Riso

グローバル変数を使いたくない場合に使うファクトリ関数です。

```javascript
import { createP5Pave2Riso } from 'p5.pave2riso'
import { Path } from '@baku89/pave'
import { vec2 } from 'linearly'

// 依存性を注入してインスタンスを作成
const {
  pave2Riso,
  p2r,
  PathIntersect,
  PathSubtract,
  PathExclude,
  PathUnite,
  PathOffset,
  isPathsOverlap,
  ot2pave
} = createP5Pave2Riso({ Path, vec2 })

// 以降は通常通り使える
pave2Riso({
  path: myPath,
  fill: {
    type: 'solid',
    channelVals: [100, 0, 0]
  },
  ...
})
```

### PathOffsetを使う場合

PathOffset機能を使うには、Paper.jsとpaperjs-offsetも注入する必要があります。

```javascript
import { createP5Pave2Riso } from 'p5.pave2riso'
import { Path } from '@baku89/pave'
import { vec2 } from 'linearly'
import paper from 'https://cdn.jsdelivr.net/npm/paper@0.12.4/+esm'
import { PaperOffset } from 'https://cdn.jsdelivr.net/npm/paperjs-offset@1.0.8/+esm'

const { PathOffset } = createP5Pave2Riso({
  Path,
  vec2,
  paper,
  PaperOffset
})

// PathOffsetが使える
const expanded = PathOffset(myPath, 10)
```

---

## インク濃度

### createInkDepth

インク濃度（0-100%）をp5.jsのカラー値（0-255）に変換します。
通常は内部で自動的に変換されるので、直接使う機会は少ないかもしれません。

```javascript
const inkValue = createInkDepth(50)  // 50% → 128
```

---

[< モード](modes.md)
