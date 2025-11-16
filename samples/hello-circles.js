// Hello Circles / 丸が出てうれしい
// A minimal example showing how p2r factory function simplifies your code

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { p2r } from '../dist/p5.pave2riso.js'

// Make Path and vec2 available globally
window.Path = Path
window.vec2 = vec2

let channels = []
let render

window.setup = () => {
  createCanvas(3508, 2480) // A4 at 300dpi
  pixelDensity(1)

  // Initialize Riso channels
  channels = [
    new Riso('red'),
    new Riso('blue'),
    new Riso('black')
  ]

  // ✨ Create p2r factory - bind channels and canvas size once!
  render = p2r({
    channels,
    canvasSize: [width, height]
  })

  document.getElementById('export-btn').addEventListener('click', () => {
    exportRiso()
    console.log('Exported!')
  })

  noLoop()
}

window.draw = () => {
  background(255)
  channels.forEach(ch => ch.clear())

  // 🎨 Draw circles with the factory function
  // No need to repeat channels and canvasSize every time!

  // Red circle
  render({
    path: Path.circle([877, 1240], 400),
    fill: {
      type: 'solid',
      channelVals: [100, 0, 0]
    },
    mode: 'overprint'
  })

  // Blue circle
  render({
    path: Path.circle([1754, 1240], 400),
    fill: {
      type: 'solid',
      channelVals: [0, 100, 0]
    },
    mode: 'overprint'
  })

  // Black circle
  render({
    path: Path.circle([2631, 1240], 400),
    fill: {
      type: 'solid',
      channelVals: [0, 0, 100]
    },
    mode: 'overprint'
  })

  drawRiso()
}
