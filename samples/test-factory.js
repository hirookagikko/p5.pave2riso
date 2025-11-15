/**
 * Minimal p2r Factory Function Test
 */

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { p2r } from '../dist/p5.pave2riso.js'

// Make Path and vec2 available globally for wrappers
window.Path = Path
window.vec2 = vec2

let channels = []
let render

window.setup = () => {
  createCanvas(1600, 1600)
  pixelDensity(1)

  // Initialize Riso channels
  channels = [
    new Riso('red'),
    new Riso('blue'),
    new Riso('black')
  ]

  // Create p2r factory function
  console.log('Creating p2r factory...')
  render = p2r({
    channels,
    canvasSize: [width, height]
  })
  console.log('p2r factory created:', render)

  document.getElementById('export-btn').addEventListener('click', () => {
    exportRiso()
    console.log('Exported!')
  })

  noLoop()
}

window.draw = () => {
  background(255)

  channels.forEach(ch => ch.clear())

  const radius = width * 0.08
  const margin = width * 0.1

  // ============================================
  // Test 1: Basic usage - Simple filled circles
  // ============================================

  // Red circle
  render({
    path: Path.circle([margin, margin], radius),
    fill: {
      type: 'solid',
      channelVals: [100, 0, 0]
    },
    mode: 'overprint'
  })

  // Blue circle
  render({
    path: Path.circle([margin * 2.5, margin], radius),
    fill: {
      type: 'solid',
      channelVals: [0, 100, 0]
    },
    mode: 'overprint'
  })

  // Black circle
  render({
    path: Path.circle([margin * 4, margin], radius),
    fill: {
      type: 'solid',
      channelVals: [0, 0, 100]
    },
    mode: 'overprint'
  })

  // ============================================
  // Test 2: Multiple render() calls
  // ============================================

  const y2 = margin * 3

  // Purple (red + blue)
  render({
    path: Path.circle([margin, y2], radius),
    fill: {
      type: 'solid',
      channelVals: [100, 100, 0]
    },
    mode: 'overprint'
  })

  // Mixed colors
  render({
    path: Path.circle([margin * 2.5, y2], radius),
    fill: {
      type: 'solid',
      channelVals: [80, 60, 40]
    },
    mode: 'overprint'
  })

  // Half intensity
  render({
    path: Path.circle([margin * 4, y2], radius),
    fill: {
      type: 'solid',
      channelVals: [0, 0, 50]
    },
    mode: 'overprint'
  })

  // ============================================
  // Test 3: Mode options
  // ============================================

  const y3 = margin * 5

  // Overprint mode
  const circle1 = Path.circle([margin, y3], radius)
  const circle2 = Path.circle([margin + radius * 0.8, y3], radius)

  render({
    path: circle1,
    fill: {
      type: 'solid',
      channelVals: [100, 0, 0]
    },
    mode: 'overprint'
  })

  render({
    path: circle2,
    fill: {
      type: 'solid',
      channelVals: [0, 100, 0]
    },
    mode: 'overprint'
  })

  // Cutout mode
  const circle3 = Path.circle([margin * 2.5, y3], radius)
  const circle4 = Path.circle([margin * 2.5 + radius * 0.8, y3], radius)

  render({
    path: circle3,
    fill: {
      type: 'solid',
      channelVals: [100, 0, 0]
    },
    mode: 'overprint'
  })

  render({
    path: circle4,
    fill: {
      type: 'solid',
      channelVals: [0, 100, 0]
    },
    mode: 'cutout'
  })

  drawRiso()
}
