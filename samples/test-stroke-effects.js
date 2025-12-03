/**
 * Stroke Effects Test
 *
 * Tests halftone and filter effects on various stroke types.
 * Limited samples due to heavy processing.
 *
 * Grid Layout (2 cols × 6 rows):
 * - Row 0-1: solid stroke (no effect, blur, halftone, blur+halftone)
 * - Row 2-3: pattern stroke (no effect, blur, halftone, blur+halftone)
 * - Row 4-5: gradient stroke (no effect, blur, halftone, blur+halftone)
 */

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { mat2d, vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'

// DI: createP5Pave2Riso を使って依存を注入
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

const { p2r, ot2pave } = createP5Pave2Riso({ Path, vec2 })

// mat2d はローカル変数として使用（p5.pave2riso の依存ではない）

let channels = []
let render
let font = null
let fontsReady = false

// Grid configuration
const GRID_COLS = 2  // 2 effects per row
const GRID_ROWS = 6  // 3 strokes × 2 rows each
const CELL_WIDTH = 500
const LABEL_HEIGHT = 80
const CONTENT_HEIGHT = 450
const CELL_HEIGHT = LABEL_HEIGHT + CONTENT_HEIGHT
const CANVAS_WIDTH = CELL_WIDTH * GRID_COLS   // 1000
const CANVAS_HEIGHT = CELL_HEIGHT * GRID_ROWS  // 3180
const FONT_SIZE = 320
const STROKE_WEIGHT = 36

// Effect labels
const EFFECTS = ['no effect', 'blur filter', 'halftone', 'blur + halftone']

// Stroke types
const STROKE_TYPES = ['solid', 'pattern', 'gradient']

// Helper function to generate a character path at a given position
const getCharPath = (char, x, y, fontSize) => {
  if (!font) return null
  const pathData = font.getPath(char, 0, 0, fontSize)
  let path = ot2pave(pathData.commands)

  // Center the character at (x, y)
  const bounds = Path.bounds(path)
  const charWidth = bounds[1][0] - bounds[0][0]
  const charHeight = bounds[1][1] - bounds[0][1]
  const offsetX = x - bounds[0][0] - charWidth / 2
  const offsetY = y - bounds[0][1] - charHeight / 2

  path = Path.transform(path, mat2d.fromTranslation([offsetX, offsetY]))

  return path
}

window.preload = () => {
  // Load font using opentype.load
  opentype.load('../fonts/Zen_Maru_Gothic/ZenMaruGothic-Black.ttf', function (err, loadedFont) {
    if (err) {
      console.error('Font load failed: ' + err)
      return
    }
    font = loadedFont
    console.log('Font loaded')
  })
}

window.setup = () => {
  noLoop()
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
  pixelDensity(1)

  // Initialize Riso channels
  channels = [
    new Riso('aqua'),
    new Riso('orange'),
    new Riso('fluorescentpink')
  ]

  // Expose channels globally for common.js export functionality
  window.risoChannels = channels

  // p2r factory - bind channels and canvas size once
  render = p2r({
    channels,
    canvasSize: [CANVAS_WIDTH, CANVAS_HEIGHT]
  })

  // Wait for font to load
  if (!font) {
    setTimeout(() => {
      if (font) {
        fontsReady = true
        redraw()
      }
    }, 1000)
    return
  }

  fontsReady = true
}

window.draw = () => {
  if (!fontsReady || !font) return

  background(255)
  channels.forEach(ch => ch.clear())

  // ====== MAIN GRID ======
  drawMainGrid()

  // ====== DRAW LABELS ======
  drawLabels()

  drawRiso()
}

/**
 * Draw labels for grid
 * Layout: 2 cols × 6 rows
 * Row 0-1: solid (effects 0-1, 2-3)
 * Row 2-3: pattern (effects 0-1, 2-3)
 * Row 4-5: gradient (effects 0-1, 2-3)
 */
function drawLabels() {
  push()
  fill(0)
  noStroke()
  textFont('sans-serif')

  textAlign(CENTER, TOP)
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const x = col * CELL_WIDTH + CELL_WIDTH / 2
      const y = row * CELL_HEIGHT + 12
      const strokeTypeIndex = Math.floor(row / 2)  // 0,0,1,1,2,2
      const effectIndex = (row % 2) * 2 + col       // 0,1,2,3,0,1,2,3,...
      const strokeType = STROKE_TYPES[strokeTypeIndex]
      const effect = EFFECTS[effectIndex]

      // Line 1: stroke type
      textSize(20)
      text(`${strokeType} stroke`, x, y)

      // Line 2: effect
      textSize(16)
      text(effect, x, y + 28)
    }
  }

  pop()
}

