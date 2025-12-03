/**
 * Path.offset Debug Test
 *
 * Pave.jsのPath.offset問題をデバッグするためのシンプルなスケッチ
 */

import { Path } from 'https://cdn.jsdelivr.net/npm/@baku89/pave@0.7.1/+esm'
import { mat2d } from 'https://cdn.jsdelivr.net/npm/linearly@0.32.0/+esm'

let testPath = null
let offsetPath = null
let errorMessage = null

window.setup = () => {
  createCanvas(800, 600)

  // シンプルな矩形パスを作成
  testPath = Path.rect([200, 200], [600, 400])

  // offsetを試す
  try {
    console.log('Testing Path.offset...')
    console.log('Original path:', testPath)

    // 小さいoffset値から試す
    offsetPath = Path.offset(testPath, 20)

    console.log('Offset path:', offsetPath)
  } catch (err) {
    errorMessage = err.message
    console.error('Path.offset error:', err)
  }
}

window.draw = () => {
  background(30)

  // 元のパス（白）
  if (testPath) {
    stroke(255)
    strokeWeight(2)
    noFill()
    drawPath(testPath)
  }

  // オフセットパス（緑）
  if (offsetPath) {
    stroke(0, 255, 100)
    strokeWeight(2)
    noFill()
    drawPath(offsetPath)
  }

  // エラーメッセージ
  if (errorMessage) {
    fill(255, 100, 100)
    noStroke()
    textSize(16)
    text('Error: ' + errorMessage, 20, 30)
  }

  // ラベル
  fill(255)
  noStroke()
  textSize(14)
  text('White: Original path', 20, height - 50)
  text('Green: Offset path (20px)', 20, height - 30)
}

// Paveパスを描画するヘルパー
function drawPath(path) {
  if (!path || !path.curves) return

  beginShape()
  for (const curve of path.curves) {
    if (curve.vertices) {
      for (let i = 0; i < curve.vertices.length; i++) {
        const v = curve.vertices[i]
        if (i === 0) {
          vertex(v[0], v[1])
        } else {
          // ベジェ曲線の場合
          const cmd = curve.command?.[i]
          if (cmd === 'C' && i + 2 < curve.vertices.length) {
            bezierVertex(
              curve.vertices[i][0], curve.vertices[i][1],
              curve.vertices[i+1][0], curve.vertices[i+1][1],
              curve.vertices[i+2][0], curve.vertices[i+2][1]
            )
            i += 2
          } else {
            vertex(v[0], v[1])
          }
        }
      }
    }
  }
  endShape(CLOSE)
}
