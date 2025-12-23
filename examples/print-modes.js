import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

const { p2r } = createP5Pave2Riso({ Path, vec2 })

let channels = []
let render

const CANVAS_WIDTH = 1200
const CANVAS_HEIGHT = 500
const COLS = 3
const COL_WIDTH = CANVAS_WIDTH / COLS

window.setup = () => {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
  pixelDensity(1)

  channels = [
    new Riso('red'),
    new Riso('blue')
  ]
  window.risoChannels = channels // for export

  render = p2r({
    channels,
    canvasSize: [CANVAS_WIDTH, CANVAS_HEIGHT]
  })

  noLoop()
}

window.draw = () => {
  background(255)
  channels.forEach(ch => ch.clear())

  const modes = ['overprint', 'cutout', 'join']
  const centerY = CANVAS_HEIGHT / 2 + 30
  const radius = 120
  const offset = 60

  modes.forEach((mode, i) => {
    const centerX = COL_WIDTH * (i + 0.5)

    // Red (left)
    const circle1 = Path.circle([centerX - offset, centerY], radius)
    render({
      path: circle1,
      fill: {
        type: 'solid',
        channelVals: [100, 0]
      },
      stroke: null,
      mode: mode
    })

    // Blue (right)
    const circle2 = Path.circle([centerX + offset, centerY], radius)
    render({
      path: circle2,
      fill: {
        type: 'pattern',
        PTN: 'stripe',
        patternAngle: 45,
        patternArgs: [20],
        channelVals: [0, 50]
      },
      stroke: null,
      mode: mode
    })
  })

  drawLabels()
  drawRiso()
  if (window.updatePlatesPreview) window.updatePlatesPreview()
}

function drawLabels() {
  push()
  fill(60)
  noStroke()
  textFont('sans-serif')
  textAlign(CENTER, TOP)

  const modes = ['overprint', 'cutout', 'join']
  const descriptions = [
    'Inks mix where they overlap',
    'Shape cuts through layers below',
    'Removes based on fill style'
  ]

  modes.forEach((mode, i) => {
    const x = COL_WIDTH * (i + 0.5)

    textSize(24)
    textStyle(BOLD)
    text(mode, x, 20)

    textSize(14)
    textStyle(NORMAL)
    text(descriptions[i], x, 50)
  })

  pop()
}
