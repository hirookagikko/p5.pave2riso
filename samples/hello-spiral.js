// Hello Spiral / 螺旋がぐるぐる
// A minimal example showing spiral pattern with p2r factory function

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { mat2d, vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

// Initialize with dependency injection
const { p2r } = createP5Pave2Riso({ Path, vec2 })

let channels = []
let render

window.setup = () => {
  createCanvas(2480, 2480) // Square canvas
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

  noLoop()
}

window.draw = () => {
  background(255)
  channels.forEach(ch => ch.clear())

  const centerX = width / 2
  const centerY = height / 2

  // Spiral parameters
  const numCircles = 36         // Number of circles in the spiral
  const angleStep = PI / 6      // Angle increment (30 degrees)
  const startRadius = 50        // Starting distance from center
  const radiusStep = 30         // How much the radius grows per step
  const circleRadius = 80       // Size of each circle

  // Draw spiral of circles
  for (let i = 0; i < numCircles; i++) {
    const angle = i * angleStep
    const spiralRadius = startRadius + i * radiusStep

    // Calculate position on spiral
    const x = centerX + spiralRadius * Math.cos(angle)
    const y = centerY + spiralRadius * Math.sin(angle)

    // Create circle at this position
    const circle = Path.circle([x, y], circleRadius)

    // Color cycles through channels
    // Creates a gradient effect as you go around the spiral
    const t = i / numCircles
    const channelVals = [
      Math.round(100 * Math.max(0, Math.sin(t * TWO_PI) * 0.5 + 0.5)),           // Red
      Math.round(100 * Math.max(0, Math.sin(t * TWO_PI + TWO_PI/3) * 0.5 + 0.5)), // Blue
      Math.round(100 * Math.max(0, Math.sin(t * TWO_PI + 2*TWO_PI/3) * 0.5 + 0.5)) // Yellow
    ]

    render({
      path: circle,
      fill: {
        type: 'solid',
        channelVals
      },
      mode: 'overprint'
    })
  }

  drawRiso()
}
