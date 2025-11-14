# p5.pave2riso

*Read this in other languages: [English](README.md), [日本語](README.ja.md)*

A p5.js library that converts vector paths created with Pave.js into p5.riso.js Risograph print channels. Also supports pattern drawing with p5.pattern.js.

## Dependencies

This library depends on:

- **[p5.js](https://p5js.org/)** - JavaScript library for creative coding
- **[Pave.js](https://github.com/baku89/pave)** (MIT) by Baku Hashimoto - Vector path operations
- **[Linearly](https://github.com/baku89/linearly)** (MIT) by Baku Hashimoto - Vector math (Pave.js dependency)
- **[p5.riso.js](https://github.com/antiboredom/p5.riso)** (ANTI-CAPITALIST) by Sam Lavigne and Tega Brain - Risograph print simulation
- **[p5.pattern.js](https://github.com/SYM380/p5.pattern)** (MIT) by Taichi Sayama - Pattern drawing (optional)

## Key Features

### 1. Risograph Print Modes
- **overprint**: Overlay inks (default)
  - Fill and stroke overlap across all channels

- **cutout**: Remove path region before printing
  - Remove path region from all channels with solid shape
  - Then apply fill/stroke to specified channels

- **join**: Remove path region according to fill density/pattern before printing
  - **Solid fill**: Completely remove (same as cutout)
  - **Pattern fill**: Remove according to pattern (density)
  - **Gradient fill**: Remove according to gradient density
  - **Image fill**: Remove according to image density

### 2. Diverse Fill Types
- **Solid**: Fill with ink density (0-100%) per channel
- **Pattern**: Pattern fill using p5.pattern library
- **Gradient**: Linear, radial, and conic gradients
- **Image**: Use images as fill (position adjustment, scale, rotation support)

### 3. Diverse Stroke Types
- **Solid**: Single color line
- **Dashed**: Customizable dashed line patterns
- **Pattern**: Lines drawn with patterns
- **Gradient**: Lines drawn with gradients

### 4. Effect Support
- **Filter**: Apply image processing filters
- **Halftone**: Halftone dot expression
- **Dithering**: Gradation expression with dither patterns

## Architecture

### Processing Flow

1. **Validation**: Check required parameters (path, canvasSize, channels, mode)
2. **GraphicsPipeline Initialization**: Manage and prepare p5.Graphics objects
3. **Apply Clipping Path**: Set optional clipping path
4. **Apply Print Mode**: Pre-process according to overprint/cutout/join mode
5. **Draw Fill**: Execute appropriate fill renderer based on settings
6. **Draw Stroke**: Execute appropriate stroke renderer based on settings
7. **Release Clipping**: Release clipping path
8. **Cleanup**: Dispose temporary graphics resources

### Main Components

```
src/
├── core.ts                    # pave2Riso() main function
├── graphics/
│   └── GraphicsPipeline.ts   # Graphics processing hub
├── modes/
│   └── modes.ts              # Print mode processing
├── renderers/
│   ├── fills/                # Fill renderers
│   │   ├── solid.ts
│   │   ├── pattern.ts
│   │   ├── gradient.ts
│   │   └── image.ts
│   └── strokes/              # Stroke renderers
│       ├── solid.ts
│       ├── dashed.ts
│       ├── pattern.ts
│       └── gradient.ts
├── channels/
│   └── operations.ts         # Effect processing
├── types/                    # Type definitions
├── utils/                    # Utilities
└── validation/               # Validation
```

**Main Roles**:
- **pave2Riso()**: Orchestrates overall processing
- **GraphicsPipeline**: Create/manage p5.Graphics objects, draw Pave paths, handle clipping
- **Mode Processing**: Pre-draw processing for each print mode
- **Renderers**: Drawing implementation by fill type and stroke type
- **Effect Processing**: Apply filters, halftone, dithering

### Type-Safe Design

- **Fill and Stroke Settings**: When you specify the `type` field, the corresponding configuration items are automatically determined (TypeScript Discriminated Unions)
- **Ink Density**: Checked in 0-100% range and managed type-safely (Branded Types)

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

*Note: Download p5.riso.js and place it in any location*

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>html sample</title>
  <script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.js"></script>
  <script src="../libraries/p5.riso.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/SYM380/p5.pattern@master/p5.pattern.min.js"></script>
</head>
<body style="padding: 0; margin: 0; zoom: 0.5;">
  <main></main>
  <button id="export-btn" type="button" style="position:fixed; top:12px; right:12px; z-index:1000;">Export</button>
  <script type="module" src="sample.js"></script>
</body>
</html>
```

## Usage Examples

### Basic Usage

```javascript
// Import pave and linearly as ES modules
import { Path, Distort } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { mat2d, vec2 } from 'https://cdn.jsdelivr.net/npm/linearly/+esm'
// Import pave2Riso
import { pave2Riso } from '../dist/p5.pave2riso.js'
```

### Solid Fill

Sample code: [samples/sample.html](samples/sample.html) / [samples/sample.js](samples/sample.js) | **[View Demo](https://hirookagikko.github.io/p5.pave2riso/)**

Demonstrates different channel combinations using 6 circles.

### Pattern Fill

(Coming soon)

### Gradient Fill

(Coming soon)

### Image Fill

(Coming soon)

### Stroke

(Coming soon)

### Print Modes

(Coming soon)

### Effects

(Coming soon)

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

## License

MIT License - see LICENSE file

**Important**: This library depends on p5.riso.js at runtime, which uses the ANTI-CAPITALIST SOFTWARE LICENSE.
