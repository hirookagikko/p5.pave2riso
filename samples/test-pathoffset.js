/**
 * PathOffset Test
 *
 * Simple demonstration of PathOffset function
 * Shows offset applied to rectangle, circle, star, and text shapes
 */

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { mat2d, vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'
import paper from 'https://cdn.jsdelivr.net/npm/paper@0.12.4/+esm'
import { PaperOffset } from 'https://cdn.jsdelivr.net/npm/paperjs-offset@1.0.8/+esm'

const { p2r, PathOffset, ot2pave } = createP5Pave2Riso({ Path, vec2, paper, PaperOffset })

let channels = []
let render
let font = null

// ============================================
// Configuration
// ============================================
const offsetAmount = 50       // Offset distance in pixels
const offsetLayers = 5        // Number of offset layers
const showOriginal = true     // Show original path

// ============================================
// Helper: Create a star path
// ============================================
const createStar = (cx, cy, outerR, innerR, points) => {
  const vertices = []
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    vertices.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
  }
  return Path.polygon(...vertices)
}

// ============================================
// Helper: Get character path from font
// ============================================
const getCharPath = (char, fontSize) => {
  if (!font) return null

  const pathData = font.getPath(char, 0, 0, fontSize)
  if (!pathData.commands || pathData.commands.length === 0) return null

  return ot2pave(pathData.commands)
}

// ============================================
// Preload: Load font
// ============================================
window.preload = async () => {
  if (!window.opentype) {
    console.error('opentype.js is not loaded')
    return
  }

  const fontPath = '../fonts/Zen_Antique_Soft/ZenAntiqueSoft-Regular.ttf'

  try {
    const response = await fetch(fontPath)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const buffer = await response.arrayBuffer()
    font = window.opentype.parse(buffer)
    console.log('Font loaded')
  } catch (err) {
    console.error('Font load failed:', err)
  }
}

// ============================================
// Setup
// ============================================
window.setup = () => {
  createCanvas(3508, 2480)
  pixelDensity(1)
  noLoop()

  channels = [
    new Riso('blue'),
    new Riso('red'),
    new Riso('yellow')
  ]
  window.risoChannels = channels

  render = p2r({
    channels,
    canvasSize: [width, height]
  })

  // Wait for font to load
  if (!font) {
    setTimeout(() => {
      if (font) redraw()
    }, 500)
  }
}

// ============================================
// Draw
// ============================================
window.draw = () => {
  background(255)
  channels.forEach(ch => ch.clear())

  const margin = 150
  // 2x2 grid layout
  const cellW = (width - margin * 2) / 2
  const cellH = (height - margin * 2) / 2

  // Grid positions (center of each cell)
  const positions = [
    { x: margin + cellW * 0.5, y: margin + cellH * 0.5 },  // Top-left
    { x: margin + cellW * 1.5, y: margin + cellH * 0.5 },  // Top-right
    { x: margin + cellW * 0.5, y: margin + cellH * 1.5 },  // Bottom-left
    { x: margin + cellW * 1.5, y: margin + cellH * 1.5 }   // Bottom-right
  ]

  // ============================================
  // Test 1: Rectangle with offset (miter join)
  // ============================================
  const rectPos = positions[0]
  const rectW = 350
  const rectH = 280
  let rectPath = Path.rect(
    [rectPos.x - rectW / 2, rectPos.y - rectH / 2],
    [rectPos.x + rectW / 2, rectPos.y + rectH / 2]
  )

  for (let i = offsetLayers; i >= 1; i--) {
    const offsetPath = PathOffset(rectPath, offsetAmount * i, { join: 'miter' })
    const alpha = Math.round(100 * (1 - i / (offsetLayers + 1)))
    render({
      path: offsetPath,
      fill: { type: 'solid', channelVals: [alpha, 0, 0] },
      mode: 'join'
    })
  }

  if (showOriginal) {
    render({
      path: rectPath,
      fill: { type: 'solid', channelVals: [100, 0, 0] },
      mode: 'join'
    })
  }

  // ============================================
  // Test 2: Circle with offset (round join)
  // ============================================
  const circlePos = positions[1]
  const circleR = 180
  let circlePath = Path.circle([circlePos.x, circlePos.y], circleR)

  for (let i = offsetLayers; i >= 1; i--) {
    const offsetPath = PathOffset(circlePath, offsetAmount * i, { join: 'round' })
    const alpha = Math.round(100 * (1 - i / (offsetLayers + 1)))
    render({
      path: offsetPath,
      fill: { type: 'solid', channelVals: [0, alpha, 0] },
      mode: 'join'
    })
  }

  if (showOriginal) {
    render({
      path: circlePath,
      fill: { type: 'solid', channelVals: [0, 100, 0] },
      mode: 'join'
    })
  }

  // ============================================
  // Test 3: Star with offset (round join)
  // ============================================
  const starPos = positions[2]
  let starPath = createStar(starPos.x, starPos.y, 220, 90, 5)

  for (let i = offsetLayers; i >= 1; i--) {
    const offsetPath = PathOffset(starPath, offsetAmount * i, { join: 'round' })
    const alpha = Math.round(100 * (1 - i / (offsetLayers + 1)))
    render({
      path: offsetPath,
      fill: { type: 'solid', channelVals: [0, 0, alpha] },
      mode: 'join'
    })
  }

  if (showOriginal) {
    render({
      path: starPath,
      fill: { type: 'solid', channelVals: [0, 0, 100] },
      mode: 'join'
    })
  }

  // ============================================
  // Test 4: Text with offset (round join)
  // ============================================
  const textPos = positions[3]

  if (font) {
    // Create text path
    const fontSize = 500
    let textPath = getCharPath('A', fontSize)

    if (textPath) {
      // Center the text path
      const bounds = Path.bounds(textPath)
      const centerX = (bounds[0][0] + bounds[1][0]) / 2
      const centerY = (bounds[0][1] + bounds[1][1]) / 2
      textPath = Path.transform(
        textPath,
        mat2d.fromTranslation([textPos.x - centerX, textPos.y - centerY])
      )

      // Draw offset layers
      for (let i = offsetLayers; i >= 1; i--) {
        const offsetPath = PathOffset(textPath, offsetAmount * i, { join: 'round' })
        const alpha = Math.round(100 * (1 - i / (offsetLayers + 1)))
        // Mix of yellow and red for text
        render({
          path: offsetPath,
          fill: { type: 'solid', channelVals: [alpha, 0, alpha] },
          mode: 'join'
        })
      }

      if (showOriginal) {
        render({
          path: textPath,
          fill: { type: 'solid', channelVals: [100, 0, 100] },
          mode: 'join'
        })
      }
    }
  }

  // ============================================
  // Labels
  // ============================================
  fill(0)
  noStroke()
  textSize(36)
  textAlign(CENTER, TOP)
  text('Rectangle (miter)', rectPos.x, margin / 2)
  text('Circle (round)', circlePos.x, margin / 2)
  text('Star (round)', starPos.x, margin + cellH + 20)
  text('Text (round)', textPos.x, margin + cellH + 20)

  textSize(28)
  textAlign(CENTER, BOTTOM)
  text(`Offset: ${offsetAmount}px x ${offsetLayers} layers`, width / 2, height - 30)

  drawRiso()
}
