/**
 * Pathfinder Utilities Test
 *
 * Tests PathIntersect, PathExclude, and isPathsOverlap functions
 */

import { Path, Distort } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { mat2d, vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { p2r, PathIntersect, PathExclude, PathSubtract, isPathsOverlap } from '../dist/p5.pave2riso.js'

// Make Path, mat2d, Distort and vec2 available globally
window.Path = Path
window.mat2d = mat2d
window.Distort = Distort
window.vec2 = vec2

let channels = []
let render

window.setup = () => {
  createCanvas(3508, 2480) // A4 at 300dpi
  pixelDensity(1)

  // Set angle mode to DEGREES for testing
  angleMode(DEGREES)

  // Initialize Riso channels
  channels = [
    new Riso('bubblegum'),
    new Riso('violet'),
    new Riso('metallicgold')
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

  const radius = height / 3
  const offset = width / 10

  // base circle
  const theCenter = vec2.of(width / 2, height / 2)
  const baseCircle = Path.circle(theCenter, radius)

  // left & right circle
  let leftCircle = Path.transform(baseCircle, mat2d.fromTranslation([-offset, 0]))
  let rightCircle = Path.transform(baseCircle, mat2d.fromTranslation([offset, 0]))
  leftCircle = Path.distort(leftCircle, Distort.wave(100, 400, 0, 45))

  // intersect
  const intersected = PathIntersect(leftCircle, rightCircle)
  const intersectedOffset = Path.transform(intersected, mat2d.fromTranslation(-100, -100))

  // subtract
  const subtracted = PathSubtract(leftCircle, intersected)

  // exclude
  const excluded = PathExclude(leftCircle, rightCircle)

  render({
    path: intersected,
    fill: {
      type: 'solid',
      channelVals: [100, 0, 0]
    },
    mode: 'overprint'
  })

  render({
    path: intersectedOffset,
    clippingPath: intersected,
    fill: {
      type: 'solid',
      channelVals: [0, 100, 0]
    },
    filter: [
      {
        filterType: 'invert'
      },
      {
        filterType: 'blur',
        filterArgs: [50]
      }
    ],
    halftone: { halftoneArgs: ['circle', 20, 45, 255] },
    mode: 'overprint'
  })

  render({
    path: subtracted,
    fill: {
      type: 'solid',
      channelVals: [0, 100, 0]
    },
    mode: 'overprint'
  })

  render({
    path: excluded,
    fill: {
      type: 'pattern',
      PTN: 'stripe',
      patternAngle: 45,
      patternArgs: [100],
      channelVals: [0, 0, 100]
    },
    mode: 'join'
  })

  drawRiso()
}
