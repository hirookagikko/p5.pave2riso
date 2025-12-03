/**
 * Text Offset Test
 *
 * Demonstrates PathOffset applied to united text paths
 */

import { Path, Distort } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { mat2d, vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import paper from 'https://cdn.jsdelivr.net/npm/paper@0.12.4/+esm'
import { PaperOffset } from 'https://cdn.jsdelivr.net/npm/paperjs-offset@1.0.8/+esm'

// DI: createP5Pave2Riso を使って依存を注入
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

// 依存を明示的に注入（paper, PaperOffset は PathOffset に必要）
const { p2r, PathOffset, ot2pave } = createP5Pave2Riso({ Path, vec2, paper, PaperOffset })

// mat2d, Distort はローカル変数として使用（p5.pave2riso の依存ではない）

let channels = []
let render
let font = null

// ============================================
// Configuration
// ============================================
const text = 'いせき'            // Text string to display
const offsetAmount = 180       // Offset distance in pixels
const offsetLayers = 10        // Number of offset layers
const showOriginal = true     // Show original path

// Randomness settings
let randomOffsetX, randomOffsetY
const randomRotation = 180     // Max random rotation (degrees)

// Twirl settings (using Pave.js Distort.twirl)
const twirlAngle = 90          // Rotation angle in degrees
const twirlRadiusFactor = 0.5  // Radius as factor of canvas width

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
// Helper: Create united path from text string
// ============================================
const createTextPath = (str, fontSize, spacing = 0) => {
  const chars = [...str]  // Expand string to character array
  const paths = []
  let xOffset = 0

  for (const char of chars) {
    let charPath = getCharPath(char, fontSize)
    if (!charPath) continue

    // Get character bounds for centering rotation
    const bounds = Path.bounds(charPath)
    const charWidth = bounds[1][0] - bounds[0][0]
    const charCenterX = (bounds[0][0] + bounds[1][0]) / 2
    const charCenterY = (bounds[0][1] + bounds[1][1]) / 2

    // Random rotation around character center
    const rotDeg = random(-randomRotation, randomRotation)
    const rotRad = rotDeg

    // Apply rotation around character center
    const toOrigin = mat2d.fromTranslation([-charCenterX, -charCenterY])
    const rotate = mat2d.fromRotation(rotRad)
    const fromOrigin = mat2d.fromTranslation([charCenterX, charCenterY])
    const rotationMatrix = mat2d.multiply(mat2d.multiply(fromOrigin, rotate), toOrigin)
    charPath = Path.transform(charPath, rotationMatrix)

    // Random offset
    const randX = random(-randomOffsetX, randomOffsetX)
    const randY = random(-randomOffsetY, randomOffsetY)

    // Move character to position with random offset
    charPath = Path.transform(charPath, mat2d.fromTranslation([xOffset - bounds[0][0] + randX, randY]))
    paths.push(charPath)

    // Advance x position
    xOffset += charWidth + spacing
  }

  if (paths.length === 0) return null

  // Unite all character paths
  return Path.unite(paths)
}

// ============================================
// Preload: Load font
// ============================================
window.preload = async () => {
  if (!window.opentype) {
    console.error('opentype.js is not loaded')
    return
  }

  const fontPath = '../fonts/Zen_Maru_Gothic/ZenMaruGothic-Black.ttf'

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

  randomOffsetX = width / 5
  randomOffsetY = height / 5

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
  if (!font) return

  background(255)
  channels.forEach(ch => ch.clear())

  const centerX = width / 2
  const centerY = height / 2

  // Create united text path
  const fontSize = height * .6
  const spacing = 0
  let textPath = createTextPath(text, fontSize, spacing)

  if (textPath) {
    // Center the text path
    const bounds = Path.bounds(textPath)
    const pathCenterX = (bounds[0][0] + bounds[1][0]) / 2
    const pathCenterY = (bounds[0][1] + bounds[1][1]) / 2
    textPath = Path.transform(
      textPath,
      mat2d.fromTranslation([centerX - pathCenterX, centerY - pathCenterY])
    )

    // Apply twirl effect (Pave.js Distort.twirl)
    const twirlRadius = width * twirlRadiusFactor
    textPath = Path.distort(textPath, Distort.twirl([centerX, centerY], twirlRadius, twirlAngle, t => t * t * (3 - 2 * t)))

    // Build offset layers cumulatively (offset → unite → offset → unite...)
    const offsetPaths = []
    let currentPath = textPath

    for (let i = 1; i <= offsetLayers; i++) {
      currentPath = PathOffset(currentPath, offsetAmount, { join: 'round' })
      currentPath = Path.unite([currentPath])  // Unite to consolidate disconnected regions
      offsetPaths.push(currentPath)
    }

    // Draw offset layers (from outermost to innermost)
    for (let i = offsetLayers - 1; i >= 0; i--) {
      const offsetPath = offsetPaths[i]
      const progress = (i + 1) / (offsetLayers + 1)

      // Color gradient: blue -> red -> yellow
      const blueVal = Math.round(100 * progress)
      const redVal = Math.round(100 * (1 - progress))
      const yellowVal = Math.round(50 * Math.sin(progress * Math.PI))

      render({
        path: offsetPath,
        stroke: {
          type: 'dashed',
          strokeWeight: 10,
          dashArgs: [20, 40, 120, 40, 80, 40],
          channelVals: [100, 0, 0]
        },
        fill: { type: 'solid', channelVals: [0, redVal, yellowVal] },
        mode: 'join'
      })
    }

    // Draw original path
    if (showOriginal) {
      render({
        path: textPath,
        stroke: {
          type: 'dashed',
          strokeWeight: 10,
          dashArgs: [20, 40, 120, 40, 80, 40],
          channelVals: [100, 0, 0]
        },
        fill: { type: 'solid', channelVals: [0, 100, 0] },
        mode: 'join'
      })
    }
  }

  drawRiso()
}
