/**
 * Font Pathfinder Test (Dependency Injection Pattern)
 *
 * Demonstrates combining ot2pave font path conversion with pathfinder operations
 * Creates typographic compositions using PathIntersect, PathSubtract, and PathExclude
 *
 * DI版: createP5Pave2Riso を使用してグローバル変数を排除
 */

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { mat2d, vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'

// NEW: createP5Pave2Riso を使って依存を注入
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

// 依存を明示的に注入してライブラリインスタンスを作成
// グローバル変数は一切不要！
const { p2r, ot2pave, PathIntersect, PathExclude } = createP5Pave2Riso({ Path, vec2 })

// mat2d はローカル変数として使用 (p5.pave2riso の依存ではない)

let channels = []
let render
let font = null
let fontPaths = []
let fontsReady = false

// Helper function to generate a character path
const getCharPath = (char, x, y, fontSize) => {
  if (!font) return null
  const pathData = font.getPath(char, x, y, fontSize)
  return ot2pave(pathData.commands)
}

window.preload = () => {
  // Load font using opentype.load with callback
  opentype.load('../fonts/Zen_Maru_Gothic/ZenMaruGothic-Black.ttf', function (err, loadedFont) {
    if (err) {
      console.error('フォントのロードに失敗しました: ' + err)
      return
    }
    font = loadedFont
    console.log('フォント読み込み完了')
  })
}

window.setup = () => {
  noLoop()
  createCanvas(3508, 2480) // A4 at 300dpi
  pixelDensity(1)

  // Initialize Riso channels
  channels = [
    new Riso('bubblegum'),
    new Riso('huntergreen'),
    new Riso('metallicgold')
  ]

  // Expose channels globally for common.js export functionality
  window.risoChannels = channels

  // p2r factory - bind channels and canvas size once
  render = p2r({
    channels,
    canvasSize: [width, height]
  })

  // Wait for font to load before generating paths
  if (!font) {
    setTimeout(() => {
      if (font) {
        initFontPaths()
        redraw()
      }
    }, 1000)
    return
  }

  initFontPaths()
}

function initFontPaths() {
  const fontSize = height * 0.8

  // Generate font paths for the two characters
  const char1 = '日'
  const char2 = '月'

  const path1 = getCharPath(char1, 0, 0, fontSize)
  const path2 = getCharPath(char2, 0, 0, fontSize)

  fontPaths.push({
    char: char1,
    path: path1
  })

  fontPaths.push({
    char: char2,
    path: path2
  })

  fontsReady = true
  console.log('fontPaths:', fontPaths)
  console.log('初期設定しました')
}

window.draw = () => {
  if (!fontsReady || fontPaths.length < 2) return

  background(255)
  channels.forEach(ch => ch.clear())

  const centerX = width / 2
  const centerY = height / 2

  // Position the two character paths
  let path1 = fontPaths[0].path
  let path2 = fontPaths[1].path

  const bounds1 = Path.bounds(path1)
  const offset1X = centerX - width * 0.05 - (bounds1[0][0] + bounds1[1][0]) / 2
  const offset1Y = centerY - (bounds1[0][1] + bounds1[1][1]) / 2
  path1 = Path.transform(path1, mat2d.fromTranslation([offset1X, offset1Y]))
  path1 = Path.transform(path1, mat2d.fromRotation(10))

  const bounds2 = Path.bounds(path2)
  const offset2X = centerX + width * 0.05 - (bounds2[0][0] + bounds2[1][0]) / 2
  const offset2Y = centerY - (bounds2[0][1] + bounds2[1][1]) / 2
  path2 = Path.transform(path2, mat2d.fromTranslation([offset2X, offset2Y]))
  path2 = Path.transform(path2, mat2d.fromRotation(-10))

  // Apply pathfinder operations
  const intersected = PathIntersect(path1, path2)
  const excluded = PathExclude(path1, path2)
  const excludedOffset = Path.transform(excluded, mat2d.fromTranslation(-50, -50))

  // Render
  render({
    path: intersected,
    fill: {
      type: 'solid',
      channelVals: [0, 100, 0]
    },
    mode: 'overprint'
  })
  render({
    path: intersected,
    fill: {
      type: 'pattern',
      PTN: 'dot',
      patternAngle: 45,
      patternArgs: [100, 25],
      channelVals: [100, 0, 0]
    },
    mode: 'join'
  })
  render({
    path: excluded,
    stroke: { type: 'dashed', dashArgs: [60, 40, 20, 40], strokeWeight: 20, channelVals: [0, 0, 100] },
    fill: { type: 'solid', channelVals: [100, 0, 0] },
    mode: 'join'
  })
  render({
    path: excludedOffset,
    clippingPath: excluded,
    fill: { type: 'solid', channelVals: [0, 100, 0] },
    filter: [
      { filterType: 'invert' },
      { filterType: 'blur', filterArgs: [30] }
    ],
    halftone: { halftoneArgs: ['line', 20, 45, 237] },
    mode: 'overprint'
  })

  drawRiso()
}
