// Effects Example
// Demonstrates filter, halftone, and combined effects

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

// Create p2r factory with dependency injection (no globals needed!)
const { p2r } = createP5Pave2Riso({ Path, vec2 })

let channels = []
let render

// Canvas and layout
const CANVAS_WIDTH = 1000
const CANVAS_HEIGHT = 800
const COLS = 2
const ROWS = 2
const CELL_WIDTH = CANVAS_WIDTH / COLS
const CELL_HEIGHT = CANVAS_HEIGHT / ROWS

window.setup = () => {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
  pixelDensity(1)

  // Initialize Riso channels
  channels = [
    new Riso('blue'),
    new Riso('orange'),
    new Riso('fluorescentpink')
  ]

  window.risoChannels = channels

  // p2r factory
  render = p2r({
    channels,
    canvasSize: [CANVAS_WIDTH, CANVAS_HEIGHT]
  })

  noLoop()
}

window.draw = () => {
  background(255)
  channels.forEach(ch => ch.clear())

  // Create base shape - a simple circle
  const createCircle = (centerX, centerY, radius) => {
    return Path.circle([centerX, centerY], radius)
  }

  // ======================
  // 1. No Effect (top-left)
  // ======================
  const circle1 = createCircle(
    CELL_WIDTH * 0.5,
    CELL_HEIGHT * 0.5,
    150
  )
  render({
    path: circle1,
    fill: {
      type: 'gradient',
      gradientType: 'radial',
      colorStops: [
        { channel: 0, stops: [{ position: 0, depth: 100 }, { position: 100, depth: 0 }] }
      ]
    },
    stroke: null,
    mode: 'overprint'
  })

  // ======================
  // 2. Filter Effect (top-right) - Blur
  // ======================
  const circle2 = createCircle(
    CELL_WIDTH * 1.5,
    CELL_HEIGHT * 0.5,
    150
  )
  render({
    path: circle2,
    fill: {
      type: 'gradient',
      gradientType: 'radial',
      colorStops: [
        { channel: 1, stops: [{ position: 0, depth: 100 }, { position: 100, depth: 0 }] }
      ]
    },
    stroke: null,
    // Filter effect: blur
    filter: { filterType: 'blur', filterArgs: [8] },
    mode: 'overprint'
  })

  // ======================
  // 3. Halftone Effect (bottom-left)
  // ======================
  const circle3 = createCircle(
    CELL_WIDTH * 0.5,
    CELL_HEIGHT * 1.5,
    150
  )
  render({
    path: circle3,
    fill: {
      type: 'gradient',
      gradientType: 'radial',
      colorStops: [
        { channel: 2, stops: [{ position: 0, depth: 100 }, { position: 100, depth: 0 }] }
      ]
    },
    stroke: null,
    // Halftone effect: (shape, size, angle, threshold)
    halftone: { halftoneArgs: ['circle', 4, 45, 128] },
    mode: 'overprint'
  })

  // ======================
  // 4. Combined Effects (bottom-right) - Blur + Halftone
  // ======================
  const circle4 = createCircle(
    CELL_WIDTH * 1.5,
    CELL_HEIGHT * 1.5,
    150
  )
  render({
    path: circle4,
    fill: {
      type: 'gradient',
      gradientType: 'radial',
      colorStops: [
        { channel: 0, stops: [{ position: 0, depth: 100 }, { position: 100, depth: 50 }] },
        { channel: 1, stops: [{ position: 0, depth: 50 }, { position: 100, depth: 100 }] }
      ]
    },
    stroke: null,
    // Combined effects
    filter: { filterType: 'blur', filterArgs: [5] },
    halftone: { halftoneArgs: ['circle', 3, 30, 128] },
    mode: 'overprint'
  })

  // Draw labels
  drawLabels()

  drawRiso()
}

function drawLabels() {
  push()
  fill(80)
  noStroke()
  textFont('sans-serif')
  textSize(18)
  textAlign(CENTER, TOP)

  const labels = [
    'No Effect',
    'Filter (blur)',
    'Halftone',
    'Blur + Halftone'
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
