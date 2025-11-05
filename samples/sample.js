/**
 * Solid Fill Test
 *
 * Tests solid fill with various channel combinations
 */

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { pave2Riso } from '../dist/p5.pave2riso.js'

let channels = []

window.setup = () => {
  createCanvas(1600, 1600)
  pixelDensity(1)

  // Initialize Riso channels
  channels = [
    new Riso('red'),
    new Riso('blue'),
    new Riso('black')
  ]

  document.getElementById('export-btn').addEventListener('click', () => {
    exportRiso()
    console.log('Exported!')
  })

  noLoop()
}

window.draw = () => {
  background(255)

  channels.forEach(ch => ch.clear())

  // Circle radius relative to canvas width
  const radius = width * 0.1

  // 1. Pure red circle
  const circle1 = Path.circle([width * 0.1875, height * 0.25], radius)
  pave2Riso({
    channels,
    path: circle1,
    canvasSize: [width, height],
    fill: {
      type: 'solid',
      channelVals: [100, 0, 0]
    },
    mode: 'overprint'
  })

  // 2. Pure blue circle
  const circle2 = Path.circle([width * 0.5, height * 0.25], radius)
  pave2Riso({
    channels,
    path: circle2,
    canvasSize: [width, height],
    fill: {
      type: 'solid',
      channelVals: [0, 100, 0]
    },
    mode: 'overprint'
  })

  // 3. Pure black circle
  const circle3 = Path.circle([width * 0.8125, height * 0.25], radius)
  pave2Riso({
    channels,
    path: circle3,
    canvasSize: [width, height],
    fill: {
      type: 'solid',
      channelVals: [0, 0, 100]
    },
    mode: 'overprint'
  })

  // 4. Red + Blue = Purple
  const circle4 = Path.circle([width * 0.1875, height * 0.6667], radius)
  pave2Riso({
    channels,
    path: circle4,
    canvasSize: [width, height],
    fill: {
      type: 'solid',
      channelVals: [100, 100, 0]
    },
    mode: 'overprint'
  })

  // 5. All channels mixed
  const circle5 = Path.circle([width * 0.5, height * 0.6667], radius)
  pave2Riso({
    channels,
    path: circle5,
    canvasSize: [width, height],
    fill: {
      type: 'solid',
      channelVals: [80, 60, 40]
    },
    mode: 'overprint'
  })

  // 6. Half intensity black
  const circle6 = Path.circle([width * 0.8125, height * 0.6667], radius)
  pave2Riso({
    channels,
    path: circle6,
    canvasSize: [width, height],
    fill: {
      type: 'solid',
      channelVals: [0, 0, 50]
    },
    mode: 'overprint'
  })

  drawRiso()
}
