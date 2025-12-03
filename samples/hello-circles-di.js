// Hello Circles (Dependency Injection Pattern)
// 依存性注入パターンを使用したサンプル
// グローバル変数 (window.Path, window.vec2) を使わずに依存を明示的に注入

import { Path, Distort } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { mat2d, vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'

// NEW: createP5Pave2Riso を使って依存を注入
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

// 依存を明示的に注入してライブラリインスタンスを作成
// グローバル変数は一切不要！
const { p2r } = createP5Pave2Riso({ Path, vec2 })

// mat2d と Distort はローカル変数として使用
// (p5.pave2riso の依存ではないのでグローバル不要)

let channels = []
let render

window.setup = () => {
  createCanvas(3508, 2480) // A4 at 300dpi
  pixelDensity(1)

  // Initialize Riso channels
  channels = [
    new Riso('red'),
    new Riso('green'),
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

  // Draw the base circle with the factory function
  const baseCircle = Path.circle([0, 1240], 800)

  // Define circles as data (x positions and colors)
  // Overlapping circles to create color mixing effect
  const centerX = width / 2
  const spacing = 650  // Subtle overlap

  const circles = [
    { x: centerX - spacing, color: [100, 0, 0] },   // Red
    { x: centerX, color: [0, 100, 0] },              // Green
    { x: centerX + spacing, color: [0, 0, 100] }     // Yellow
  ]

  // Draw all circles by transforming the base circle and applying wave
  circles.forEach((circle, i) => {
    const transform = mat2d.fromTranslation([circle.x, 0])
    let finalCircle = Path.transform(baseCircle, transform)

    // Apply wave distortion with progressively different parameters
    // wave(amplitude, width, phase, angle, origin)
    const waveAmplitude = 15 + i * 10   // Gradually increase amplitude: 15, 25, 35
    const waveWidth = 100 - i * 20      // Gradually decrease wavelength: 100, 80, 60
    const waveAngle = i * 30            // Rotate wave direction: 0°, 30°, 60°

    finalCircle = Path.distort(
      finalCircle,
      Distort.wave(waveAmplitude, waveWidth, 0, waveAngle)
    )

    // Last circle uses cutout mode to create knockout effect
    const mode = i === circles.length - 1 ? 'cutout' : 'overprint'

    render({
      path: finalCircle,
      fill: {
        type: 'solid',
        channelVals: circle.color
      },
      mode
    })
  })

  drawRiso()
}
