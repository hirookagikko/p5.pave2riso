/**
 * Pathfinder Boolean Operations Test
 *
 * Tests all boolean path operations:
 * - PathUnite (A ∪ B) - combine areas
 * - PathIntersect (A ∩ B) - overlapping area only
 * - PathSubtract (A - B) - remove B from A
 * - PathExclude (A ⊕ B) - symmetric difference (XOR)
 */

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

const { p2r, PathUnite, PathSubtract, PathIntersect, PathExclude } = createP5Pave2Riso({ Path, vec2 })

let channels = []
let render

window.setup = () => {
  createCanvas(3508, 2480) // A4 at 300dpi
  pixelDensity(1)

  // Initialize Riso channels - 4 colors for 4 operations
  channels = [
    new Riso('bubblegum'),  // PathUnite
    new Riso('blue'),       // PathIntersect
    new Riso('orange'),     // PathSubtract
    new Riso('green')       // PathExclude
  ]

  // Expose channels globally for common.js export functionality
  window.risoChannels = channels

  // p2r factory - bind channels and canvas size once
  render = p2r({
    channels,
    canvasSize: [width, height]
  })

  noLoop()

  // Run tests
  runTests()
}

function runTests() {
  console.log('=== Pathfinder Boolean Operations Tests ===')

  // Test circles
  const circleA = Path.circle([0, 0], 100)
  const circleB = Path.circle([50, 0], 100)

  console.log('Test paths:')
  console.log('  circleA:', circleA ? 'valid' : 'invalid')
  console.log('  circleB:', circleB ? 'valid' : 'invalid')

  // Test 1: PathUnite
  console.log('\n--- PathUnite (A ∪ B) ---')
  const united = PathUnite(circleA, circleB)
  console.log('  Result:', united ? 'valid' : 'invalid')
  console.log('  Has curves:', united?.curves?.length > 0 ? 'yes' : 'no')

  // Test 2: PathIntersect
  console.log('\n--- PathIntersect (A ∩ B) ---')
  const intersected = PathIntersect(circleA, circleB)
  console.log('  Result:', intersected ? 'valid' : 'invalid')
  console.log('  Has curves:', intersected?.curves?.length > 0 ? 'yes' : 'no')

  // Test 3: PathSubtract
  console.log('\n--- PathSubtract (A - B) ---')
  const subtracted = PathSubtract(circleA, circleB)
  console.log('  Result:', subtracted ? 'valid' : 'invalid')
  console.log('  Has curves:', subtracted?.curves?.length > 0 ? 'yes' : 'no')

  // Test 4: PathExclude
  console.log('\n--- PathExclude (A ⊕ B) ---')
  const excluded = PathExclude(circleA, circleB)
  console.log('  Result:', excluded ? 'valid' : 'invalid')
  console.log('  Has curves:', excluded?.curves?.length > 0 ? 'yes' : 'no')

  // Test 5: Null handling for all operations
  console.log('\n--- Null Handling Tests ---')
  console.log('  PathUnite(null, B):', PathUnite(null, circleB) ? 'returns empty path' : 'returns null')
  console.log('  PathIntersect(null, B):', PathIntersect(null, circleB) ? 'returns empty path' : 'returns null')
  console.log('  PathSubtract(null, B):', PathSubtract(null, circleB) ? 'returns empty path' : 'returns null')
  console.log('  PathExclude(null, B):', PathExclude(null, circleB) ? 'returns empty path' : 'returns null')

  console.log('\n=== All tests completed ===')
}

window.draw = () => {
  background(255)
  channels.forEach(ch => ch.clear())

  const radius = 300
  const offset = 200

  // 2x2 grid layout for 4 operations
  const positions = [
    { x: width / 4, y: height / 3 },           // Top-left: Unite
    { x: (width * 3) / 4, y: height / 3 },     // Top-right: Intersect
    { x: width / 4, y: (height * 2) / 3 },     // Bottom-left: Subtract
    { x: (width * 3) / 4, y: (height * 2) / 3 } // Bottom-right: Exclude
  ]

  // --- Top-left: PathUnite ---
  const pos1 = positions[0]
  const circleU1 = Path.circle([pos1.x - offset / 2, pos1.y], radius)
  const circleU2 = Path.circle([pos1.x + offset / 2, pos1.y], radius)
  const united = PathUnite(circleU1, circleU2)

  render({
    path: united,
    fill: {
      type: 'solid',
      channelVals: [100, 0, 0, 0]
    },
    mode: 'overprint'
  })

  // --- Top-right: PathIntersect ---
  const pos2 = positions[1]
  const circleI1 = Path.circle([pos2.x - offset / 2, pos2.y], radius)
  const circleI2 = Path.circle([pos2.x + offset / 2, pos2.y], radius)
  const intersected = PathIntersect(circleI1, circleI2)

  render({
    path: intersected,
    fill: {
      type: 'solid',
      channelVals: [0, 100, 0, 0]
    },
    mode: 'overprint'
  })

  // --- Bottom-left: PathSubtract ---
  const pos3 = positions[2]
  const circleS1 = Path.circle([pos3.x - offset / 2, pos3.y], radius)
  const circleS2 = Path.circle([pos3.x + offset / 2, pos3.y], radius)
  const subtracted = PathSubtract(circleS1, circleS2)

  render({
    path: subtracted,
    fill: {
      type: 'solid',
      channelVals: [0, 0, 100, 0]
    },
    mode: 'overprint'
  })

  // --- Bottom-right: PathExclude ---
  const pos4 = positions[3]
  const circleE1 = Path.circle([pos4.x - offset / 2, pos4.y], radius)
  const circleE2 = Path.circle([pos4.x + offset / 2, pos4.y], radius)
  const excluded = PathExclude(circleE1, circleE2)

  render({
    path: excluded,
    fill: {
      type: 'solid',
      channelVals: [0, 0, 0, 100]
    },
    mode: 'overprint'
  })

  // Add labels
  fill(0)
  noStroke()
  textSize(50)
  textAlign(CENTER, CENTER)

  // Labels for each operation
  text('PathUnite', pos1.x, pos1.y - radius - 80)
  text('A ∪ B', pos1.x, pos1.y - radius - 30)

  text('PathIntersect', pos2.x, pos2.y - radius - 80)
  text('A ∩ B', pos2.x, pos2.y - radius - 30)

  text('PathSubtract', pos3.x, pos3.y - radius - 80)
  text('A - B', pos3.x, pos3.y - radius - 30)

  text('PathExclude', pos4.x, pos4.y - radius - 80)
  text('A ⊕ B (XOR)', pos4.x, pos4.y - radius - 30)

  drawRiso()
}
