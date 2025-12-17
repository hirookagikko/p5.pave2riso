# p5.pave2riso

*Read this in other languages: [English](README.md), [日本語](README.ja.md)*

A p5.js library that converts vector paths created with Pave.js into p5.riso.js Risograph print channels. Supports diverse fill types (solid, pattern, gradient, image), stroke styles (solid, dashed, pattern, gradient), print modes (overprint, cutout, join), and effects (filters, halftone, dithering).

## Dependencies

This library depends on:

- **[p5.js](https://p5js.org/)** - JavaScript library for creative coding
- **[Pave.js](https://github.com/baku89/pave)** (MIT) by Baku Hashimoto - Vector path operations
- **[Linearly](https://github.com/baku89/linearly)** (MIT) by Baku Hashimoto - Vector math (Pave.js dependency)
- **[p5.riso.js](https://github.com/antiboredom/p5.riso)** (ANTI-CAPITALIST) by Sam Lavigne and Tega Brain - Risograph print simulation
- **[p5.pattern.js](https://github.com/SYM380/p5.pattern)** (MIT) by Taichi Sayama - Pattern drawing (optional)

## Key Features

- **Risograph Print Modes**: overprint (overlay inks), cutout (remove then print), join (remove by density)
- **Fill Types**: solid, pattern, gradient (linear/radial/conic), image
- **Stroke Types**: solid, dashed, pattern, gradient
- **Effects**: filters, halftone, dithering
- **Utilities**: Factory function (p2r), pathfinder operations, font path conversion (OpenType to Pave)

## Installation

### Local Build

```bash
# Clone repository
git clone https://github.com/hirookagikko/p5.pave2riso.git
cd p5.pave2riso

# Install dependencies
npm install

# Build
npm run build
```

After building, use `dist/p5.pave2riso.js`.

### Load Directly from GitHub

```html
<script src="https://cdn.jsdelivr.net/gh/hirookagikko/p5.pave2riso@main/dist/p5.pave2riso.js"></script>
```

### HTML Template

*Note: p5.riso.js is not available on npm. Download from [GitHub](https://github.com/antiboredom/p5.riso) and host locally, or use a CDN service.*

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>p5.pave2riso Example</title>
  <script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.js"></script>
  <script src="path/to/p5.riso.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/SYM380/p5.pattern@master/p5.pattern.min.js"></script>
</head>
<body>
  <main></main>
  <script type="module" src="sketch.js"></script>
</body>
</html>
```

## Examples

**[View Examples](https://hirookagikko.github.io/p5.pave2riso/examples/)**

Comprehensive examples with code and live demos:
- [Getting Started](https://hirookagikko.github.io/p5.pave2riso/examples/getting-started.html) - Basic setup and first steps
- [Fill Types](https://hirookagikko.github.io/p5.pave2riso/examples/fill-types.html) - Solid, pattern, gradient, and image fills
- [Stroke Types](https://hirookagikko.github.io/p5.pave2riso/examples/stroke-types.html) - Solid, dashed, pattern, and gradient strokes
- [Print Modes](https://hirookagikko.github.io/p5.pave2riso/examples/print-modes.html) - Overprint, cutout, and join modes
- [Effects](https://hirookagikko.github.io/p5.pave2riso/examples/effects.html) - Filters, halftone, and dithering
- [Text Paths](https://hirookagikko.github.io/p5.pave2riso/examples/text-paths.html) - Working with fonts using OpenType.js

## Basic Usage

```javascript
// Import pave and linearly as ES modules
import { Path, Distort } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { mat2d, vec2 } from 'https://cdn.jsdelivr.net/npm/linearly/+esm'
// Import pave2Riso
import { pave2Riso } from '../dist/p5.pave2riso.js'

// IMPORTANT: Make Path and vec2 available globally for internal wrappers
window.Path = Path
window.vec2 = vec2
```

For complete examples, see the [Examples](#examples) section above.

### Factory Function (p2r)

**New in v1.1.0**: The `p2r` factory function simplifies code when making multiple `pave2Riso()` calls by pre-binding `channels` and `canvasSize`.

```javascript
import { p2r } from '../dist/p5.pave2riso.js'

// Setup once
const render = p2r({ channels, canvasSize: [width, height] })

// Use multiple times without repeating context
render({
  path: myPath,
  fill: { type: 'solid', channelVals: [100, 0, 0] },
  mode: 'overprint'
})

render({
  path: anotherPath,
  fill: { type: 'pattern', PTN: 'stripe', patternArgs: [20] },
  mode: 'cutout'
})
```

### Pathfinder Utilities

**New in v1.1.0**: Boolean operations for combining and manipulating paths.

```javascript
import { PathIntersect, PathExclude, isPathsOverlap } from '../dist/p5.pave2riso.js'

// Boolean intersection (overlapping region)
const intersected = PathIntersect(pathA, pathB)

// Boolean exclusion (symmetric difference)
const excluded = PathExclude(pathA, pathB)

// Check if paths overlap
if (isPathsOverlap(pathA, pathB)) {
  // paths have overlapping region
}
```

### Font Utilities

**New in v1.1.0**: Convert OpenType.js font paths to Pave.js paths.

```javascript
import { ot2pave } from '../dist/p5.pave2riso.js'

// Convert font glyph to Pave path
const font = opentype.load('font.ttf')
const glyph = font.charToGlyph('A')
const commands = glyph.getPath(0, 0, 72).commands
const pavePath = ot2pave(commands)

// Use with pave2Riso
pave2Riso({
  path: pavePath,
  channels: myChannels,
  canvasSize: [width, height],
  fill: { type: 'solid', channelVals: [100, 0, 0] }
})
```

## Architecture

The library uses a type-safe pipeline architecture:

1. **Validation** → Verify required parameters
2. **GraphicsPipeline** → Manage p5.Graphics objects and clipping
3. **Mode Processing** → Pre-process for overprint/cutout/join modes
4. **Renderers** → Dispatch to type-specific fill and stroke renderers
5. **Effects** → Apply filters, halftone, or dithering
6. **Cleanup** → Release graphics resources

**Type Safety**: Fill and stroke settings use TypeScript discriminated unions. The `type` field determines available configuration options. Ink density values are range-checked (0-100%) using branded types.

## License

MIT License - see LICENSE file

**Important**: This library depends on p5.riso.js at runtime, which uses the ANTI-CAPITALIST SOFTWARE LICENSE.
