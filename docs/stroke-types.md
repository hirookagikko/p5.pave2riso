# Stroke の種類

> [動作サンプルを見る](https://hirookagikko.github.io/p5.pave2riso/examples/stroke-types.html)

パスの線を描く方法も4種類あり、`type`プロパティで指定できます。

---

## solid（ベタ線）

シンプルなベタの線です。

```javascript
stroke: {
  type: 'solid',
  strokeWeight: 3,
  channelVals: [100, 0, 0],
  strokeCap: 'round',
  strokeJoin: 'round'
}
```

### プロパティ

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| `type` | `'solid'` | ✅ | 固定値 |
| `strokeWeight` | `number` | ✅ | 線の太さ（ピクセル） |
| `channelVals` | `number[]` | ✅ | 各チャンネルのインク濃度（0-100%） |
| `strokeCap` | `StrokeCap` | | 線の端の形状 |
| `strokeJoin` | `StrokeJoin` | | 線の角の形状 |
| `filter` | `FilterConfig \| FilterConfig[]` | | フィルター |
| `halftone` | `HalftoneConfig` | | ハーフトーン |
| `dither` | `DitherConfig` | | ディザ |

---

## dashed（破線）

破線パターンの線です。

```javascript
stroke: {
  type: 'dashed',
  strokeWeight: 2,
  channelVals: [0, 100, 0],
  dashArgs: [10, 5],     // 線10px、隙間5px
  strokeCap: 'butt'
}
```

### プロパティ

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| `type` | `'dashed'` | ✅ | 固定値 |
| `strokeWeight` | `number` | ✅ | 線の太さ |
| `channelVals` | `number[]` | ✅ | 各チャンネルのインク濃度 |
| `dashArgs` | `number[]` | ✅ | 破線パターン [線の長さ, 隙間の長さ, ...] |
| `strokeCap` | `StrokeCap` | ✅ | 線の端の形状 |
| `strokeJoin` | `StrokeJoin` | | 線の角の形状 |
| `filter` | `FilterConfig \| FilterConfig[]` | | フィルター |
| `halftone` | `HalftoneConfig` | | ハーフトーン |
| `dither` | `DitherConfig` | | ディザ |

### dashArgsの例

```javascript
dashArgs: [10, 5]        // 線10px、隙間5pxの繰り返し
dashArgs: [20, 10, 5, 10] // 線20px、隙間10px、線5px、隙間10pxの繰り返し
```

---

## pattern（パターン線）

p5.patternを使ったパターンの線です。

```javascript
stroke: {
  type: 'pattern',
  strokeWeight: 10,
  channelVals: [100, 0, 0],
  PTN: 'stripe',
  patternArgs: [3],
  patternAngle: 45,
  dashArgs: [20, 10]  // オプション：破線にもできる
}
```

### プロパティ

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| `type` | `'pattern'` | ✅ | 固定値 |
| `strokeWeight` | `number` | ✅ | 線の太さ |
| `channelVals` | `number[]` | ✅ | 各チャンネルのインク濃度 |
| `PTN` | `string` | ✅ | パターン名 |
| `patternArgs` | `unknown[]` | ✅ | パターン関数への引数 |
| `patternAngle` | `number` | | パターンの回転角度（度） |
| `dashArgs` | `number[]` | | 破線パターン（指定すると破線になる） |
| `strokeCap` | `StrokeCap` | | 線の端の形状 |
| `strokeJoin` | `StrokeJoin` | | 線の角の形状 |
| `filter` | `FilterConfig \| FilterConfig[]` | | フィルター |
| `halftone` | `HalftoneConfig` | | ハーフトーン |
| `dither` | `DitherConfig` | | ディザ |

---

## gradient（グラデーション線）

線の部分にグラデーションをかけます。

```javascript
stroke: {
  type: 'gradient',
  strokeWeight: 5,
  gradientType: 'linear',
  colorStops: [
    {
      channel: 0,
      stops: [
        { position: 0, depth: 100 },
        { position: 100, depth: 0 }
      ]
    }
  ],
  dashArgs: [15, 5]  // オプション：破線にもできる
}
```

### プロパティ

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| `type` | `'gradient'` | ✅ | 固定値 |
| `strokeWeight` | `number` | ✅ | 線の太さ |
| `gradientType` | `GradientType` | ✅ | グラデーションの種類 |
| `colorStops` | `ColorStop[]` | ✅ | カラーストップ設定 |
| `dashArgs` | `number[]` | | 破線パターン |
| `strokeCap` | `StrokeCap` | | 線の端の形状 |
| `strokeJoin` | `StrokeJoin` | | 線の角の形状 |
| `filter` | `FilterConfig \| FilterConfig[]` | | フィルター |
| `halftone` | `HalftoneConfig` | | ハーフトーン |
| `dither` | `DitherConfig` | | ディザ |

---

## 共通オプション

### StrokeCap（線の端の形状）

| 値 | 説明 |
|-----|------|
| `'round'` | 丸い端 |
| `'square'` | 四角い端（線幅分はみ出る） |
| `'butt'` | フラットな端（はみ出ない） |

### StrokeJoin（線の角の形状）

| 値 | 説明 |
|-----|------|
| `'round'` | 丸い角 |
| `'miter'` | 尖った角 |
| `'bevel'` | 面取りした角 |

---

## 共通のエフェクトオプション

すべてのStrokeタイプで、以下のエフェクトオプションが使えます：

- `filter` - フィルター（[詳細](effects.md#filter)）
- `halftone` - ハーフトーン（[詳細](effects.md#halftone)）
- `dither` - ディザ（[詳細](effects.md#dither)）

---

[< Fill の種類](fill-types.md) | [次: エフェクト >](effects.md)
