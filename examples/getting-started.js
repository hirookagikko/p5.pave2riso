// Getting Started - The absolute minimum to start using p5.pave2riso

// 1. Import required libraries
import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

// 2. Create p2r factory with dependency injection (no globals needed!)
const { p2r } = createP5Pave2Riso({ Path, vec2 })

let render

window.setup = () => {
  // Create an 800x600 canvas
  createCanvas(800, 600)
  pixelDensity(1)

  // 3. Create Riso channels
  const redChannel = new Riso('red')

  // Expose channels globally for export functionality
  window.risoChannels = [redChannel]

  // 4. Bind render function with channels and canvas size
  render = p2r({
    channels: [redChannel],
    canvasSize: [width, height]
  })

  noLoop()
}

window.draw = () => {
  background(255)
  window.risoChannels.forEach(ch => ch.clear())

  // 5. Create a simple path - a circle at the center
  const circle = Path.circle([width / 2, height / 2], 150)

  // 6. Render the circle with a solid red fill
  render({
    path: circle,
    fill: {
      type: 'solid',
      channelVals: [100] // 100% red ink density
    },
    stroke: null,
    mode: 'overprint'
  })

  // 7. Draw all Riso channels to the canvas
  drawRiso()
}
