// Remove Holes Example
// Demonstrates PathRemoveHoles() to fill holes after PathOffset

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import paper from 'https://cdn.jsdelivr.net/npm/paper@0.12.4/+esm'
import { PaperOffset } from 'https://cdn.jsdelivr.net/npm/paperjs-offset@1.0.8/+esm'
import opentype from 'https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/+esm'
import { createP5Pave2Riso, ot2pave, PathOffset, PathRemoveHoles } from '../dist/p5.pave2riso.js'

// Create p2r factory with dependency injection
const { p2r } = createP5Pave2Riso({ Path, vec2, paper, PaperOffset })

let channels = []
let render
let font = null

const CANVAS_WIDTH = 1200
const CANVAS_HEIGHT = 500
const OFFSET_AMOUNT = 19

window.setup = () => {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
  pixelDensity(1)

  // Initialize Riso channels
  channels = [
    new Riso('blue'),
    new Riso('red')
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
    const fontUrl = '../fonts/Zen_Maru_Gothic/ZenMaruGothic-Black.ttf'
    const response = await fetch(fontUrl)
    const arrayBuffer = await response.arrayBuffer()
    font = opentype.parse(arrayBuffer)

    console.log('Font loaded:', font.names.fontFamily)
    drawComparison()
  } catch (error) {
    console.error('Font loading error:', error)
    background(255)
    fill(255, 0, 0)
    textSize(24)
    textAlign(CENTER, CENTER)
    text('Font loading failed. Check console.', width / 2, height / 2)
  }
}

function drawComparison() {
  background(255)
  channels.forEach(ch => ch.clear())

  const fontSize = 140
  const centerY = CANVAS_HEIGHT / 2 + fontSize * 0.3
  const textString = 'oOeQ'

  // Left side: PathOffset with holes (Blue)
  drawTextWithOffset(textString, 60, centerY, fontSize, false, 0)

  // Right side: PathOffset + PathRemoveHoles (Red)
  drawTextWithOffset(textString, CANVAS_WIDTH / 2 + 60, centerY, fontSize, true, 1)

  // Draw labels
  drawLabels()

  drawRiso()
  if (window.updatePlatesPreview) window.updatePlatesPreview()
}

function drawTextWithOffset(text, startX, y, fontSize, removeHoles, channelIndex) {
  let x = startX

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const glyph = font.charToGlyph(char)
    const glyphPath = glyph.getPath(x, y, fontSize)

    // Convert OpenType to Pave
    let pavePath = ot2pave(glyphPath.commands)

    // Apply offset
    pavePath = PathOffset(pavePath, OFFSET_AMOUNT, {join: 'round'})

    // Remove holes if enabled
    if (removeHoles) {
      pavePath = PathRemoveHoles(pavePath)
    }

    // Render
    const channelVals = [0, 0]
    channelVals[channelIndex] = 100

    render({
      path: pavePath,
      fill: {
        type: 'solid',
        channelVals
      },
      stroke: null,
      mode: 'overprint'
    })

    x += glyph.advanceWidth * (fontSize / font.unitsPerEm)
  }
}

function drawLabels() {
  push()
  fill(80)
  noStroke()
  textFont('sans-serif')
  textSize(14)
  textAlign(LEFT, TOP)
  text('PathOffset() - Holes intact', 60, 30)
  text('PathOffset() + PathRemoveHoles() - Holes filled', CANVAS_WIDTH / 2 + 60, 30)

  // Divider line
  stroke(200)
  strokeWeight(1)
  line(CANVAS_WIDTH / 2, 60, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40)
  pop()
}
