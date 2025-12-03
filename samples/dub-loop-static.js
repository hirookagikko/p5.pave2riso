/**
 * DUB Loop (Static Font Version)
 *
 * Creates typography that appears to fly from bottom-right to top-left
 * This version uses a static (non-variable) font
 */

import { Path, Distort } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { mat2d, vec2, scalar } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

// Initialize p5.pave2riso with dependencies
const { p2r, ot2pave } = createP5Pave2Riso({ Path, vec2 })

// Custom polar distortion function
const polar = (intensity, position, startAngle, endAngle) => {
  return Distort.fromPointTransformer(p => {
    const a = scalar.mix(startAngle, endAngle, p[0] / 100)
    const r = p[1] / 2
    const polarPoint = vec2.add(position, vec2.dir(a, r))
    return vec2.mix(p, polarPoint, intensity)
  })
}

let channels = []
let render
let font = null
let dubPath = null
let basePathBeforeDistort = null // Path before twirl/polar distortions
let fontsReady = false

// Number of layers (bottom-right to top-left)
const LAYERS = 50

// Helper function to generate a character path
const getCharPath = (char, x, y, fontSize) => {
  if (!font) return null

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

  // Using DUB Loop font (static version)
  const fontPath = '../fonts/Zen_Antique_Soft/ZenAntiqueSoft-Regular.ttf'

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
    new Riso('fluorescentpink'),
    new Riso('black'),
    new Riso('aqua')
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
  const fontSize = height * 1.5
  const baseSpacing = fontSize * 0.25 // Tighter spacing for overlapping characters

  // Generate paths with random transformations
  const text = 'あ'
  const chars = [...text] // Split string into array of characters
  const paths = chars.map((char, i) => {
    let path = getCharPath(char, baseSpacing * i, 0, fontSize)

    if (!path) {
      console.error(`Failed to generate path for character: ${char}`)
      return null
    }

    // Apply random rotation and offset
    const rotationDegrees = random(-180, 180)
    const offsetX = baseSpacing * i + random(-10, 10)
    const offsetY = random(-10, 10)

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

  // Save path before distortions (twirl and polar will be applied per-layer)
  basePathBeforeDistort = dubPath

  // Apply light wave effect
  // dubPath = Path.subdivide(dubPath, 3)
  // dubPath = Path.distort(dubPath, Distort.wave(2, 5, 0, 45, [centerX, centerY]))

  fontsReady = true
}

window.draw = () => {
  if (!fontsReady || !basePathBeforeDistort) return

  background(255)
  channels.forEach(ch => ch.clear())

  const centerX = width / 2
  const centerY = height / 2

  // Random walk starting position
  let walkX = width * 0.1
  let walkY = height * 0.1
  const stepSize = 10 // Size of each random walk step

  // Step-based parameter changes (per layer)
  const twirlAngleStart = -180, twirlAngleStep = 6 // degrees per layer
  const twirlRadiusStart = width * 0.6, twirlRadiusStep = width * 0.002
  const polarIntensityStart = 0.01, polarIntensityStep = 0.007
  const polarStartAngleStart = 0, polarStartAngleStep = 0.1
  const polarEndAngleStart = 0, polarEndAngleStep = 0.1

  // Render multiple layers with random walk
  for (let i = 0; i < LAYERS; i++) {
    const progress = i / (LAYERS - 1) // 0.0 to 1.0 (for color etc.)

    // Apply twirl with step-based variation
    const twirlAngle = twirlAngleStart + i * twirlAngleStep
    const twirlRadius = twirlRadiusStart + i * twirlRadiusStep
    let layerPath = Path.distort(
      basePathBeforeDistort,
      Distort.twirl([centerX, centerY], twirlRadius, twirlAngle, t => t * t * (3 - 2 * t))
    )

    // Apply polar distortion with step-based variation
    const polarIntensity = polarIntensityStart + i * polarIntensityStep
    const polarStartAngle = polarStartAngleStart + i * polarStartAngleStep
    const polarEndAngle = polarEndAngleStart + i * polarEndAngleStep

    layerPath = Path.distort(
      layerPath,
      polar(polarIntensity, [centerX, centerY], polarStartAngle, polarEndAngle)
    )

    // Random walk movement
    walkX += random(-stepSize, stepSize)
    walkY += random(-stepSize, stepSize)

    // Transform path with random walk offset
    layerPath = Path.transform(layerPath, mat2d.fromTranslation([walkX, walkY]))

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
