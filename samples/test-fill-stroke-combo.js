/**
 * Fill + Stroke Combo Test
 *
 * Tests combinations of pattern/gradient fills with pattern/gradient strokes
 * to verify proper rendering when both complex fill and stroke are used.
 *
 * Grid Layout:
 * - Columns: overprint, cutout, join
 * - Rows: 12 fill×stroke combinations
 *   - stripe fill + stripe stroke
 *   - dot fill + wave stroke
 *   - cross fill + dot stroke
 *   - linear grad fill + linear grad stroke
 *   - radial grad fill + radial grad stroke
 *   - conic grad fill + conic grad stroke
 *   - stripe fill + linear grad stroke
 *   - dot fill + radial grad stroke
 *   - linear grad fill + stripe stroke
 *   - radial grad fill + wave stroke
 *   - stripe fill + dashed stripe stroke
 *   - radial grad fill + dashed grad stroke
 */

import { Path, Distort } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { mat2d, vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

// Create p5.pave2riso instance with dependencies
const { p2r, ot2pave } = createP5Pave2Riso({ Path, vec2 })

// mat2d and Distort are used locally (not p5.pave2riso dependencies)

let channels = []
let render
let font = null
let fontsReady = false

// Grid configuration
const GRID_COLS = 3  // overprint, cutout, join
const GRID_ROWS = 12  // 12 fill×stroke combinations
const CELL_WIDTH = 400
const LABEL_HEIGHT = 80  // ラベル用の高さ（3行分）
const CONTENT_HEIGHT = 350  // コンテンツ用の高さ
const CELL_HEIGHT = LABEL_HEIGHT + CONTENT_HEIGHT
const CANVAS_WIDTH = CELL_WIDTH * GRID_COLS   // 1200
const CANVAS_HEIGHT = CELL_HEIGHT * GRID_ROWS  // 5160
const FONT_SIZE = 280
const STROKE_WEIGHT = 16

// Mode labels
const MODES = ['overprint', 'cutout', 'join']

// Fill × Stroke combinations
const COMBO_CONFIGS = [
  // Basic pattern × pattern
  {
    label: 'stripe fill + stripe stroke',
    fill: { type: 'pattern', PTN: 'stripe', args: [6], angle: 45 },
    stroke: { type: 'pattern', PTN: 'stripe', args: [4], angle: -45 }
  },
  // Dot pattern × wave pattern
  {
    label: 'dot fill + wave stroke',
    fill: { type: 'pattern', PTN: 'dot', args: [10, 8], angle: 0 },
    stroke: { type: 'pattern', PTN: 'wave', args: [12, 2.5], angle: 0 }
  },
  // Cross pattern × dot pattern
  {
    label: 'cross fill + dot stroke',
    fill: { type: 'pattern', PTN: 'cross', args: [8, 2], angle: 0 },
    stroke: { type: 'pattern', PTN: 'dot', args: [6, 5], angle: 0 }
  },
  // Linear gradient × linear gradient
  {
    label: 'linear grad fill + linear grad stroke',
    fill: { type: 'gradient', gradientType: 'linear' },
    stroke: { type: 'gradient', gradientType: 'linear' }
  },
  // Radial gradient × radial gradient
  {
    label: 'radial grad fill + radial grad stroke',
    fill: { type: 'gradient', gradientType: 'radial' },
    stroke: { type: 'gradient', gradientType: 'radial' }
  },
  // Conic gradient × conic gradient
  {
    label: 'conic grad fill + conic grad stroke',
    fill: { type: 'gradient', gradientType: 'conic' },
    stroke: { type: 'gradient', gradientType: 'conic' }
  },
  // Pattern fill × linear gradient stroke
  {
    label: 'stripe fill + linear grad stroke',
    fill: { type: 'pattern', PTN: 'stripe', args: [8], angle: 0 },
    stroke: { type: 'gradient', gradientType: 'linear' }
  },
  // Pattern fill × radial gradient stroke
  {
    label: 'dot fill + radial grad stroke',
    fill: { type: 'pattern', PTN: 'dot', args: [12, 10], angle: 0 },
    stroke: { type: 'gradient', gradientType: 'radial' }
  },
  // Linear gradient fill × pattern stroke
  {
    label: 'linear grad fill + stripe stroke',
    fill: { type: 'gradient', gradientType: 'linear' },
    stroke: { type: 'pattern', PTN: 'stripe', args: [5], angle: 90 }
  },
  // Radial gradient fill × pattern stroke
  {
    label: 'radial grad fill + wave stroke',
    fill: { type: 'gradient', gradientType: 'radial' },
    stroke: { type: 'pattern', PTN: 'wave', args: [10, 2.0], angle: 45 }
  },
  // Dashed pattern stroke
  {
    label: 'stripe fill + dashed stripe stroke',
    fill: { type: 'pattern', PTN: 'stripe', args: [6], angle: 30 },
    stroke: { type: 'pattern', PTN: 'stripe', args: [4], angle: -30, dashed: true }
  },
  // Dashed gradient stroke
  {
    label: 'radial grad fill + dashed grad stroke',
    fill: { type: 'gradient', gradientType: 'radial' },
    stroke: { type: 'gradient', gradientType: 'linear', dashed: true }
  }
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

  path = Path.transform(path, mat2d.fromTranslation([offsetX, offsetY]))

  // Apply light twirl effect
  const radius = Math.max(charWidth, charHeight) * 0.6
  path = Path.distort(path, Distort.twirl([x, y], radius, 25, t => t * t * (3 - 2 * t)))

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

  // Initialize Riso channels (Aqua, Orange, Fluorescent Pink)
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
 * Draw labels for grid (above each cell, 3 lines)
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
      const y = row * CELL_HEIGHT + 12
      const comboConfig = COMBO_CONFIGS[row]
      const mode = MODES[col]

      // Line 1: mode
      textSize(18)
      text(mode, x, y)

      // Line 2-3: fill + stroke combo
      textSize(14)
      text(comboConfig.label, x, y + 24)
    }
  }

  pop()
}

