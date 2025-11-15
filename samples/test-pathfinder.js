/**
 * Pathfinder Utilities Test
 *
 * Tests PathIntersect, PathExclude, and isPathsOverlap functions
 */

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { PathIntersect, PathExclude, isPathsOverlap, pave2Riso } from '../dist/p5.pave2riso.js'

// Make Path and vec2 available globally for wrappers
window.Path = Path
window.vec2 = vec2

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

  const radius = width * 0.06
  const margin = width * 0.08

  // ============================================
  // Test 1: PathIntersect - Intersection of two overlapping paths
  // ============================================

  let y = margin

  // Original shapes
  const circle1 = Path.circle([margin * 2, y], radius)
  const circle2 = Path.circle([margin * 2 + radius, y], radius)

  // Draw originals in red and blue
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

  // Result: Intersection (overlapping area only)
  const intersected = PathIntersect(circle1, circle2)
  pave2Riso({
    channels,
    path: intersected,
    canvasSize: [width, height],
    fill: {
      type: 'solid',
      channelVals: [0, 0, 100]
    },
    mode: 'overprint'
  })

  // Label for this test (draw result in-place, overlapping original shapes)
  push()
  fill(0)
  noStroke()
  textSize(32)
  textAlign(LEFT, CENTER)
  text('PathIntersect', margin, y - margin * 0.5)
  pop()

  // ============================================
  // Test 2: PathExclude - Symmetric difference (XOR)
  // ============================================

  y += margin * 3

  const circle3 = Path.circle([margin * 2, y], radius)
  const circle4 = Path.circle([margin * 2 + radius, y], radius)

  // Draw originals
  pave2Riso({
    channels,
    path: circle3,
    canvasSize: [width, height],
    fill: {
      type: 'solid',
      channelVals: [100, 0, 0]
    },
    mode: 'overprint'
  })

  pave2Riso({
    channels,
    path: circle4,
    canvasSize: [width, height],
    fill: {
      type: 'solid',
      channelVals: [0, 100, 0]
    },
    mode: 'overprint'
  })

  // Result: Symmetric difference
  const excluded = PathExclude(circle3, circle4)
  pave2Riso({
    channels,
    path: excluded,
    canvasSize: [width, height],
    fill: {
      type: 'solid',
      channelVals: [0, 0, 100]
    },
    mode: 'overprint'
  })

  // Label
  push()
  fill(0)
  noStroke()
  textSize(32)
  textAlign(LEFT, CENTER)
  text('PathExclude', margin, y - margin * 0.5)
  pop()

  // ============================================
  // Test 3: Edge Cases
  // ============================================

  y += margin * 3

  // Case 1: Complete separation (no overlap)
  const circle5 = Path.circle([margin * 2, y], radius)
  const circle6 = Path.circle([margin * 2 + radius * 3, y], radius)

  const overlap1 = isPathsOverlap(circle5, circle6)
  console.log('Completely separated circles overlap:', overlap1) // Should be false

  pave2Riso({
    channels,
    path: circle5,
    canvasSize: [width, height],
    fill: {
      type: 'solid',
      channelVals: [100, 0, 0]
    },
    mode: 'overprint'
  })

  pave2Riso({
    channels,
    path: circle6,
    canvasSize: [width, height],
    fill: {
      type: 'solid',
      channelVals: [0, 100, 0]
    },
    mode: 'overprint'
  })

  // Draw text label
  push()
  fill(0)
  noStroke()
  textSize(32)
  textAlign(LEFT, CENTER)
  text(`No overlap: ${overlap1}`, margin, y - margin * 0.5)
  pop()

  // Case 2: Complete overlap (identical circles)
  y += margin * 3

  const circle7 = Path.circle([margin * 2, y], radius)
  const circle8 = Path.circle([margin * 2, y], radius)

  const overlap2 = isPathsOverlap(circle7, circle8)
  console.log('Identical circles overlap:', overlap2) // Should be true

  pave2Riso({
    channels,
    path: circle7,
    canvasSize: [width, height],
    fill: {
      type: 'solid',
      channelVals: [100, 100, 0]
    },
    mode: 'overprint'
  })

  push()
  fill(0)
  noStroke()
  textSize(32)
  textAlign(LEFT, CENTER)
  text(`Complete overlap: ${overlap2}`, margin, y - margin * 0.5)
  pop()

  // Case 3: Partial overlap
  // NOTE: Known bug - isPathsOverlap returns false for partial circle overlaps
  // The function checks if curves count changes after subtract, but a crescent
  // (circle minus partial overlap) is still 1 curve, same as the original circle
  y += margin * 3

  const circle9 = Path.circle([margin * 2, y], radius)
  const circle10 = Path.circle([margin * 2 + radius * 0.5, y], radius)

  const overlap3 = isPathsOverlap(circle9, circle10)
  console.log('Partially overlapping circles overlap:', overlap3) // Should be true, but returns false due to bug

  pave2Riso({
    channels,
    path: circle9,
    canvasSize: [width, height],
    fill: {
      type: 'solid',
      channelVals: [100, 0, 0]
    },
    mode: 'overprint'
  })

  pave2Riso({
    channels,
    path: circle10,
    canvasSize: [width, height],
    fill: {
      type: 'solid',
      channelVals: [0, 100, 0]
    },
    mode: 'overprint'
  })

  push()
  fill(0)
  noStroke()
  textSize(32)
  textAlign(LEFT, CENTER)
  text(`Partial overlap: ${overlap3}`, margin, y - margin * 0.5)
  pop()

  // Case 4: One contains the other
  y += margin * 3

  const circle11 = Path.circle([margin * 2, y], radius)
  const circle12 = Path.circle([margin * 2, y], radius * 0.5)

  const overlap4 = isPathsOverlap(circle11, circle12)
  console.log('Nested circles overlap:', overlap4) // Should be true

  pave2Riso({
    channels,
    path: circle11,
    canvasSize: [width, height],
    fill: {
      type: 'solid',
      channelVals: [100, 0, 0]
    },
    mode: 'overprint'
  })

  pave2Riso({
    channels,
    path: circle12,
    canvasSize: [width, height],
    fill: {
      type: 'solid',
      channelVals: [0, 100, 0]
    },
    mode: 'overprint'
  })

  push()
  fill(0)
  noStroke()
  textSize(32)
  textAlign(LEFT, CENTER)
  text(`Nested (one contains other): ${overlap4}`, margin, y - margin * 0.5)
  pop()

  drawRiso()
}
