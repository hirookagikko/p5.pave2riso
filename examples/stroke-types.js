/**
 * Stroke Types Example
 * Demonstrates the 4 stroke types available in p5.pave2riso
 */

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

// Create p2r factory with dependency injection (no globals needed!)
const { p2r } = createP5Pave2Riso({ Path, vec2 })

// Canvas configuration
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 800
const STROKE_WEIGHT = 8

let channels = []
let render

// Layout: 2x2 grid
const COLS = 2
const ROWS = 2
const CELL_WIDTH = CANVAS_WIDTH / COLS
const CELL_HEIGHT = CANVAS_HEIGHT / ROWS
const SHAPE_RADIUS = 120

window.setup = () => {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
  pixelDensity(1)
  noLoop()

  // Initialize Riso channels
  channels = [
    new Riso('red'),
    new Riso('blue'),
    new Riso('yellow'),
    new Riso('green')
  ]

  // Expose channels globally for export functionality
  window.risoChannels = channels

  // Create p2r factory with bound channels and canvas size
  render = p2r({
    channels,
    canvasSize: [CANVAS_WIDTH, CANVAS_HEIGHT]
  })
}

window.draw = () => {
  background(255)
  channels.forEach(ch => ch.clear())

  // 1. SOLID STROKE - Red channel (top-left)
  const circle1 = Path.circle([CELL_WIDTH * 0.5, CELL_HEIGHT * 0.5], SHAPE_RADIUS)
  render({
    path: circle1,
    fill: null,
    stroke: {
      type: 'solid',
      strokeWeight: STROKE_WEIGHT,
      channelVals: [100, 0, 0, 0], // Red only
      strokeCap: 'round',
      strokeJoin: 'round'
    },
    mode: 'overprint'
  })

  // 2. DASHED STROKE - Blue channel (top-right)
  const circle2 = Path.circle([CELL_WIDTH * 1.5, CELL_HEIGHT * 0.5], SHAPE_RADIUS)
  render({
    path: circle2,
    fill: null,
    stroke: {
      type: 'dashed',
      strokeWeight: STROKE_WEIGHT,
      channelVals: [0, 100, 0, 0], // Blue only
      dashArgs: [20, 10], // 20px dash, 10px gap
      strokeCap: 'round',
      strokeJoin: 'round'
    },
    mode: 'overprint'
  })

  // 3. PATTERN STROKE - Yellow channel (bottom-left)
  const circle3 = Path.circle([CELL_WIDTH * 0.5, CELL_HEIGHT * 1.5], SHAPE_RADIUS)
  render({
    path: circle3,
    fill: null,
    stroke: {
      type: 'pattern',
      strokeWeight: STROKE_WEIGHT * 2, // Thicker to show pattern better
      channelVals: [0, 0, 100, 0], // Yellow only
      PTN: 'dot',
      patternArgs: [6], // 6px dot size
      strokeCap: 'round',
      strokeJoin: 'round'
    },
    mode: 'overprint'
  })

  // 4. GRADIENT STROKE - Green channel (bottom-right)
  const circle4 = Path.circle([CELL_WIDTH * 1.5, CELL_HEIGHT * 1.5], SHAPE_RADIUS)
  render({
    path: circle4,
    fill: null,
    stroke: {
      type: 'gradient',
      strokeWeight: STROKE_WEIGHT,
      gradientType: 'linear',
      colorStops: [
        {
          channel: 3, // Green channel
          stops: [
            { position: 0, depth: 100 },
            { position: 50, depth: 20 },
            { position: 100, depth: 100 }
          ]
        }
      ],
      strokeCap: 'round',
      strokeJoin: 'round'
    },
    mode: 'overprint'
  })

  // Add labels for each stroke type
  drawLabels()

  // Render all channels
  drawRiso()
}

/**
 * Draw labels for each stroke type
 */
function drawLabels() {
  push()
  fill(60)
  noStroke()
  textAlign(CENTER, TOP)
  textSize(16)
  textFont('Inter, sans-serif')

  const labels = [
    '1. SOLID STROKE',
    '2. DASHED STROKE',
    '3. PATTERN STROKE',
    '4. GRADIENT STROKE'
  ]

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const index = row * COLS + col
      const x = col * CELL_WIDTH + CELL_WIDTH / 2
      const y = row * CELL_HEIGHT + 20
      text(labels[index], x, y)
    }
  }

  pop()
}
