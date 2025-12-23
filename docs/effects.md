# エフェクト

> [動作サンプルを見る](https://hirookagikko.github.io/p5.pave2riso/examples/effects.html)

Fill/Strokeに適用できるエフェクトは、Filter/Halftone/Ditherの3種類です。

---

## 適用の優先順位

エフェクトは2箇所で指定できます。

1. **トップレベル**（pave2Risoのオプション直下）
2. **ローカル**（fill/stroke内）

ローカルの設定が優先されます。

```javascript
pave2Riso({
  path: myPath,
  fill: {
    type: 'solid',
    channelVals: [100, 0, 0],
    halftone: { halftoneArgs: ['circle', 4, 45, 128] }  // ← こちらが優先
  },
  stroke: null,
  mode: 'overprint',
  canvasSize: [width, height],
  channels: [ch1, ch2, ch3],
  halftone: { halftoneArgs: ['circle', 8, 0, 220] }  // ← fillにhalftoneがなければこれが使われる
})
```

---

## Filter

[p5.jsの`filter()`関数](https://p5js.org/reference/p5/filter/)に相当するエフェクトです。複数指定することもできます。

```javascript
fill: {
  type: 'solid',
  channelVals: [100, 0, 0],
  filter: { filterType: 'blur', radius: 3 }
}

// 複数のフィルターを連続適用
fill: {
  type: 'solid',
  channelVals: [100, 0, 0],
  filter: [
    { filterType: 'blur', radius: 2 },
    { filterType: 'threshold', threshold: 0.5 }
  ]
}
```

### FilterConfig

フィルタータイプごとに専用のプロパティを持つ形式です：

```typescript
// ぼかし
{ filterType: 'blur', radius: number }

// 2値化
{ filterType: 'threshold', threshold?: number }  // 0-1、省略時0.5

// ポスタリゼーション
{ filterType: 'posterize', levels: number }  // 2-255

// 引数なしフィルター
{ filterType: 'gray' | 'invert' | 'opaque' | 'dilate' | 'erode' }
```

### FilterType

| 値 | 説明 | プロパティ |
|-----|------|------------|
| `'blur'` | ぼかし | `radius: number` |
| `'threshold'` | 2値化 | `threshold?: number` (0-1) |
| `'posterize'` | ポスタリゼーション | `levels: number` (2-255) |
| `'gray'` | グレースケール化 | なし |
| `'invert'` | 反転 | なし |
| `'opaque'` | 不透明化 | なし |
| `'dilate'` | 膨張 | なし |
| `'erode'` | 収縮 | なし |

### 例

```javascript
// ぼかし
filter: { filterType: 'blur', radius: 5 }

// 2値化（閾値0.5）
filter: { filterType: 'threshold', threshold: 0.5 }

// ポスタリゼーション（4階調）
filter: { filterType: 'posterize', levels: 4 }

// 反転
filter: { filterType: 'invert' }
```

---

## Halftone

ハーフトーン（網点）エフェクトです。
p5.riso.jsの`halftoneImage()`関数をそのまま使用できます。

```javascript
fill: {
  type: 'solid',
  channelVals: [100, 0, 0],
  halftone: { halftoneArgs: ['circle', 4, 45, 128] }
}
```

### HalftoneConfig

```typescript
interface HalftoneConfig {
  halftoneArgs: (string | number)[]  // [shape, size, angle, threshold]
}
```

### halftoneArgsの意味

| インデックス | 説明 | 例 |
|-------------|------|-----|
| `[0]` | ドット形状 | `'circle'`, `'line'`, `'square'`, `'ellipse'`, `'cross'` |
| `[1]` | ドットサイズ | `4` |
| `[2]` | 角度（度） | `45` |
| `[3]` | 閾値 | `128` |

### よく使う設定

```javascript
// 円ドット、サイズ4、斜め45度
halftone: { halftoneArgs: ['circle', 4, 45, 128] }

// ラインパターン、サイズ3、30度
halftone: { halftoneArgs: ['line', 3, 30, 128] }

// 複数チャンネルで角度をずらすとモアレが減る
// channel1: 15度、channel2: 45度、channel3: 75度
```

---

## Dither

ディザリングエフェクトです。ハーフトーンとは違った質感になります。
p5.riso.jsの`ditherImage()`関数をそのまま使用できます。

```javascript
fill: {
  type: 'solid',
  channelVals: [100, 0, 0],
  dither: { ditherArgs: [0.5, 1] }
}
```

### DitherConfig

```typescript
interface DitherConfig {
  ditherArgs: number[]
}
```

### ditherArgsの意味

p5.riso.jsのditherImage関数に渡される引数です。詳しくは[p5.riso.jsのドキュメント](https://antiboredom.github.io/p5.riso/)を参照してください。

---

## エフェクトの組み合わせ

Filter、Halftone、Ditherは同時に指定できます。適用順序は

1. Filter（複数ある場合は配列の順）
2. Halftone または Dither

で、HalftoneとDitherはどちらか一方のみ指定できます。

```javascript
fill: {
  type: 'solid',
  channelVals: [100, 0, 0],
  filter: { filterType: 'blur', radius: 2 },
  halftone: { halftoneArgs: ['circle', 4, 45, 128] }
}
```

---

## トップレベルでの指定

すべてのFill/Strokeに同じエフェクトを適用したい場合は、トップレベルで指定します。

```javascript
pave2Riso({
  path: myPath,
  fill: { type: 'solid', channelVals: [100, 0, 0] },
  stroke: { type: 'solid', strokeWeight: 2, channelVals: [0, 100, 0] },
  mode: 'overprint',
  canvasSize: [width, height],
  channels: [ch1, ch2, ch3],
  // トップレベルでハーフトーンを指定
  halftone: { halftoneArgs: ['circle', 4, 45, 128] }
})
```

この場合、FillとStroke両方にハーフトーンが適用されます。

---

[< Stroke の種類](stroke-types.md) | [次: モード >](modes.md)
