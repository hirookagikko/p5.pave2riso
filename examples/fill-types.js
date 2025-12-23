import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

const { p2r } = createP5Pave2Riso({ Path, vec2 })

let channels = []
let render
let testImage

window.preload = function() {
  testImage = loadImage('../img/turing-pattern.png')
}

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 800
const GRID_SIZE = 2
const CELL_SIZE = CANVAS_WIDTH / GRID_SIZE
const PADDING = 60
const SHAPE_SIZE = CELL_SIZE - PADDING * 2

function createRoundedRect(x, y, w, h, r) {
  const rect = Path.rect([x, y], [x + w, y + h])
  return Path.fillet(rect, r)
}

window.setup = function() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
  pixelDensity(1)
  noLoop()

  channels = [
    new Riso('blue'),
    new Riso('red'),
    new Riso('yellow')
  ]
  window.risoChannels = channels // for export

  render = p2r({
    channels,
    canvasSize: [CANVAS_WIDTH, CANVAS_HEIGHT]
  })
}

window.draw = function() {
  background(255)
  channels.forEach(ch => ch.clear())

  drawLabels()
  drawSolidFill(0, 0)
  drawPatternFill(1, 0)
  drawGradientFill(0, 1)
  drawImageFill(1, 1)

  drawRiso()
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
      channelVals: [100, 50, 0] // B100% R50% Y0%
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
      PTN: 'stripe',
      patternArgs: [10],
      patternAngle: 45,
      channelVals: [0, 100, 0] // Red only
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
      gradientDirection: 'LR',
      colorStops: [
        {
          channel: 0, // Blue
          stops: [
            { position: 0, depth: 100 },
            { position: 100, depth: 0 }
          ]
        },
        {
          channel: 2, // Yellow
          stops: [
            { position: 0, depth: 0 },
            { position: 100, depth: 100 }
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
      image: testImage,
      fit: 'cover',
      scale: 2,
      alignX: 'center',
      alignY: 'middle',
      channelVals: [0, 0, 100] // Yellow only
    },
    stroke: null,
    mode: 'overprint'
  })
}
