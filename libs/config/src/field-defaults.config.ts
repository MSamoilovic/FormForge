import { ColorFormat, FieldOption } from '@form-forge/models';

/**
 * Centralized configuration for field default values.
 * All hardcoded field defaults should be defined here for easy maintenance and testing.
 */

/**
 * Phone field default configuration
 */
export const PHONE_FIELD_DEFAULTS = {
  /** Default country ISO 3166-1 alpha-2 code */
  defaultCountry: 'RS',
  /** Whether to show country selector by default */
  showCountrySelector: true,
  /** Default emoji flag when country is not found */
  defaultFlag: '🇷🇸',
} as const;

/**
 * Color picker field default configuration
 */
export const COLOR_PICKER_DEFAULTS = {
  /** Default color format */
  colorFormat: ColorFormat.HEX,
  /** Default color value */
  defaultColor: '#000000',
  /** Available color format options for UI */
  formatOptions: [
    { value: ColorFormat.HEX, label: 'HEX (#RRGGBB)' },
    { value: ColorFormat.RGB, label: 'RGB (r, g, b)' },
    { value: ColorFormat.RGBA, label: 'RGBA (r, g, b, a)' },
    { value: ColorFormat.HSL, label: 'HSL (h, s%, l%)' },
    { value: ColorFormat.HSLA, label: 'HSLA (h, s%, l%, a)' },
  ],
} as const;

/**
 * Number field default configuration
 */
export const NUMBER_FIELD_DEFAULTS = {
  /** Default step value */
  step: 1,
  /** Default min value (undefined = no limit) */
  min: undefined as number | undefined,
  /** Default max value (undefined = no limit) */
  max: undefined as number | undefined,
} as const;

/**
 * Rich text field default configuration
 */
export const RICH_TEXT_DEFAULTS = {
  /** Minimum height in pixels */
  minHeight: 200,
  /** Maximum height in pixels */
  maxHeight: 400,
} as const;

/**
 * Select/Radio/MultiSelect default options
 */
export const SELECT_FIELD_DEFAULTS = {
  /** Default options for new select/radio/multiselect fields */
  defaultOptions: [
    { label: 'Option 1', value: 'option1' },
  ] as FieldOption[],
} as const;

/**
 * Likert scale field default configuration
 */
export const LIKERT_SCALE_DEFAULTS = {
  /** Default options for Likert scale */
  defaultOptions: [
    { label: 'Strongly Disagree', value: 'strongly_disagree' },
    { label: 'Disagree', value: 'disagree' },
    { label: 'Neutral', value: 'neutral' },
    { label: 'Agree', value: 'agree' },
    { label: 'Strongly Agree', value: 'strongly_agree' },
  ] as FieldOption[],
} as const;

/**
 * Aggregate field defaults configuration
 * Use this when you need access to all field defaults in one place
 */
export const FIELD_DEFAULTS = {
  phone: PHONE_FIELD_DEFAULTS,
  colorPicker: COLOR_PICKER_DEFAULTS,
  number: NUMBER_FIELD_DEFAULTS,
  richText: RICH_TEXT_DEFAULTS,
  select: SELECT_FIELD_DEFAULTS,
  likertScale: LIKERT_SCALE_DEFAULTS,
} as const;

