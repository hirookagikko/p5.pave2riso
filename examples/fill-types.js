/**
 * Fill Types Example
 *
 * Demonstrates the 4 fill types available in p5.pave2riso:
 * 1. Solid - Simple ink density
 * 2. Pattern - Procedural patterns using p5.pattern
 * 3. Gradient - Linear/radial/conic gradients
 * 4. Image - External image fills with grayscale mapping
 */

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

// Create p2r factory with dependency injection (no globals needed!)
const { p2r } = createP5Pave2Riso({ Path, vec2 })

let channels = []
let render
let testImage

// Preload external image for Image Fill demo
window.preload = function() {
  testImage = loadImage('../img/turing-pattern.png')
}

// Canvas configuration
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 800
const GRID_SIZE = 2 // 2x2 grid
const CELL_SIZE = CANVAS_WIDTH / GRID_SIZE
const PADDING = 60
const SHAPE_SIZE = CELL_SIZE - PADDING * 2

// Create a rounded rectangle path using Path.rect + Path.fillet
function createRoundedRect(x, y, w, h, r) {
  // Create a regular rectangle
  const rect = Path.rect([x, y], [x + w, y + h])
  // Apply fillet to round all corners
  return Path.fillet(rect, r)
}

window.setup = function() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
  pixelDensity(1)
  noLoop()

  // Initialize Riso channels
  channels = [
    new Riso('blue'),
    new Riso('red'),
    new Riso('yellow')
  ]

  // Expose channels globally for export functionality
  window.risoChannels = channels

  // Create p2r factory
  render = p2r({
    channels,
    canvasSize: [CANVAS_WIDTH, CANVAS_HEIGHT]
  })
}

window.draw = function() {
  background(255)
  channels.forEach(ch => ch.clear())

  // Draw labels
  drawLabels()

  // 2x2 grid of fill types
  // Top-left: Solid fill
  drawSolidFill(0, 0)

  // Top-right: Pattern fill
  drawPatternFill(1, 0)

  // Bottom-left: Gradient fill
  drawGradientFill(0, 1)

  // Bottom-right: Image fill
  drawImageFill(1, 1)

  // Render all channels
  drawRiso()

  // Update plates preview
  if (window.updatePlatesPreview) window.updatePlatesPreview()
}

function drawLabels() {
  push()
  fill(0)
  noStroke()
  textAlign(CENTER, BOTTOM)
  textSize(18)
  textFont('Inter, sans-serif')

  const labelY = CANVAS_HEIGHT - 20
  const labels = ['1. Solid', '2. Pattern', '3. Gradient', '4. Image']

  for (let i = 0; i < 4; i++) {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = col * CELL_SIZE + CELL_SIZE / 2
    const y = row * CELL_SIZE + CELL_SIZE - 20
    text(labels[i], x, y)
  }

  pop()
}

function drawSolidFill(col, row) {
  const x = col * CELL_SIZE + PADDING
  const y = row * CELL_SIZE + PADDING

  const path = createRoundedRect(x, y, SHAPE_SIZE, SHAPE_SIZE, 40)

  render({
    path,
    fill: {
      type: 'solid',
      channelVals: [100, 50, 0]  // Blue 100%, Red 50%, Yellow 0%
    },
    stroke: null,
    mode: 'overprint'
  })
}

function drawPatternFill(col, row) {
  const x = col * CELL_SIZE + PADDING
  const y = row * CELL_SIZE + PADDING

  const path = createRoundedRect(x, y, SHAPE_SIZE, SHAPE_SIZE, 40)

  render({
    path,
    fill: {
      type: 'pattern',
      PTN: 'stripe',           // Pattern name from p5.pattern
      patternArgs: [10],       // Pattern spacing
      patternAngle: 45,        // 45-degree angle
      channelVals: [0, 100, 0] // Red channel only
    },
    stroke: null,
    mode: 'overprint'
  })
}

function drawGradientFill(col, row) {
  const x = col * CELL_SIZE + PADDING
  const y = row * CELL_SIZE + PADDING

  const path = createRoundedRect(x, y, SHAPE_SIZE, SHAPE_SIZE, 40)

  render({
    path,
    fill: {
      type: 'gradient',
      gradientType: 'linear',
      gradientDirection: 'LR',  // Left to Right
      colorStops: [
        {
          channel: 0,  // Blue channel
          stops: [
            { position: 0, depth: 100 },   // 100% at left
            { position: 100, depth: 0 }    // 0% at right
          ]
        },
        {
          channel: 2,  // Yellow channel
          stops: [
            { position: 0, depth: 0 },     // 0% at left
            { position: 100, depth: 100 }  // 100% at right
          ]
        }
      ]
    },
    stroke: null,
    mode: 'overprint'
  })
}

function drawImageFill(col, row) {
  const x = col * CELL_SIZE + PADDING
  const y = row * CELL_SIZE + PADDING

  const path = createRoundedRect(x, y, SHAPE_SIZE, SHAPE_SIZE, 40)

  render({
    path,
    fill: {
      type: 'image',
      image: testImage,        // p5.Image object
      fit: 'cover',            // Fill the shape
      scale: 3,                // Zoom in to show detail
      alignX: 'center',        // Center horizontally
      alignY: 'middle',        // Center vertically
      channelVals: [0, 0, 100] // Yellow channel only
    },
    stroke: null,
    mode: 'overprint'
  })
}
