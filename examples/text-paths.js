// Text Paths Example
// Converting OpenType fonts to vector paths for Risograph printing

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import opentype from 'https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/+esm'
import { createP5Pave2Riso, ot2pave } from '../dist/p5.pave2riso.js'

// Create p2r factory with dependency injection (no globals needed!)
const { p2r } = createP5Pave2Riso({ Path, vec2 })

let channels = []
let render
let font = null

const CANVAS_WIDTH = 1000
const CANVAS_HEIGHT = 500

window.setup = () => {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
  pixelDensity(1)

  // Initialize Riso channels
  channels = [
    new Riso('blue'),
    new Riso('red'),
    new Riso('yellow')
  ]

  window.risoChannels = channels

  // p2r factory
  render = p2r({
    channels,
    canvasSize: [CANVAS_WIDTH, CANVAS_HEIGHT]
  })

  // Load font and draw
  loadFontAndDraw()
}

async function loadFontAndDraw() {
  try {
    // Step 1: Load font using OpenType.js
    const fontUrl = '../fonts/Zen_Maru_Gothic/ZenMaruGothic-Black.ttf'
    const response = await fetch(fontUrl)
    const arrayBuffer = await response.arrayBuffer()
    font = opentype.parse(arrayBuffer)

    console.log('Font loaded:', font.names.fontFamily)

    // Draw once font is ready
    drawText()
  } catch (error) {
    console.error('Font loading error:', error)
    background(255)
    fill(255, 0, 0)
    textSize(24)
    textAlign(CENTER, CENTER)
    text('Font loading failed. Check console.', width / 2, height / 2)
  }
}

function drawText() {
  background(255)
  channels.forEach(ch => ch.clear())

  const fontSize = 200
  const centerY = CANVAS_HEIGHT / 2 + fontSize * 0.3

  // Text to render
  const textString = 'RISO'
  let x = 100

  // Step 2 & 3: Convert each character to Pave path
  for (let i = 0; i < textString.length; i++) {
    const char = textString[i]

    // Get glyph and its path
    const glyph = font.charToGlyph(char)
    const glyphPath = glyph.getPath(x, centerY, fontSize)

    // Convert OpenType commands to Pave path
    const pavePath = ot2pave(glyphPath.commands)

    // Step 4: Render with p2r
    // Alternate colors for visual interest
    const colorIndex = i % 3
    const colors = [
      [100, 0, 50],   // Blue + Yellow
      [50, 100, 0],   // Blue + Red
      [0, 50, 100]    // Red + Yellow
    ]

    render({
      path: pavePath,
      fill: {
        type: 'solid',
        channelVals: colors[colorIndex]
      },
      stroke: null,
      mode: 'overprint'
    })

    // Advance x position based on character width
    x += glyph.advanceWidth * (fontSize / font.unitsPerEm)
  }

  // Draw workflow label
  drawLabel()

  drawRiso()
}

function drawLabel() {
  push()
  fill(80)
  noStroke()
  textFont('sans-serif')
  textSize(14)
  textAlign(LEFT, TOP)
  text('OpenType.js → ot2pave() → p2r()', 20, 20)
  pop()
}
