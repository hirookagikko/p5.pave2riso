import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

const { p2r } = createP5Pave2Riso({ Path, vec2 })

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 800
const STROKE_WEIGHT = 8

let channels = []
let render

const COLS = 2
const ROWS = 2
const CELL_WIDTH = CANVAS_WIDTH / COLS
const CELL_HEIGHT = CANVAS_HEIGHT / ROWS
const SHAPE_RADIUS = 120

window.setup = () => {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
  pixelDensity(1)
  noLoop()

  channels = [
    new Riso('red'),
    new Riso('blue'),
    new Riso('yellow'),
    new Riso('green')
  ]
  window.risoChannels = channels // for export

  render = p2r({
    channels,
    canvasSize: [CANVAS_WIDTH, CANVAS_HEIGHT]
  })
}

window.draw = () => {
  background(255)
  channels.forEach(ch => ch.clear())

  // Solid
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

  // Dashed
  const circle2 = Path.circle([CELL_WIDTH * 1.5, CELL_HEIGHT * 0.5], SHAPE_RADIUS)
  render({
    path: circle2,
    fill: null,
    stroke: {
      type: 'dashed',
      strokeWeight: STROKE_WEIGHT,
      channelVals: [0, 100, 0, 0], // Blue only
      dashArgs: [20, 10], // dash, gap
      strokeCap: 'round',
      strokeJoin: 'round'
    },
    mode: 'overprint'
  })

  // Pattern
  const circle3 = Path.circle([CELL_WIDTH * 0.5, CELL_HEIGHT * 1.5], SHAPE_RADIUS)
  render({
    path: circle3,
    fill: null,
    stroke: {
      type: 'pattern',
      strokeWeight: STROKE_WEIGHT * 2,
      channelVals: [0, 0, 100, 0], // Yellow only
      PTN: 'stripe',
      patternAngle: 45,
      patternArgs: [20],
      strokeCap: 'round',
      strokeJoin: 'round'
    },
    mode: 'overprint'
  })

  // Gradient
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
          channel: 3, // Green
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

  drawLabels()
  drawRiso()
  if (window.updatePlatesPreview) window.updatePlatesPreview()
}

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
