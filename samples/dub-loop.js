/**
 * DUB Loop
 *
 * Creates "DUB" typography that appears to fly from bottom-right to top-left
 * with overlapping layers and varying ink distribution
 */

import { Path, Distort } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { mat2d, vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { p2r, ot2pave } from '../dist/p5.pave2riso.js'

// Make utilities available globally
window.Path = Path
window.mat2d = mat2d
window.Distort = Distort
window.vec2 = vec2

let channels = []
let render
let font = null
let dubPath = null
let fontsReady = false

// Number of layers (bottom-right to top-left)
const LAYERS = 50

// Helper function to generate a character path with variable font settings
const getCharPath = (char, x, y, fontSize, width = 100, slant = 0) => {
  if (!font) return null

  // Using opentype.js 2.0.0+ variable font support
  // Set the ROND (roundness), wdth (width), and slnt (slant) axis values before generating the path
  if (font.variation && font.tables.fvar) {
    font.variation.set({ ROND: 100, wght: 1000, wdth: width, slnt: slant })
  }

  const pathData = font.getPath(char, x, y, fontSize)

  // Check if commands exist and are valid
  if (!pathData.commands || pathData.commands.length === 0) {
    console.error(`No commands generated for character: ${char}`)
    return null
  }

  return ot2pave(pathData.commands)
}

window.preload = async () => {
  if (!window.opentype) {
    console.error('❌ opentype.js is not loaded. Check the script tag in HTML.')
    return
  }

  const fontPath = '../fonts/Google_Sans_Flex/GoogleSansFlex-VariableFont_GRAD,ROND,opsz,slnt,wdth,wght.ttf'

  try {
    const response = await fetch(fontPath)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const buffer = await response.arrayBuffer()
    font = window.opentype.parse(buffer)
  } catch (err) {
    console.error('❌ フォントのロードに失敗しました:', err)
  }
}

window.setup = () => {
  noLoop()
  createCanvas(3508, 2480) // A4 at 300dpi
  pixelDensity(1)

  // Initialize Riso channels
  channels = [
    new Riso('red'),
    new Riso('blue'),
    new Riso('yellow')
  ]

  // Expose channels globally for common.js export functionality
  window.risoChannels = channels

  // p2r factory - bind channels and canvas size once
  render = p2r({
    channels,
    canvasSize: [width, height]
  })

  // Wait for font to load before generating paths
  if (!font) {
    setTimeout(() => {
      if (font) {
        initDubPath()
        redraw()
      }
    }, 1000)
    return
  }

  initDubPath()
}

/* Create combined "Dubbing" path with random transformations */
function initDubPath() {
  const fontSize = height * 0.5
  const baseSpacing = fontSize * 0.2 // Tighter spacing for overlapping characters

  // Generate paths for "Dubbing" with random transformations
  const chars = ['D', 'O', 'N', 'U']
  const paths = chars.map((char, i) => {
    // Each character gets a different width value (wdth axis: 25-151)
    const width = random(25, 151)
    // Each character gets a different slant value (slnt axis: -12 to 0 typically)
    const slant = random(-10, 5)
    let path = getCharPath(char, baseSpacing * i, 0, fontSize, width, slant)

    if (!path) {
      console.error(`Failed to generate path for character: ${char}`)
      return null
    }

    // Apply random rotation and offset
    const rotationDegrees = random(-30, 30)
    const offsetX = baseSpacing * i + random(-100, 100)
    const offsetY = random(-100, 100)

    path = Path.transform(path, mat2d.fromRotation(rotationDegrees))
    path = Path.transform(path, mat2d.fromTranslation([offsetX, offsetY]))

    return path
  }).filter(p => p !== null) // Remove any null paths

  // Combine all character paths
  if (paths.length === 0) {
    console.error('No valid paths generated')
    return
  }

  dubPath = Path.unite(paths)

  // Center the combined path on canvas
  const bounds = Path.bounds(dubPath)
  const centerX = width / 2
  const centerY = height / 2
  const offsetX = centerX - (bounds[0][0] + bounds[1][0]) / 2
  const offsetY = centerY - (bounds[0][1] + bounds[1][1]) / 2

  dubPath = Path.transform(dubPath, mat2d.fromTranslation([offsetX, offsetY]))

  fontsReady = true
}

window.draw = () => {
  if (!fontsReady || !dubPath) return

  background(255)
  channels.forEach(ch => ch.clear())

  // Render multiple layers from bottom-right to top-left
  for (let i = 0; i < LAYERS; i++) {
    const progress = i / (LAYERS - 1) // 0.0 to 1.0

    // Movement offset: from bottom-right (+x, +y) to top-left (-x, -y)
    const offsetX = (1 - progress) * width * 0.3 - width * 0.1
    const offsetY = (1 - progress) * height * 0.3 - height * 0.1

    // Transform path
    const layerPath = Path.transform(dubPath, mat2d.fromTranslation([offsetX, offsetY]))

    const redVal = Math.round(100 * progress)
    const yellowVal = Math.round(100 * Math.sin((1 - progress) * Math.PI))

    // Render with cutout mode
    render({
      path: layerPath,
      fill: {
        type: 'solid',
        channelVals: [redVal, 0, yellowVal]
      },
      stroke: {
        type: 'solid',
        strokeWeight: 6,
        channelVals: [0, 100, 0]
      },
      mode: 'cutout'
    })
  }

  drawRiso()
}
