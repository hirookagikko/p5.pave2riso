/**
 * Font Utilities Test
 *
 * Tests ot2pave function with various glyphs including holes
 */

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { vec2 } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'
import opentype from 'https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/+esm'
import { p2r, ot2pave } from '../dist/p5.pave2riso.js'

// Make Path and vec2 available globally for wrappers
window.Path = Path
window.vec2 = vec2

let channels = []
let render
let fonts = []

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
  render = p2r({
    channels,
    canvasSize: [width, height]
  })

  document.getElementById('export-btn').addEventListener('click', () => {
    exportRiso()
    console.log('Exported!')
  })

  // Load fonts asynchronously
  console.log('Loading fonts...')
  loadFontsAndDraw()
}

async function loadFontsAndDraw() {
  try {
    // Load both fonts
    const fontConfigs = [
      {
        name: 'Zen Antique Soft',
        url: '../fonts/Zen_Antique_Soft/ZenAntiqueSoft-Regular.ttf'
      },
      {
        name: 'Zen Maru Gothic',
        url: '../fonts/Zen_Maru_Gothic/ZenMaruGothic-Regular.ttf'
      }
    ]

    for (const config of fontConfigs) {
      console.log(`Fetching font from: ${config.url}`)
      const response = await fetch(config.url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      console.log(`${config.name} data received, size: ${arrayBuffer.byteLength} bytes`)

      const font = opentype.parse(arrayBuffer)
      console.log(`${config.name} loaded successfully:`, font.names.fontFamily)
      fonts.push({ name: config.name, font })
    }

    // Draw the tests
    drawTests()
  } catch (error) {
    console.error('Error loading fonts:', error)
    // Fallback: show error message on canvas
    background(255)
    fill(255, 0, 0)
    textSize(32)
    textAlign(CENTER, CENTER)
    text('Error loading fonts. Check console.', width / 2, height / 2)
  }
}

function drawTests() {
  background(255)
  channels.forEach(ch => ch.clear())

  const fontSize = 150
  const margin = width * 0.05
  const columnWidth = width / 2

  // Test data
  const testLetters = ['A', 'O', 'P', 'D']
  const testNumbers = ['0', '6', '8', '9']
  const testHiragana = ['あ', 'お', 'ぬ', 'ん']
  const testKanji = ['日', '田', '品', '森']

  const colors = [
    [100, 0, 0],   // Red
    [0, 100, 0],   // Blue
    [0, 0, 100],   // Black
    [100, 100, 0]  // Red + Blue
  ]

  // Render tests for each font side by side
  fonts.forEach((fontData, fontIndex) => {
    const { name, font } = fontData
    const columnX = fontIndex * columnWidth + margin

    console.log(`\n========== Testing Font: ${name} ==========`)

    // Font name label
    push()
    fill(0)
    noStroke()
    textSize(40)
    textAlign(LEFT, TOP)
    text(name, columnX, margin * 0.3)
    pop()

    let y = margin * 2 + fontSize

    // ============================================
    // Test 1: Basic Latin letters with holes
    // ============================================

    let x = columnX

    testLetters.forEach((letter, i) => {
      try {
        console.log(`[${name}] Processing letter: ${letter}`)

        const glyph = font.charToGlyph(letter)
        const glyphPath = glyph.getPath(x, y, fontSize)
        const pavePath = ot2pave(glyphPath.commands)

        render({
          path: pavePath,
          fill: {
            type: 'solid',
            channelVals: colors[i]
          },
          mode: 'overprint'
        })

        x += fontSize * 0.9
      } catch (err) {
        console.error(`[${name}] Error rendering ${letter}:`, err)
      }
    })

    // Label for this test
    push()
    fill(0)
    noStroke()
    textSize(24)
    textAlign(LEFT, TOP)
    text('Latin (A,O,P,D)', columnX, y - fontSize * 1.1)
    pop()

    // ============================================
    // Test 2: Numbers with holes
    // ============================================

    y += fontSize * 1.3
    x = columnX

    testNumbers.forEach((num, i) => {
      const glyph = font.charToGlyph(num)
      const glyphPath = glyph.getPath(x, y, fontSize)
      const pavePath = ot2pave(glyphPath.commands)

      render({
        path: pavePath,
        fill: {
          type: 'solid',
          channelVals: colors[i]
        },
        mode: 'overprint'
      })

      x += fontSize * 0.9
    })

    push()
    fill(0)
    noStroke()
    textSize(24)
    textAlign(LEFT, TOP)
    text('Numbers (0,6,8,9)', columnX, y - fontSize * 1.1)
    pop()

    // ============================================
    // Test 3: Japanese hiragana
    // ============================================

    y += fontSize * 1.3
    x = columnX

    testHiragana.forEach((char, i) => {
      const glyph = font.charToGlyph(char)
      const glyphPath = glyph.getPath(x, y, fontSize)
      const pavePath = ot2pave(glyphPath.commands)

      render({
        path: pavePath,
        fill: {
          type: 'solid',
          channelVals: colors[i]
        },
        mode: 'overprint'
      })

      x += fontSize * 0.9
    })

    push()
    fill(0)
    noStroke()
    textSize(24)
    textAlign(LEFT, TOP)
    text('Hiragana (あ,お,ぬ,ん)', columnX, y - fontSize * 1.1)
    pop()

    // ============================================
    // Test 4: Japanese kanji
    // ============================================

    y += fontSize * 1.3
    x = columnX

    testKanji.forEach((char, i) => {
      const glyph = font.charToGlyph(char)
      const glyphPath = glyph.getPath(x, y, fontSize)
      const pavePath = ot2pave(glyphPath.commands)

      render({
        path: pavePath,
        fill: {
          type: 'solid',
          channelVals: colors[i]
        },
        mode: 'overprint'
      })

      x += fontSize * 0.9
    })

    push()
    fill(0)
    noStroke()
    textSize(24)
    textAlign(LEFT, TOP)
    text('Kanji (日,田,品,森)', columnX, y - fontSize * 1.1)
    pop()
  })

  // ============================================
  // Test 5: Error handling - empty commands
  // ============================================

  console.log(`\n=== Testing error handling: empty commands ===`)
  const emptyPath = ot2pave([])
  console.log('Empty commands result:', emptyPath)

  push()
  fill(0)
  noStroke()
  textSize(28)
  textAlign(CENTER, BOTTOM)
  text('Error handling test passed (empty commands)', width / 2, height - margin)
  pop()

  drawRiso()
}