/**
 * Draw main grid
 * Layout: 2 cols × 6 rows
 * Row 0-1: solid (effects 0-1, 2-3)
 * Row 2-3: pattern (effects 0-1, 2-3)
 * Row 4-5: gradient (effects 0-1, 2-3)
 */
function drawMainGrid() {
  const RECT_SIZE = 380
  const RECT_MARGIN_X = (CELL_WIDTH - RECT_SIZE) / 2
  const RECT_MARGIN_Y = (CONTENT_HEIGHT - RECT_SIZE) / 2

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const contentTop = row * CELL_HEIGHT + LABEL_HEIGHT
      const x = col * CELL_WIDTH + CELL_WIDTH / 2
      const y = contentTop + CONTENT_HEIGHT / 2
      const strokeTypeIndex = Math.floor(row / 2)  // 0,0,1,1,2,2
      const effectType = (row % 2) * 2 + col       // 0,1,2,3,0,1,2,3,...
      const strokeType = STROKE_TYPES[strokeTypeIndex]

      // 1. Draw background rectangle
      const rectX = col * CELL_WIDTH + RECT_MARGIN_X
      const rectY = contentTop + RECT_MARGIN_Y
      const rectPath = Path.rect([rectX, rectY], [rectX + RECT_SIZE, rectY + RECT_SIZE])

      render({
        path: rectPath,
        fill: { type: 'solid', channelVals: [0, 0, 60] },
        mode: 'overprint'
      })

      // 2. Draw character path with stroke
      const charPath = getCharPath('ぷ', x, y, FONT_SIZE)
      if (!charPath) continue

      // Get stroke config with effect
      const stroke = getStrokeConfig(strokeType, effectType)

      render({
        path: charPath,
        fill: { type: 'solid', channelVals: [40, 0, 0] },
        stroke,
        mode: 'overprint'
      })
    }
  }
}

/**
 * Get stroke configuration based on type and effect
 */
function getStrokeConfig(strokeType, effectType) {
  // Base effect config
  let filter = null
  let halftone = null

  if (effectType === 1) {
    // Blur filter
    filter = { filterType: 'blur', filterArgs: [10] }
  } else if (effectType === 2) {
    // Halftone (shape, size, angle, threshold)
    halftone = { halftoneArgs: ['circle', 3, 45, 150] }
  } else if (effectType === 3) {
    // Blur + Halftone combination
    filter = { filterType: 'blur', filterArgs: [10] }
    halftone = { halftoneArgs: ['circle', 3, 45, 150] }
  }

  if (strokeType === 'solid') {
    return {
      type: 'solid',
      strokeWeight: STROKE_WEIGHT,
      channelVals: [0, 100, 0],
      strokeCap: 'round',
      strokeJoin: 'round',
      filter,
      halftone
    }
  } else if (strokeType === 'pattern') {
    return {
      type: 'pattern',
      strokeWeight: STROKE_WEIGHT,
      channelVals: [0, 100, 0],
      PTN: 'stripe',
      patternArgs: [5],
      patternAngle: 45,
      strokeCap: 'round',
      strokeJoin: 'round',
      filter,
      halftone
    }
  } else if (strokeType === 'gradient') {
    return {
      type: 'gradient',
      strokeWeight: STROKE_WEIGHT,
      gradientType: 'linear',
      colorStops: [
        { channel: 1, stops: [{ position: 0, depth: 100 }, { position: 100, depth: 20 }] }
      ],
      strokeCap: 'round',
      strokeJoin: 'round',
      filter,
      halftone
    }
  }

  return {
    type: 'solid',
    strokeWeight: STROKE_WEIGHT,
    channelVals: [0, 100, 0]
  }
}
