// Preprocessor static values - these are compile-time constants
const strings = {
    DATE_TIME: 'Date/Time Taken'
} as const

// Export as const to ensure it's treated as a static value
export default strings

// Export individual constants for direct access if needed
export const DATE_TIME = strings.DATE_TIME