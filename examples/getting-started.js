import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

const { p2r } = createP5Pave2Riso({ Path, vec2 })

let render

window.setup = () => {
  createCanvas(800, 600)
  pixelDensity(1)

  const redChannel = new Riso('blue')
  window.risoChannels = [redChannel] // for export

  render = p2r({
    channels: [redChannel],
    canvasSize: [width, height]
  })

  noLoop()
}

window.draw = () => {
  background(255)
  window.risoChannels.forEach(ch => ch.clear())

  const circle = Path.circle([width / 2, height / 2], 150)

  render({
    path: circle,
    fill: {
      type: 'solid',
      channelVals: [100]
    },
    stroke: null,
    mode: 'overprint'
  })

  drawRiso()
  if (window.updatePlatesPreview) window.updatePlatesPreview()
}
