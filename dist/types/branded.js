/**
 * Branded types for type-safe value constraints
 *
 * Branded types add compile-time type safety to primitive values
 * that have semantic constraints (like 0-100 percentage values).
 *
 * @module types/branded
 */
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
export function percentage(value) {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
        throw new RangeError(`Percentage must be a finite number between 0 and 100, got ${value}`);
    }
    return value;
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
export function unsafePercentage(value) {
    return value;
}
/**
 * Check if a number is a valid percentage (0-100)
 *
 * @param value - Number to check
 * @returns true if value is between 0 and 100 inclusive
 */
export function isValidPercentage(value) {
    return Number.isFinite(value) && value >= 0 && value <= 100;
}
/**
 * Clamp a number to percentage range (0-100)
 *
 * @param value - Number to clamp
 * @returns Clamped value as Percentage
 */
export function clampPercentage(value) {
    if (!Number.isFinite(value)) {
        throw new RangeError(`Cannot clamp non-finite value: ${value}`);
    }
    return Math.max(0, Math.min(100, value));
}
//# sourceMappingURL=branded.js.map