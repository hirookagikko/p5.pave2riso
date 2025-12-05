/**
 * Image Fill Test
 *
 * Tests image fill with various effects and modes.
 *
 * Grid Layout (3 cols × 4 rows):
 * - Row 0: overprint mode (no effect, blur, halftone)
 * - Row 1: cutout mode (no effect, blur, halftone)
 * - Row 2: join mode (no effect, blur, halftone)
 * - Row 3: dither variations (floydSteinberg, atkinson, bayer)
 */

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'
import paper from 'https://cdn.jsdelivr.net/npm/paper@0.12.4/+esm'
import { PaperOffset } from 'https://cdn.jsdelivr.net/npm/paperjs-offset@1.0.8/+esm'

const { p2r } = createP5Pave2Riso({ Path, vec2, paper, PaperOffset })

let channels = []
let render
let turingImgFull = null  // Original full image
let turingImg = null       // Cropped portion

// Crop settings (x, y, width, height from original image)
const CROP_SIZE = 400

// Grid configuration
const GRID_COLS = 3
const GRID_ROWS = 4  // 3 modes + 1 dither row
const CELL_WIDTH = 400
const LABEL_HEIGHT = 60
const CONTENT_HEIGHT = 360
const CELL_HEIGHT = LABEL_HEIGHT + CONTENT_HEIGHT
const CANVAS_WIDTH = CELL_WIDTH * GRID_COLS   // 1200
const CANVAS_HEIGHT = CELL_HEIGHT * GRID_ROWS  // 1680

// Effect labels for first 3 rows
const EFFECTS = ['no effect', 'blur', 'halftone']

// Modes for first 3 rows
const MODES = ['overprint', 'cutout', 'join']

// Dither types for row 3
const DITHER_TYPES = [
  { label: 'floydSteinberg', args: ['floydSteinberg'] },
  { label: 'atkinson', args: ['atkinson'] },
  { label: 'bayer', args: ['bayer'] }
]

window.preload = () => {
  // Load the turing pattern image
  turingImgFull = loadImage('../img/turing-pattern.png')
}

window.setup = () => {
  noLoop()
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
  pixelDensity(1)

  // Initialize Riso channels
  channels = [
    new Riso('green'),
    new Riso('bubblegum'),
    new Riso('yellow')
  ]

  // Expose channels globally for common.js export functionality
  window.risoChannels = channels

  // p2r factory - bind channels and canvas size once
  render = p2r({
    channels,
    canvasSize: [CANVAS_WIDTH, CANVAS_HEIGHT]
  })

  // Crop a portion of the image (center crop)
  if (turingImgFull) {
    const cropX = (turingImgFull.width - CROP_SIZE) / 2
    const cropY = (turingImgFull.height - CROP_SIZE) / 2
    turingImg = turingImgFull.get(cropX, cropY, CROP_SIZE, CROP_SIZE)
    console.log(`Cropped image: ${CROP_SIZE}x${CROP_SIZE} from ${turingImgFull.width}x${turingImgFull.height}`)
  }

  // Wait for image to load
  if (!turingImgFull) {
    setTimeout(() => {
      if (turingImgFull) {
        // Crop after delayed load
        const cropX = (turingImgFull.width - CROP_SIZE) / 2
        const cropY = (turingImgFull.height - CROP_SIZE) / 2
        turingImg = turingImgFull.get(cropX, cropY, CROP_SIZE, CROP_SIZE)
        redraw()
      }
    }, 1000)
    return
  }
}

window.draw = () => {
  if (!turingImg) return

  background(255)
  channels.forEach(ch => ch.clear())

  // ====== MAIN GRID ======
  drawMainGrid()

  // ====== DITHER ROW ======
  drawDitherRow()

  // ====== DRAW LABELS ======
  drawLabels()

  drawRiso()
}

/**
 * Draw labels for grid
 */
function drawLabels() {
  push()
  fill(0)
  noStroke()
  textFont('sans-serif')
  textAlign(CENTER, TOP)

  // Labels for first 3 rows (modes × effects)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const x = col * CELL_WIDTH + CELL_WIDTH / 2
      const y = row * CELL_HEIGHT + 10
      const mode = MODES[row]
      const effect = EFFECTS[col]

      textSize(16)
      text(mode, x, y)
      textSize(13)
      text(effect, x, y + 22)
    }
  }

  // Labels for dither row (row 3)
  for (let col = 0; col < GRID_COLS; col++) {
    const x = col * CELL_WIDTH + CELL_WIDTH / 2
    const y = 3 * CELL_HEIGHT + 10
    const ditherType = DITHER_TYPES[col]

    textSize(16)
    text('dither', x, y)
    textSize(13)
    text(ditherType.label, x, y + 22)
  }

  pop()
}

