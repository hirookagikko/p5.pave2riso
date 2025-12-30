# ot2pave

OpenType.js to Pave.js Path Converter

Convert font glyphs from [OpenType.js](https://opentype.js.org/) to [Pave.js](https://pave.baku89.com/) paths with proper handling of compound paths (holes in letters like 'e', 'o', 'a', 'd').

## Installation

This is a standalone ESM module. Copy the `index.js` file to your project or import directly.

### Required Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| [@baku89/pave](https://www.npmjs.com/package/@baku89/pave) | ^0.7.1 | Path operations |
| [opentype.js](https://www.npmjs.com/package/opentype.js) | ^1.3.4 | Font loading |

## Usage

### Browser (ESM via CDN)

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
    import opentype from 'https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/+esm'
    import { createOt2pave } from './ot2pave/index.js'

    // Create converter with dependency injection
    const ot2pave = createOt2pave({ Path })

    // Load font and convert
    const font = await opentype.load('path/to/font.ttf')
    const otPath = font.getPath('Hello', 0, 100, 72)
    const pavePath = ot2pave(otPath.commands)

    // Draw to canvas
    const canvas = document.getElementById('canvas')
    const ctx = canvas.getContext('2d')
    Path.drawToCanvas(pavePath, ctx)
    ctx.fill()
  </script>
</head>
<body>
  <canvas id="canvas" width="800" height="200"></canvas>
</body>
</html>
```

### Node.js (ESM)

```javascript
import { Path } from '@baku89/pave'
import opentype from 'opentype.js'
import { createOt2pave } from './ot2pave/index.js'

const ot2pave = createOt2pave({ Path })

const font = await opentype.load('font.ttf')
const otPath = font.getPath('Hello', 0, 100, 72)
const pavePath = ot2pave(otPath.commands)

// Convert to SVG string
const svgPath = Path.toSVGString(pavePath)
console.log(`<path d="${svgPath}" fill="black"/>`)
```

## API

### `createOt2pave(deps)`

Factory function that creates the ot2pave converter.

**Parameters:**
- `deps.Path` - Pave.js Path static object (required)

**Returns:** `ot2pave` function

### `ot2pave(commands, options?)`

Convert OpenType.js commands to Pave.js path.

**Parameters:**
- `commands` - Array of OpenType.js path commands
- `options.debug` - Enable debug logging (default: `false`)
- `options.debugPaths` - Array to collect individual paths for debugging

**Returns:** Pave.js path object

## How It Works

1. **Collect Paths**: Parse OpenType.js commands (M, L, C, Q, Z) into individual closed paths
2. **Analyze Winding**: Calculate winding direction using Shoelace formula (CW = solid, CCW = hole)
3. **Sort by Area**: Process largest path first (always treated as solid base)
4. **Sequential Integration**: For each remaining path:
   - Check containment relationship (INDEPENDENT / CONTAINED / OVERLAP)
   - Determine operation (UNITE for solids, SUBTRACT for holes)
   - Apply Boolean operation

This algorithm correctly handles complex glyphs with multiple holes (like 'B', '8') and nested structures.

## Debug Mode

Enable debug logging to see the processing steps:

```javascript
const pavePath = ot2pave(otPath.commands, { debug: true })
```

Collect individual paths for visualization:

```javascript
const debugPaths = []
const pavePath = ot2pave(otPath.commands, { debugPaths })

// debugPaths now contains:
// [
//   { path: {...}, area: 1234.5, winding: -500, bounds: [[x1,y1], [x2,y2]] },
//   { path: {...}, area: 234.5, winding: 100, bounds: [[x1,y1], [x2,y2]] },
//   ...
// ]
```

## Examples

### Text with Transform

```javascript
import { Path } from '@baku89/pave'
import { mat2d } from 'linearly'
import opentype from 'opentype.js'
import { createOt2pave } from './ot2pave/index.js'

const ot2pave = createOt2pave({ Path })

const font = await opentype.load('font.ttf')
const text = 'Hello'
const fontSize = 72

// Get text path
const otPath = font.getPath(text, 0, 0, fontSize)
const pavePath = ot2pave(otPath.commands)

// Get bounds and center
const bounds = Path.bounds(pavePath)
const width = bounds[1][0] - bounds[0][0]
const height = bounds[1][1] - bounds[0][1]

// Transform: center on canvas
const transform = mat2d.fromTranslation([
  400 - width / 2 - bounds[0][0],
  300 - height / 2 - bounds[0][1]
])
const centeredPath = Path.transform(pavePath, transform)
```

### Multiple Glyphs with Kerning

```javascript
function textToPath(font, text, x, y, fontSize) {
  const ot2pave = createOt2pave({ Path })
  const paths = []
  let currentX = x

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const glyph = font.charToGlyph(char)

    // Get glyph path
    const otPath = glyph.getPath(currentX, y, fontSize)
    const pavePath = ot2pave(otPath.commands)
    paths.push(pavePath)

    // Advance with kerning
    const advance = glyph.advanceWidth * (fontSize / font.unitsPerEm)
    if (i < text.length - 1) {
      const nextGlyph = font.charToGlyph(text[i + 1])
      const kerning = font.getKerningValue(glyph, nextGlyph) * (fontSize / font.unitsPerEm)
      currentX += advance + kerning
    } else {
      currentX += advance
    }
  }

  return Path.merge(paths)
}
```

## License

MIT
