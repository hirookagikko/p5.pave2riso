# p5.pave2riso

## Overview

p5.pave2riso is a p5.js library that batch-deploys vector paths created with [Pave.js](https://baku89.com/Dec_9%EF%BC%8C_2024%EF%BC%9A_Pave.js) to multiple Risograph channels in [p5.riso.js](https://antiboredom.github.io/p5.riso/).

### Made For

- People doing creative coding with p5.js
- People interested in Risograph printing
- People using or wanting to use p5.riso.js

### Why Use This Library?

In Risograph printing, you create separate "plates" for each color. For example, printing with red, blue, and yellow requires three plates. To mix colors, you need to draw the same shape on each plate.

With p5.riso.js, this means writing drawing code for each channel individually:

```javascript
// Draw shape for each channel
channel1.fill(255 * 1.0)  // Red: 100%
channel1.ellipse(x, y, r)

channel2.fill(255 * 0.5)  // Blue: 50%
channel2.ellipse(x, y, r)

channel3.fill(255 * 0)    // Yellow: 0%
channel3.ellipse(x, y, r)
```

With p5.pave2riso, you can do this in a single call:

```javascript
// Batch deploy path to all channels
pave2Riso({
  path: Path.circle([x, y], r),
  fill: {
    type: 'solid',
    channelVals: [100, 50, 0] // Red 100%, Blue 50%, Yellow 0%
  },
  ...
})
```

You can specify solid, pattern, or gradient for both fill and stroke, apply filters, add halftone or dither effects, and batch deploy—all in one call. Note that fills can also use images, and strokes can use dashed lines.

---

## Table of Contents

### Getting Started

- [Getting Started](docs/getting-started.md) - Setup and first steps

### Reference

- [Fill Types](docs/fill-types.md) - Fill configuration options
- [Stroke Types](docs/stroke-types.md) - Stroke configuration options
- [Effects](docs/effects.md) - Filter / Halftone / Dither
- [Modes](docs/modes.md) - overprint / cutout / join
- [Utilities](docs/utilities.md) - Path operations, font conversion, etc.
- API Reference (Coming Soon) - Function and type reference

---

## Quick Reference

### Basic Usage

```javascript
// Create path with Pave.js
const myPath = Path.circle([400, 300], 100)

// Draw with p5.pave2riso
pave2Riso({
  path: myPath,
  fill: { type: 'solid', channelVals: [100, 0, 0] },
  stroke: null,
  mode: 'overprint',
  canvasSize: [800, 600],
  channels: [channel1, channel2, channel3]
})
```

### Fill Types

| Type | Description |
|------|-------------|
| `solid` | Solid fill |
| `pattern` | Pattern (using p5.pattern) |
| `gradient` | Gradient |
| `image` | Image |

### Stroke Types

| Type | Description |
|------|-------------|
| `solid` | Solid stroke |
| `dashed` | Dashed line |
| `pattern` | Pattern stroke |
| `gradient` | Gradient stroke |

### Modes

| Mode | Description |
|------|-------------|
| `overprint` | Overlay printing (default) |
| `cutout` | Remove path shape overlap |
| `join` | Remove overlap based on Fill/Stroke settings |

---

## Required Libraries

To use p5.pave2riso, you need the following libraries:

### Required

- [p5.js](https://p5js.org/)
- [Pave.js](https://github.com/baku89/pave) + [linearly](https://github.com/baku89/linearly)
- [p5.riso.js](https://antiboredom.github.io/p5.riso/)

### Optional

- [p5.pattern](https://github.com/SYM380/p5.pattern) - For pattern Fill/Stroke
- [Paper.js](http://paperjs.org/) + [paperjs-offset](https://github.com/luz-alphacode/paperjs-offset) - For path offset functionality

---

## Installation

### Local Build

```bash
git clone https://github.com/hirookagikko/p5.pave2riso.git
cd p5.pave2riso
npm install
npm run build
```

After building, use `dist/p5.pave2riso.js`.

### Load Directly from GitHub

```html
<script src="https://cdn.jsdelivr.net/gh/hirookagikko/p5.pave2riso@main/dist/p5.pave2riso.js"></script>
```

---

## Examples

**[View Examples](https://hirookagikko.github.io/p5.pave2riso/examples/)**

- [Getting Started](https://hirookagikko.github.io/p5.pave2riso/examples/getting-started.html) - Basic setup
- [Fill Types](https://hirookagikko.github.io/p5.pave2riso/examples/fill-types.html) - Fill options
- [Stroke Types](https://hirookagikko.github.io/p5.pave2riso/examples/stroke-types.html) - Stroke options
- [Print Modes](https://hirookagikko.github.io/p5.pave2riso/examples/print-modes.html) - Print modes
- [Effects](https://hirookagikko.github.io/p5.pave2riso/examples/effects.html) - Effects
- [Text Paths](https://hirookagikko.github.io/p5.pave2riso/examples/text-paths.html) - Text paths

---

## License

MIT License - see LICENSE file

**Important**: This library depends on p5.riso.js at runtime, which uses the ANTI-CAPITALIST SOFTWARE LICENSE.
