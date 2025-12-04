/**
 * Branded types for type-safe value constraints
 *
 * Branded types add compile-time type safety to primitive values
 * that have semantic constraints (like 0-100 percentage values).
 *
 * @module types/branded
 */

/**
 * Brand helper type
 * Creates a nominal type from a primitive type
 */
type Brand<T, B extends string> = T & { readonly __brand: B }

/**
 * Percentage value (0-100)
 *
 * Used for ink density, gradient positions, and other percentage-based values.
 * The value should be between 0 and 100 inclusive.
 *
 * @example
 * ```typescript
 * const depth = 75 as Percentage  // 75% ink density
 * const position = 50 as Percentage  // 50% position in gradient
 * ```
 */
export type Percentage = Brand<number, 'Percentage'>

/**
 * Pixel value (positive number)
 *
 * Used for dimensions, stroke weights, and other pixel-based measurements.
 *
 * @example
 * ```typescript
 * const weight = 3 as PixelValue  // 3px stroke weight
 * ```
 */
export type PixelValue = Brand<number, 'PixelValue'>

/**
 * Dash pattern tuple [lineLength, gapLength]
 *
 * Represents a dashed line pattern with alternating line and gap segments.
 * Both values should be positive numbers in pixels.
 *
 * @example
 * ```typescript
 * const pattern: DashPattern = [10, 5]  // 10px line, 5px gap
 * ```
 */
export type DashPattern = [number, number]

/**
 * Create a Percentage value with runtime validation
 *
 * @param value - Number to convert (should be 0-100)
 * @returns Branded Percentage value
 * @throws RangeError if value is outside 0-100 range
 *
 * @example
 * ```typescript
 * const depth = percentage(75)  // Safe: returns 75 as Percentage
 * const invalid = percentage(150)  // Throws: RangeError
 * ```
 */
export function percentage(value: number): Percentage {
  if (value < 0 || value > 100) {
    throw new RangeError(`Percentage must be between 0 and 100, got ${value}`)
  }
  return value as Percentage
}

/**
 * Create a Percentage value without validation (for internal use)
 *
 * Use this when the value has already been validated or comes from
 * a trusted source.
 *
 * @param value - Number to convert
 * @returns Branded Percentage value
 */
export function unsafePercentage(value: number): Percentage {
  return value as Percentage
}

/**
 * Check if a number is a valid percentage (0-100)
 *
 * @param value - Number to check
 * @returns true if value is between 0 and 100 inclusive
 */
export function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100
}

/**
 * Clamp a number to percentage range (0-100)
 *
 * @param value - Number to clamp
 * @returns Clamped value as Percentage
 */
export function clampPercentage(value: number): Percentage {
  return Math.max(0, Math.min(100, value)) as Percentage
}
