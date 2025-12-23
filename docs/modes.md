# モード

> [動作サンプルを見る](https://hirookagikko.github.io/p5.pave2riso/examples/print-modes.html)

モードは、パスを描画するときに下のレイヤーとどう重ねるかを制御します。
リソグラフ印刷では、インクの重なり方の制御が仕上がりに大きく影響します。

---

## overprint（重ね刷り）

デフォルトのモードです。何も特別な処理をせず、単純に上に重ねて描画します。

```javascript
pave2Riso({
  path: myPath,
  fill: {
    type: 'solid',
    channelVals: [100, 0, 0]
  },
  mode: 'overprint',  // デフォルト
  ...
})
```

### 使いどころ

- 複数のパスを重ね刷りして色を混ぜたいとき

---

## cutout（抜き合わせ）

パスの形状で下のレイヤーを抜いてから描画します。

```javascript
pave2Riso({
  path: myPath,
  fill: {
    type: 'solid',
    channelVals: [100, 0, 0]
  },
  mode: 'cutout',
  ...
})
```

### 使いどころ

- 下のレイヤーと色が混ざらないようにしたいとき
- 白抜きにしたいとき

### 注意点

Strokeにcutoutを適用すると、線の形状でFillを抜いてから描画します。

---

## join（結合）

Strokeについてはcutoutと同じ挙動、Fillはpattern/image/gradientの場合に「柄の形状」で下のレイヤーを抜いてから描画します。
たとえば、黄色の背景に青のストライプを混色せずに重ねて「パッキリした黄色と青のストライプ」にしたいときなどに有効です。

```javascript
pave2Riso({
  path: myPath,
  fill: {
    type: 'pattern',
    PTN: 'stripe', // stripeの柄で抜いてから描画
    patternArgs: [20],
    channelVals: [100, 0, 0]
  },
  mode: 'join',
  ...
})
```

### 使いどころ

- 柄が重なる部分でインクが混ざるのを防ぎたいとき