/**
 * Draw main grid (first 3 rows: modes × effects)
 */
function drawMainGrid() {
  const SHAPE_SIZE = 260
  const SHAPE_MARGIN_X = (CELL_WIDTH - SHAPE_SIZE) / 2
  const SHAPE_MARGIN_Y = (CONTENT_HEIGHT - SHAPE_SIZE) / 2

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const contentTop = row * CELL_HEIGHT + LABEL_HEIGHT
      const x = col * CELL_WIDTH + SHAPE_MARGIN_X
      const y = contentTop + SHAPE_MARGIN_Y
      const mode = MODES[row]
      const effectType = col

      // 1. Draw background rectangle (for cutout/join visibility)
      const bgPath = Path.rect([x - 15, y - 15], [x + SHAPE_SIZE + 15, y + SHAPE_SIZE + 15])

      render({
        path: bgPath,
        fill: { type: 'solid', channelVals: [0, 60, 0] },
        mode: 'overprint'
      })

      // 2. Draw circle path with image fill
      const cx = x + SHAPE_SIZE / 2
      const cy = y + SHAPE_SIZE / 2
      const circlePath = Path.circle([cx, cy], SHAPE_SIZE / 2)

      // Get fill config with effect
      const fill = getImageFillConfig(effectType)

      render({
        path: circlePath,
        fill,
        mode
      })

      // 3. Draw a small inner shape to show mode effect
      const innerPath = Path.circle([cx, cy], SHAPE_SIZE / 5)

      render({
        path: innerPath,
        fill: { type: 'solid', channelVals: [0, 0, 100] },
        mode
      })
    }
  }
}

/**
 * Draw dither row (row 3)
 */
function drawDitherRow() {
  const SHAPE_SIZE = 260
  const SHAPE_MARGIN_X = (CELL_WIDTH - SHAPE_SIZE) / 2
  const SHAPE_MARGIN_Y = (CONTENT_HEIGHT - SHAPE_SIZE) / 2
  const row = 3

  for (let col = 0; col < GRID_COLS; col++) {
    const contentTop = row * CELL_HEIGHT + LABEL_HEIGHT
    const x = col * CELL_WIDTH + SHAPE_MARGIN_X
    const y = contentTop + SHAPE_MARGIN_Y
    const ditherType = DITHER_TYPES[col]

    // 1. Draw background rectangle
    const bgPath = Path.rect([x - 15, y - 15], [x + SHAPE_SIZE + 15, y + SHAPE_SIZE + 15])

    render({
      path: bgPath,
      fill: { type: 'solid', channelVals: [0, 60, 0] },
      mode: 'overprint'
    })

    // 2. Draw circle path with image fill + dither
    const cx = x + SHAPE_SIZE / 2
    const cy = y + SHAPE_SIZE / 2
    const circlePath = Path.circle([cx, cy], SHAPE_SIZE / 2)

    render({
      path: circlePath,
      fill: {
        type: 'image',
        image: turingImg,
        fit: 'cover',
        alignX: 'center',
        alignY: 'middle',
        channelVals: [100, 0, 0],
        dither: { ditherArgs: ditherType.args }
      },
      mode: 'overprint'
    })

    // 3. Draw a small inner shape
    const innerPath = Path.circle([cx, cy], SHAPE_SIZE / 5)

    render({
      path: innerPath,
      fill: { type: 'solid', channelVals: [0, 0, 100] },
      mode: 'overprint'
    })
  }
}

/**
 * Get image fill configuration based on effect type
 * 0: no effect, 1: blur, 2: halftone
 */
function getImageFillConfig(effectType) {
  // Base config
  const baseConfig = {
    type: 'image',
    image: turingImg,
    fit: 'cover',
    alignX: 'center',
    alignY: 'middle',
    channelVals: [100, 0, 0]  // Green channel only
  }

  if (effectType === 0) {
    // No effect
    return baseConfig
  } else if (effectType === 1) {
    // Blur filter
    return {
      ...baseConfig,
      filter: { filterType: 'blur', filterArgs: [6] }
    }
  } else if (effectType === 2) {
    // Halftone (shape, size, angle, threshold)
    return {
      ...baseConfig,
      halftone: { halftoneArgs: ['circle', 4, 45, 150] }
    }
  }

  return baseConfig
}
