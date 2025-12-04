/**
 * Simple Fill Sample
 * A4 landscape (3508 x 2480 at 300dpi)
 * Displays a single character path centered on canvas
 */

import { Path, Distort } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { mat2d, vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'
import paper from 'https://cdn.jsdelivr.net/npm/paper@0.12.4/+esm'
import { PaperOffset } from 'https://cdn.jsdelivr.net/npm/paperjs-offset@1.0.8/+esm'

const { p2r, ot2pave, PathOffset } = createP5Pave2Riso({ Path, vec2, paper, PaperOffset })

let channels = []
let render
let font = null
let fontsReady = false

let FONT_SIZE
let HALFTONE_ARGS = ['circle', 6, 45, 237]
const LOOP_AMOUNT = 3

// Helper function to generate a character path at a given position
const getCharPath = (char, x, y, fontSize) => {
  if (!font) return null
  const pathData = font.getPath(char, 0, 0, fontSize)
  let path = ot2pave(pathData.commands)

  // Center the character at (x, y)
  const bounds = Path.bounds(path)
  const charWidth = bounds[1][0] - bounds[0][0]
  const charHeight = bounds[1][1] - bounds[0][1]
  const offsetX = x - bounds[0][0] - charWidth / 2
  const offsetY = y - bounds[0][1] - charHeight / 2

  path = Path.transform(path, mat2d.fromTranslation([offsetX, offsetY]))

  // Apply light twirl effect around center
  path = Path.distort(path, Distort.twirl([x, y], fontSize * 0.6, 15, t => t * t * (3 - 2 * t)))

  return path
}

window.preload = () => {
  // Load font using opentype.load
  opentype.load('../fonts/Savate/static/Savate-Bold.ttf', function (err, loadedFont) {
    if (err) {
      console.error('Font load failed: ' + err)
      return
    }
    font = loadedFont
    console.log('Font loaded')
  })
}

window.setup = () => {
  const canvas = createCanvas(3508, 2480) // A4 landscape at 300dpi
  canvas.parent('canvas-wrapper')
  pixelDensity(1)

  channels = [
    new Riso('fluorescentgreen'),
    new Riso('fluorescentpink'),
    new Riso('aqua')
  ]

  window.risoChannels = channels

  render = p2r({
    channels,
    canvasSize: [width, height]
  })

  FONT_SIZE = height * .75

  noLoop()

  // Wait for font to load
  if (!font) {
    setTimeout(() => {
      if (font) {
        fontsReady = true
        redraw()
      }
    }, 1000)
    return
  }

  fontsReady = true
}

window.draw = () => {
  if (!fontsReady || !font) return

  background(255)
  channels.forEach(ch => ch.clear())

  const cx = width / 2
  const cy = height / 2

  // Single character path centered
  const charPath = getCharPath('yes', cx, cy, FONT_SIZE)

  let sqPath = Path.rect([0, 0], [width, height])

  if (charPath) {

    let charPathCopy = PathOffset(charPath, width / 50)
    charPathCopy = Path.fillet(charPathCopy, 20)

    render({
      path: sqPath,
      fill: {
        type: 'pattern',
        PTN: 'stripeCircle',
        patternAngle: 45,
        patternArgs: [width / 50],
        channelVals: [0, 0, 100]
      },
      filter: [
        {
          filterType: 'blur',
          filterArgs: [width / 200]
        }
      ],
      halftone: {
        halftoneArgs: HALFTONE_ARGS
      },
      mode: 'overprint'
    })
    render({
      path: charPathCopy,
      // clippingPath: charPath,
      stroke: {
        type: 'solid',
        strokeWeight: width / 100,
        channelVals: [0, 100, 0]
      },
      filter: [
        {
          filterType: 'blur',
          filterArgs: [width / 200]
        }
      ],
      halftone: {
        halftoneArgs: HALFTONE_ARGS
      },
      mode: 'overprint'
    })
    render({
      path: charPath,
      // clippingPath: charPath,
      fill: {
        type: 'solid',
        channelVals: [100, 0, 0]
      },
      filter: [
        {
          filterType: 'blur',
          filterArgs: [width / 200]
        }
      ],
      halftone: {
        halftoneArgs: HALFTONE_ARGS
      },
      mode: 'join'
    })
  }

  drawRiso()
}
