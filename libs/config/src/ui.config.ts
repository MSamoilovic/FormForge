/**
 * Centralized UI configuration values.
 * These values should be kept in sync with CSS custom properties.
 */

/**
 * Border radius scale
 */
export const BORDER_RADIUS = {
  /** Small: 4px - used for scrollbars, small chips */
  sm: '4px',
  /** Medium: 8px - standard radius for form fields, cards */
  md: '8px',
  /** Large: 12px - used for larger containers, modals */
  lg: '12px',
  /** Full: 9999px - used for pills, circular elements */
  full: '9999px',
} as const;

/**
 * Spacing scale (8px base)
 */
export const SPACING = {
  /** Extra small: 4px */
  xs: '4px',
  /** Small: 8px */
  sm: '8px',
  /** Medium: 16px */
  md: '16px',
  /** Large: 24px */
  lg: '24px',
  /** Extra large: 32px */
  xl: '32px',
} as const;

/**
 * Transition durations
 */
export const TRANSITIONS = {
  /** Fast: 150ms - micro-interactions */
  fast: '150ms',
  /** Normal: 200ms - standard transitions */
  normal: '200ms',
  /** Slow: 300ms - complex animations */
  slow: '300ms',
} as const;

/**
 * Transition presets with easing
 */
export const TRANSITION_PRESETS = {
  fast: `${TRANSITIONS.fast} ease`,
  normal: `${TRANSITIONS.normal} ease`,
  slow: `${TRANSITIONS.slow} ease`,
} as const;

/**
 * Shadow presets
 */
export const SHADOWS = {
  /** Small shadow: subtle elevation */
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  /** Medium shadow: cards, dropdowns */
  md: '0 2px 8px rgba(0, 0, 0, 0.08)',
  /** Large shadow: modals, popovers */
  lg: '0 4px 16px rgba(0, 0, 0, 0.12)',
} as const;

/**
 * Z-index scale
 */
export const Z_INDEX = {
  /** Dropdown menus, tooltips */
  dropdown: 1000,
  /** Sticky headers */
  sticky: 1020,
  /** Modal overlays */
  modal: 1040,
  /** Toast notifications */
  toast: 1060,
  /** Tooltips */
  tooltip: 1080,
} as const;

/**
 * Aggregate UI configuration
 */
export const UI_CONFIG = {
  borderRadius: BORDER_RADIUS,
  spacing: SPACING,
  transitions: TRANSITIONS,
  transitionPresets: TRANSITION_PRESETS,
  shadows: SHADOWS,
  zIndex: Z_INDEX,
} as const;

