# Fill の種類

> [動作サンプルを見る](https://hirookagikko.github.io/p5.pave2riso/examples/fill-types.html)

パスの塗りつぶし方法は4種類あり、`type`プロパティで指定できます。

---

## solid（ベタ塗り）

シンプルなベタ塗りです。各チャンネルのインク濃度を指定します。

```javascript
fill: {
  type: 'solid',
  channelVals: [100, 50, 0]  // channel1: 100%, channel2: 50%, channel3: 0%
}
```

### プロパティ

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| `type` | `'solid'` | ✅ | 固定値 |
| `channelVals` | `number[]` | ✅ | 各チャンネルのインク濃度（0-100%） |
| `filter` | `FilterConfig \| FilterConfig[]` | | フィルター |
| `halftone` | `HalftoneConfig` | | ハーフトーン |
| `dither` | `DitherConfig` | | ディザ |

---

## pattern（パターン）

[p5.pattern](https://github.com/SYM380/p5.pattern)ライブラリを使ったパターンを適用できます。

```javascript
fill: {
  type: 'pattern',
  PTN: 'stripe',           // パターン名
  patternArgs: [10],       // パターン関数への引数
  patternAngle: 45,        // パターンの回転角度
  channelVals: [100, 0, 0]
}
```

### プロパティ

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| `type` | `'pattern'` | ✅ | 固定値 |
| `PTN` | `string` | ✅ | パターン名（PTNオブジェクトのキー） |
| `patternArgs` | `unknown[]` | ✅ | パターン関数への引数 |
| `patternAngle` | `number` | | パターンの回転角度（度） |
| `channelVals` | `number[]` | ✅ | 各チャンネルのインク濃度 |
| `filter` | `FilterConfig \| FilterConfig[]` | | フィルター |
| `halftone` | `HalftoneConfig` | | ハーフトーン |
| `dither` | `DitherConfig` | | ディザー |

### 使えるパターン

p5.patternが提供するパターン関数が使えます。

- `stripe` - ストライプ
- `dot` - ドット
- `wave` - 波線
- `cross` - クロス

など。
詳しくは[p5.patternのドキュメント](https://github.com/SYM380/p5.pattern)を参照してください。

---

## gradient（グラデーション）

グラデーションの指定については、チャンネル指定でcolorStopsを設定します。

```javascript
fill: {
  type: 'gradient',
  gradientType: 'linear',
  gradientDirection: 'LR',  // 左から右
  colorStops: [
    {
      channel: 0,
      stops: [
        { position: 0, depth: 100 },
        { position: 100, depth: 0 }
      ]
    },
    {
      channel: 1,
      stops: [
        { position: 0, depth: 0 },
        { position: 100, depth: 100 }
      ]
    }
  ]
}
```

### プロパティ

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| `type` | `'gradient'` | ✅ | 固定値 |
| `gradientType` | `GradientType` | ✅ | グラデーションの種類 |
| `gradientDirection` | `GradientDirection` | | 方向（linearのみ） |
| `colorStops` | `ColorStop[]` | ✅ | カラーストップ設定 |
| `filter` | `FilterConfig \| FilterConfig[]` | | フィルター |
| `halftone` | `HalftoneConfig` | | ハーフトーン |
| `dither` | `DitherConfig` | | ディザー |

### GradientType

| 値 | 説明 |
|-----|------|
| `'linear'` | 線形グラデーション |
| `'radial'` | 放射状グラデーション |
| `'conic'` | 円錐グラデーション |

### GradientDirection（linearのみ）

| 値 | 説明 |
|-----|------|
| `'TD'` | 上から下（Top to Down） |
| `'DT'` | 下から上 |
| `'LR'` | 左から右（Left to Right） |
| `'RL'` | 右から左 |
| `'LTRB'` | 左上から右下 |
| `'RTLB'` | 右上から左下 |
| `'LBRT'` | 左下から右上 |
| `'RBLT'` | 右下から左上 |

### ColorStop

各チャンネルのグラデーション設定です。

```typescript
interface ColorStop {
  channel: number        // チャンネルインデックス（0始まり）
  stops: Array<{
    position: number     // 位置（0-100%）
    depth: number        // インク濃度（0-100%）
  }>
}
```

---

## image（画像）

p5.Imageを使った画像塗りです。画像のグレースケール値がインク濃度になります。カラー画像を指定すると、現状では自動的にグレースケールにして処理します（RGB/CMYKチャンネルから分版する仕組みを開発中です）。

```javascript
fill: {
  type: 'image',
  image: myImage,
  fit: 'cover',
  alignX: 'center',
  alignY: 'middle',
  channelVals: [100, 0, 0]
}
```

### プロパティ

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| `type` | `'image'` | ✅ | 固定値 |
| `image` | `p5.Image` | ✅ | 画像オブジェクト |
| `fit` | `ImageFit` | | フィット方式 |
| `alignX` | `AlignX` | | 水平方向の揃え |
| `alignY` | `AlignY` | | 垂直方向の揃え |
| `scale` | `number` | | スケール倍率 |
| `offset` | `[number, number]` | | オフセット [x, y] |
| `rotate` | `number` | | 回転角度（度） |
| `channelVals` | `number[]` | | 各チャンネルのインク濃度 |
| `filter` | `FilterConfig \| FilterConfig[]` | | フィルター |
| `halftone` | `HalftoneConfig` | | ハーフトーン |
| `dither` | `DitherConfig` | | ディザー |

### ImageFit

| 値 | 説明 |
|-----|------|
| `'cover'` | アスペクト比を維持して領域を覆う |
| `'contain'` | アスペクト比を維持して領域に収める |
| `'fill'` | 領域にぴったり合わせる（歪む可能性あり） |
| `'none'` | 元のサイズのまま |

### AlignX / AlignY

```typescript
type AlignX = 'left' | 'center' | 'right' | number
type AlignY = 'top' | 'middle' | 'bottom' | number
```

数値を指定すると、その位置（0-1の割合）に配置されます。

---

## 共通のエフェクトオプション

すべてのFillタイプで、以下のエフェクトオプションが使えます：

- `filter` - フィルター（[詳細](effects.md#filter)）
- `halftone` - ハーフトーン（[詳細](effects.md#halftone)）
- `dither` - ディザー（[詳細](effects.md#dither)）

```javascript
fill: {
  type: 'solid',
  channelVals: [100, 0, 0],
  halftone: { halftoneArgs: [4, 45, 1] }  // ハーフトーンを適用
}
```

---

[< はじめに](getting-started.md) | [次: Stroke の種類 >](stroke-types.md)
