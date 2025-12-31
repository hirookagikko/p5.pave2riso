# pave-utils

Path utilities for Pave.js using Paper.js

Provides `PathOffset` (expand/shrink paths) and `PathRemoveHoles` (fill holes in letters) for [Pave.js](https://pave.baku89.com/) paths.

## Installation

This is a standalone ESM module. Copy the `index.js` file to your project or import directly.

### Required Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| [@baku89/pave](https://www.npmjs.com/package/@baku89/pave) | ^0.7.1 | Path operations |
| [paper.js](https://www.npmjs.com/package/paper) | 0.12.4 | Vector graphics engine |
| [paperjs-offset](https://www.npmjs.com/package/paperjs-offset) | ^1.0.8 | Path offset algorithm |

## Usage

### Browser (ESM via CDN)

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
    import paper from 'https://cdn.jsdelivr.net/npm/paper@0.12.4/+esm'
    import { PaperOffset } from 'https://cdn.jsdelivr.net/npm/paperjs-offset@1.0.8/+esm'
    import { createPaveUtils } from './pave-utils/index.js'

    const { PathOffset, PathRemoveHoles, cleanup } = createPaveUtils({
      Path, paper, PaperOffset
    })

    // Expand path by 10 pixels
    const circle = Path.circle([100, 100], 50)
    const expanded = PathOffset(circle, 10)

    // Draw to canvas
    const canvas = document.getElementById('canvas')
    const ctx = canvas.getContext('2d')
    Path.drawToCanvas(expanded, ctx)
    ctx.stroke()
  </script>
</head>
<body>
  <canvas id="canvas" width="400" height="400"></canvas>
</body>
</html>
```

### With p5.js and ot2pave

```javascript
import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import paper from 'https://cdn.jsdelivr.net/npm/paper@0.12.4/+esm'
import { PaperOffset } from 'https://cdn.jsdelivr.net/npm/paperjs-offset@1.0.8/+esm'
import opentype from 'https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/+esm'
import { createOt2pave } from './ot2pave/index.js'
import { createPaveUtils } from './pave-utils/index.js'

const ot2pave = createOt2pave({ Path })
const { PathOffset, PathRemoveHoles, cleanup } = createPaveUtils({
  Path, paper, PaperOffset
})

let font = null

window.setup = () => {
  createCanvas(400, 400)
  loadFontAsync()
}

async function loadFontAsync() {
  const res = await fetch('fonts/font.ttf')
  font = opentype.parse(await res.arrayBuffer())
}

window.draw = () => {
  if (!font) return
  background(233)

  // Get text path
  const otPath = font.getPath('e', mouseX, mouseY, 200)
  let path = ot2pave(otPath.commands)

  // Expand by 5 pixels
  path = PathOffset(path, 5)

  // Fill holes (the center of 'e' becomes solid)
  path = PathRemoveHoles(path)

  // Draw
  fill(0)
  noStroke()
  drawingContext.beginPath()
  Path.drawToCanvas(path, drawingContext)
  drawingContext.fill()
}
```

## API

### `createPaveUtils(deps)`

Factory function that creates the pave-utils instance.

**Parameters:**
- `deps.Path` - Pave.js Path static object (required)
- `deps.paper` - Paper.js instance (required)
- `deps.PaperOffset` - PaperOffset static object (required)

**Returns:** `{ PathOffset, PathRemoveHoles, cleanup }`

### `PathOffset(path, distance, options?)`

Offset a path by a given distance.

**Parameters:**
- `path` - Pave.js path to offset
- `distance` - Offset distance (positive = outward, negative = inward)
- `options.join` - Join style: `'miter'` | `'bevel'` | `'round'`
- `options.cap` - Cap style: `'butt'` | `'round'` | `'square'`

**Returns:** Offset Pave.js path

### `PathRemoveHoles(path)`

Remove all holes from a path, keeping only outer contours.

**Parameters:**
- `path` - Pave.js path (may have holes like letters 'e', 'o', 'a')

**Returns:** Pave.js path with holes removed

### `cleanup()`

Release Paper.js resources. Call this periodically during long-running sessions to prevent memory leaks.

## How It Works

### PathOffset

1. Convert Pave.js path to SVG string via `Path.toSVGString()`
2. Import SVG into Paper.js
3. Apply `PaperOffset.offset()` algorithm
4. Convert Paper.js segments back to Pave.js vertices

### PathRemoveHoles

1. Convert path to individual Paper.js paths
2. Check each path's `clockwise` property:
   - Clockwise (CW) = outer contour → keep
   - Counter-clockwise (CCW) = hole → remove
3. Rebuild compound path with only outer contours

**Fallback:** If Paper.js is unavailable, uses Shoelace formula to determine winding direction (less accurate for bezier curves).

## Memory Management

Paper.js uses an internal canvas for calculations. For long-running applications:

```javascript
// Call periodically or when done with path operations
cleanup()
```

## License

MIT
