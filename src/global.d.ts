/**
 * グローバル型定義
 *
 * p5.jsとその他のグローバル変数の型定義
 */

/// <reference types="p5" />

// linearly型定義（簡易版）
declare module 'linearly' {
  export interface vec2 {
    [0]: number
    [1]: number
  }

  export namespace vec2 {
    export function of(x: number, y: number): vec2
  }

  export interface mat2d {
    [key: string]: unknown
  }

  export namespace mat2d {
    export function identity(): mat2d
  }

  export namespace scalar {
    export function lerp(a: number, b: number, t: number): number
  }
}

// Pave.js型定義（簡易版）
declare global {
  interface Window {
    Path: {
      bounds(path: unknown): [[number, number], [number, number]]
      drawToCanvas(path: unknown, context: CanvasRenderingContext2D): void
      circle(center: [number, number], radius: number): unknown
      rect(topLeft: [number, number], size: [number, number]): unknown
      distort(path: unknown, distortion: unknown): unknown
    }
    vec2: {
      of(x: number, y: number): unknown
    }
    halftoneImage?(graphics: p5.Graphics, ...args: number[]): p5.Graphics
    ditherImage?(graphics: p5.Graphics, ...args: number[]): p5.Graphics
    // p5.js angle mode
    _angleMode?: string
    DEGREES?: string
    RADIANS?: string
  }

  // p5.jsグローバル関数
  function createGraphics(width: number, height: number): p5.Graphics
  function pixelDensity(): number
  function pixelDensity(density: number): void
  function map(value: number, start1: number, stop1: number, start2: number, stop2: number): number
  function color(gray: number): p5.Color
  function color(v1: number, v2: number, v3: number): p5.Color
  function radians(degrees: number): number

  // p5.js定数
  const BLEND: string
  const REMOVE: string
  const ROUND: string
  const SQUARE: string
  const PROJECT: string
  const DEGREES: string
  const RADIANS: string

  // p5.pattern型定義
  interface PTNObject {
    [key: string]: (...args: unknown[]) => unknown
  }

  const PTN: PTNObject

  // p5.Image型定義
  namespace p5 {
    interface Image {
      width: number
      height: number
    }

    interface Graphics {
      // 基本メソッド
      background(value: number): void
      background(v1: number, v2: number, v3: number): void
      clear(): void
      push(): void
      pop(): void
      remove(): void
      pixelDensity(density: number): void

      // 描画メソッド
      fill(value: number): void
      fill(v1: number, v2: number, v3: number): void
      noFill(): void
      stroke(value: number): void
      stroke(v1: number, v2: number, v3: number): void
      noStroke(): void
      strokeWeight(weight: number): void
      strokeCap(cap: string): void

      // 画像操作
      image(img: p5.Graphics | p5.Image, x: number, y: number, w?: number, h?: number): void
      filter(filterType: string, ...args: number[]): void
      blendMode(mode: string): void

      // 変形
      translate(x: number, y: number): void
      rotate(angle: number): void

      // エフェクト
      erase(): void
      noErase(): void

      // Canvas関連
      drawingContext: CanvasRenderingContext2D

      // p5.pattern拡張
      patternAngle(angle: number): void
      pattern(p: unknown): void
      rectPattern(x: number, y: number, w: number, h: number): void

      // 図形描画
      rect(x: number, y: number, w: number, h: number): void
    }
  }
}

export {}
