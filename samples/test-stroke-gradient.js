/**
 * Stroke Gradient Test
 *
 * Comprehensive test for gradient stroke with all strokeCap × strokeJoin combinations
 * Font paths show corner behavior better than circles
 *
 * Grid Layout:
 * - Columns: overprint, cutout, join
 * - Rows: strokeCap × strokeJoin combinations (3×3=9) for each gradient type
 *   - gradient: 9 combinations (rows 0-8)
 *   - dashed-gradient: 9 combinations (rows 9-17)
 *   Total: 18 rows
 */

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { mat2d, vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

// Initialize p5.pave2riso with dependencies
const { p2r, ot2pave } = createP5Pave2Riso({ Path, vec2 })

let channels = []
let render
let font = null
let fontsReady = false

// Grid configuration
const GRID_COLS = 3  // overprint, cutout, join
const GRID_ROWS = 18  // gradient × 9 + dashed-gradient × 9
const CELL_WIDTH = 400
const LABEL_HEIGHT = 60  // ラベル用の高さ（2行分）
const CONTENT_HEIGHT = 350  // コンテンツ用の高さ
const CELL_HEIGHT = LABEL_HEIGHT + CONTENT_HEIGHT
const CANVAS_WIDTH = CELL_WIDTH * GRID_COLS   // 1200
const CANVAS_HEIGHT = CELL_HEIGHT * GRID_ROWS  // 3690
const FONT_SIZE = 280
const STROKE_WEIGHT = 12

// Mode labels
const MODES = ['overprint', 'cutout', 'join']

// Cap and Join options
const CAPS = ['round', 'square', 'butt']
const JOINS = ['miter', 'bevel', 'round']

// Generate all cap × join combinations for a gradient stroke type
const generateCapJoinCombos = (strokeType) => {
  const combos = []
  for (const cap of CAPS) {
    for (const join of JOINS) {
      combos.push({
        type: strokeType,
        cap,
        join,
        labelLine1: strokeType,
        labelLine2: `${cap}×${join}`
      })
    }
  }
  return combos
}

// Stroke configurations for each row
const STROKE_CONFIGS = [
  // Gradient stroke - all cap × join combinations (9)
  ...generateCapJoinCombos('gradient'),
  // Dashed-gradient stroke - all cap × join combinations (9)
  ...generateCapJoinCombos('dashed-gradient')
]

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

  return Path.transform(path, mat2d.fromTranslation([offsetX, offsetY]))
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

  // Initialize Riso channels (Red, Green, Yellow)
  channels = [
    new Riso('red'),
    new Riso('green'),
    new Riso('yellow')
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

  // ====== MAIN GRID: 9 gradient configs × 3 modes ======
  drawMainGrid()

  // ====== DRAW LABELS ======
  drawLabels()

  drawRiso()
}

/**
 * Draw labels for grid (above each cell, 2 lines)
 */
function drawLabels() {
  push()
  fill(0)
  noStroke()
  textFont('sans-serif')

  // Draw labels above each cell
  textAlign(CENTER, TOP)
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const x = col * CELL_WIDTH + CELL_WIDTH / 2
      const y = row * CELL_HEIGHT + 20  // 1文字ぶん下げる
      const strokeConfig = STROKE_CONFIGS[row]
      const mode = MODES[col]

      // Line 1: stroke type + mode
      textSize(18)
      text(`${strokeConfig.labelLine1} / ${mode}`, x, y)

      // Line 2: cap×join (if exists)
      if (strokeConfig.labelLine2) {
        textSize(16)
        text(strokeConfig.labelLine2, x, y + 24)
      }
    }
  }

  pop()
}

/**
 * Draw main grid (gradient configs × modes)
 * Using "A" character for good corner visibility
 * Background rect + character path overlay to show mode effects
 */
function drawMainGrid() {
  const RECT_SIZE = 300  // Background rectangle size
  const RECT_MARGIN_X = (CELL_WIDTH - RECT_SIZE) / 2
  const RECT_MARGIN_Y = (CONTENT_HEIGHT - RECT_SIZE) / 2

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      // コンテンツ領域の中心（ラベル高さを考慮）
      const contentTop = row * CELL_HEIGHT + LABEL_HEIGHT
      const x = col * CELL_WIDTH + CELL_WIDTH / 2
      const y = contentTop + CONTENT_HEIGHT / 2
      const mode = MODES[col]
      const strokeConfig = STROKE_CONFIGS[row]

      // 1. Draw background rectangle (yellow channel, 80%)
      const rectX = col * CELL_WIDTH + RECT_MARGIN_X
      const rectY = contentTop + RECT_MARGIN_Y
      const rectPath = Path.rect([rectX, rectY], [rectX + RECT_SIZE, rectY + RECT_SIZE])

      render({
        path: rectPath,
        fill: { type: 'solid', channelVals: [0, 0, 80] },  // Yellow background
        mode: 'overprint'
      })

      // 2. Draw character path on top
      const charPath = getCharPath('A', x, y, FONT_SIZE)
      if (!charPath) continue

      // Character fill (red channel, 50%)
      const baseFill = { type: 'solid', channelVals: [50, 0, 0] }

      // Get gradient stroke config
      const stroke = getStrokeConfig(strokeConfig)

      render({
        path: charPath,
        fill: baseFill,
        stroke,
        mode
      })
    }
  }
}

/**
 * Get stroke configuration for each row
 */
function getStrokeConfig(config) {
  switch (config.type) {
    case 'gradient':
      return {
        type: 'gradient',
        strokeWeight: STROKE_WEIGHT,
        gradientType: 'linear',
        colorStops: [
          { channel: 1, stops: [{ position: 0, depth: 100 }, { position: 100, depth: 0 }] }
        ],
        strokeCap: config.cap,
        strokeJoin: config.join
      }

    case 'dashed-gradient':
      return {
        type: 'gradient',
        strokeWeight: STROKE_WEIGHT,
        gradientType: 'linear',
        colorStops: [
          { channel: 1, stops: [{ position: 0, depth: 100 }, { position: 100, depth: 0 }] }
        ],
        dashArgs: [40, 20],  // 40px line, 20px gap
        strokeCap: config.cap,
        strokeJoin: config.join
      }

    default:
      return null
  }
}