/**
 * Draw main grid (combo configs × modes)
 * Using "R" character for good visibility
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
      const comboConfig = COMBO_CONFIGS[row]

      // 1. Draw background rectangle (yellow channel, 80%)
      const rectX = col * CELL_WIDTH + RECT_MARGIN_X
      const rectY = contentTop + RECT_MARGIN_Y
      const rectPath = Path.rect([rectX, rectY], [rectX + RECT_SIZE, rectY + RECT_SIZE])

      render({
        path: rectPath,
        fill: { type: 'solid', channelVals: [0, 0, 70] },  // Fluorescent Pink background
        mode: 'overprint'
      })

      // 2. Draw character path with fill + stroke combo
      const charPath = getCharPath('ぱ', x, y, FONT_SIZE)
      if (!charPath) continue

      // Get fill config
      const fill = getFillConfig(comboConfig.fill)

      // Get stroke config
      const stroke = getStrokeConfig(comboConfig.stroke)

      render({
        path: charPath,
        fill,
        stroke,
        mode
      })
    }
  }
}

/**
 * Get fill configuration based on config object
 */
function getFillConfig(fillConfig) {
  if (fillConfig.type === 'pattern') {
    return {
      type: 'pattern',
      channelVals: [100, 0, 0],  // Hunter Green channel
      PTN: fillConfig.PTN,
      patternArgs: fillConfig.args,
      patternAngle: fillConfig.angle
    }
  } else if (fillConfig.type === 'gradient') {
    return {
      type: 'gradient',
      gradientType: fillConfig.gradientType,
      colorStops: [
        { channel: 0, stops: [{ position: 0, depth: 100 }, { position: 100, depth: 15 }] }
      ]
    }
  }

  return { type: 'solid', channelVals: [100, 0, 0] }
}

/**
 * Get stroke configuration based on config object
 */
function getStrokeConfig(strokeConfig) {
  if (strokeConfig.type === 'pattern') {
    const config = {
      type: 'pattern',
      strokeWeight: STROKE_WEIGHT,
      channelVals: [0, 100, 0],  // Orange channel
      PTN: strokeConfig.PTN,
      patternArgs: strokeConfig.args,
      patternAngle: strokeConfig.angle,
      strokeCap: 'round',
      strokeJoin: 'round'
    }
    if (strokeConfig.dashed) {
      config.dashArgs = [40, 18, 8, 18, 20, 18]  // irregular rhythm, wider gaps
    }
    return config
  } else if (strokeConfig.type === 'gradient') {
    const config = {
      type: 'gradient',
      strokeWeight: STROKE_WEIGHT,
      gradientType: strokeConfig.gradientType,
      colorStops: [
        { channel: 1, stops: [{ position: 0, depth: 100 }, { position: 100, depth: 5 }] }
      ],
      strokeCap: 'round',
      strokeJoin: 'round'
    }
    if (strokeConfig.dashed) {
      config.dashArgs = [25, 15, 5, 15, 15, 15, 10, 15]  // irregular rhythm, wider gaps
    }
    return config
  }

  return {
    type: 'solid',
    strokeWeight: STROKE_WEIGHT,
    channelVals: [0, 100, 0]
  }
}
