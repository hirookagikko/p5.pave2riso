/**
 * Simple Text Path Generator
 *
 * Generates font paths from a specified text string
 */

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2, mat2d } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import { createP5Pave2Riso } from '../dist/p5.pave2riso.js'

const { p2r, ot2pave, PathIntersect } = createP5Pave2Riso({ Path, vec2 })

let channels = []
let render
let font = null
let divRects = []

// ============================================
// Configuration
// ============================================
const chars = [...'BIGBROTHERISWATCHINGYOU']     // 表示する文字列（配列）
const fontPath = '../fonts/BBH_Sans_Bartle/BBHSansBartle-Regular.ttf'

const halftoneSize = 15

// エフェクトのオンオフ
const useFilter = true
const useHalftone = true
const usePattern = true

// プロパティ
let blurSize
let halftoneArgs

// ============================================
// Helper: Recursive rectangle division
// ============================================
const generateDivRect = (posX, posY, width, height, minWidth, minHeight, chance = 0.5, array = [], depth = 0) => {
  // 最小サイズ以下の場合は分割せずに追加
  if (width <= minWidth || height <= minHeight) {
    array.push({
      x: posX,
      y: posY,
      width: width,
      height: height
    })
    return array
  }

  // 確率判定：分割するかどうか（depth = 0の時は必ず分割）
  if (depth > 1 && random(1) > chance) {
    array.push({
      x: posX,
      y: posY,
      width: width,
      height: height
    })
    return array
  }

  // 分割方向を決定（極端なアスペクト比を避ける）
  const aspectRatio = width / height
  let splitVertical
  if (aspectRatio > 1.25) {
    // 横長すぎる場合は縦に分割（左右に分ける）
    splitVertical = true
  } else if (aspectRatio < 0.75) {
    // 縦長すぎる場合は横に分割（上下に分ける）
    splitVertical = false
  } else {
    // それ以外はランダム
    splitVertical = random(1) > 0.5
  }

  if (splitVertical) {
    // 縦に分割（左右）
    const halfWidth = width / 2

    generateDivRect(posX, posY, halfWidth, height, minWidth, minHeight, chance, array, depth + 1)
    generateDivRect(posX + halfWidth, posY, halfWidth, height, minWidth, minHeight, chance, array, depth + 1)
  } else {
    // 横に分割（上下）
    const halfHeight = height / 2

    generateDivRect(posX, posY, width, halfHeight, minWidth, minHeight, chance, array, depth + 1)
    generateDivRect(posX, posY + halfHeight, width, halfHeight, minWidth, minHeight, chance, array, depth + 1)
  }

  return array
}

// ============================================
// Helper: Generate path for a single character
// ============================================
const getCharPath = (char, fontSize) => {
  if (!font) return null

  const pathData = font.getPath(char, 0, 0, fontSize)

  if (!pathData.commands || pathData.commands.length === 0) return null

  return ot2pave(pathData.commands)
}

// ============================================
// Preload: Load font
// ============================================
window.preload = async () => {
  if (!window.opentype) {
    console.error('opentype.js is not loaded')
    return
  }

  try {
    const response = await fetch(fontPath)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const buffer = await response.arrayBuffer()
    font = window.opentype.parse(buffer)
    console.log('Font loaded:', font.names.fontFamily?.en || font.names.fullName?.en || 'OK')
  } catch (err) {
    console.error('Font load failed:', err)
  }
}

// ============================================
// Setup
// ============================================
window.setup = () => {
  noLoop()
  createCanvas(3508, 2480)
  pixelDensity(1)

  channels = [
    new Riso('black'),
    new Riso('metallicgold'),
    new Riso('blue')
  ]
  window.risoChannels = channels

  render = p2r({
    channels,
    canvasSize: [width, height]
  })

  halftoneArgs = ['circle', halftoneSize, 254]

  const padding = width / 100

  // 画面全体を再帰分割（setup時に1回だけ）
  divRects = generateDivRect(padding, padding, width - padding * 2, height - padding * 2, width / 10, height / 8, 0.6)

  // フォントのロード待ち
  if (!font) {
    setTimeout(() => {
      if (font) redraw()
    }, 500)
  }
}

// ============================================
// Draw
// ============================================
window.draw = () => {
  if (!font) return

  background(255)
  channels.forEach(ch => ch.clear())

  const gap = width / 100

  // 各矩形に文字を配置
  for (let i = 0; i < divRects.length; i++) {
    const r = divRects[i]
    const char = chars[i % chars.length]

    // セルサイズのパス
    let cellPath = Path.rect([r.x + gap / 2, r.y + gap / 2], [r.x + r.width - gap / 2, r.y + r.height - gap / 2])
    let cellPathOffset = Path.rect([r.x - halftoneSize, r.y - halftoneSize], [r.x + r.width + halftoneSize, r.y + r.height + halftoneSize])

    // 矩形の短辺に合わせてフォントサイズを決定
    const fontSize = Math.max(r.width - gap / 2, r.height - gap / 2) * 1

    // 文字パスを生成
    const charPath = getCharPath(char, fontSize)
    if (!charPath) continue

    // 文字パスを矩形の中央に配置
    const bounds = Path.bounds(charPath)
    const charCenterX = (bounds[0][0] + bounds[1][0]) / 2
    const charCenterY = (bounds[0][1] + bounds[1][1]) / 2
    const rectCenterX = r.x + r.width / 2
    const rectCenterY = r.y + r.height / 2

    let centeredPath = Path.transform(
      charPath,
      mat2d.fromTranslation([rectCenterX - charCenterX, rectCenterY - charCenterY])
    )

    let intersected = PathIntersect(cellPath, centeredPath)

    const randomAngle = random(0, 360)
    const randomArgs = [random(r.width / 5, r.width / 3), random(r.width / 5, r.width / 3)]
    blurSize = randomArgs[0] / 5

    // fill生成関数（channelValsを都度指定可能）
    const createFill = (channelVals) => usePattern
      ? {
          type: 'pattern',
          PTN: 'stripe',
          patternAngle: 45,
          patternArgs: randomArgs,
          channelVals
        }
      : {
          type: 'solid',
          channelVals
        }

    render({
      path: cellPath,
      fill: {
        type: 'solid',
        channelVals: [100, 0, 0]
      },
      mode: 'cutout'
    })
    render({
      path: cellPathOffset,
      clippingPath: cellPath,
      fill: createFill([0, 100, 0]),
      ...(useFilter &&
        {
          filter: [
            {
              filterType: 'blur',
              filterArgs: [blurSize]
            }
          ]
        }
      ),
      ...(useHalftone &&
        {
          halftone: {
            halftoneArgs
          }
        }
      ),
      mode: 'join'
    })
    render({
      path: cellPath,
      clippingPath: intersected,
      fill: {
        type: 'solid',
        channelVals: [100, 0, 0]
      },
      mode: 'cutout'
    })
    render({
      path: cellPathOffset,
      clippingPath: intersected,
      fill: createFill([0, 100, 0]),
      ...(useFilter &&
        {
          filter: [
            {
              filterType: 'invert'
            },
            {
              filterType: 'blur',
              filterArgs: [blurSize]
            }
          ]
        }
      ),
      ...(useHalftone &&
        {
          halftone: {
            halftoneArgs
          }
        }
      ),
      mode: 'join'
    })
  }

  drawRiso()
}
