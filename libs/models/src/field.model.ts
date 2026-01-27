import { AbstractControl } from '@angular/forms';
import { ValidationRule } from './validation.model';
import { FormRule } from './rule.model';
import { FormTheme } from './theme.model';

export enum FieldType {
  Text = 'text',
  Number = 'number',
  Select = 'select',
  MultiSelect = 'multiSelect',
  Radio = 'radio',
  Checkbox = 'checkbox',
  ToggleSwitch = 'toggleSwitch',
  Date = 'date',
  Email = 'email',
  Phone = 'phone',
  TextArea = 'textArea',
  FileUpload = 'fileUpload',
  RichText = 'richText',
  ColorPicker = 'colorPicker',
  LikertScale = 'likertScale',
  Url = 'url',
  Password = 'password',
}

export enum ColorFormat {
  HEX = 'hex',
  RGB = 'rgb',
  RGBA = 'rgba',
  HSL = 'hsl',
  HSLA = 'hsla',
}


export type FieldValue<T extends FieldType> = T extends FieldType.MultiSelect
  ? string[]
  : T extends FieldType.Checkbox | FieldType.ToggleSwitch
    ? boolean
    : T extends FieldType.Number
      ? number
      : T extends FieldType.Date
        ? Date | string
        : T extends FieldType.LikertScale
          ? number
          : string;


export type OptionValue = string | number | boolean;

export interface FieldOption {
  label: string;
  value: OptionValue;
}


export interface BaseFieldComponentInputs {
  [key: string]: unknown;
  label: string;
  placeholder?: string;
  formControl?: AbstractControl;
  required?: boolean;
  hint?: string | null;
  fieldType?: FieldType;
}


export interface OptionsFieldComponentInputs extends BaseFieldComponentInputs {
  options?: FieldOption[];
}


export interface NumberFieldComponentInputs extends BaseFieldComponentInputs {
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Extended inputs for ColorPicker field.
 */
export interface ColorPickerFieldComponentInputs
  extends BaseFieldComponentInputs {
  colorFormat?: ColorFormat;
}

/**
 * Extended inputs for Phone field.
 */
export interface PhoneFieldComponentInputs extends BaseFieldComponentInputs {
  defaultCountry?: string;
  showCountrySelector?: boolean;
}


export type FieldComponentInputs =
  | BaseFieldComponentInputs
  | OptionsFieldComponentInputs
  | NumberFieldComponentInputs
  | ColorPickerFieldComponentInputs
  | PhoneFieldComponentInputs;

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
  validations?: ValidationRule[];
  rules?: FormRule[];
  theme?: FormTheme;
  // Number field specific properties
  min?: number;
  max?: number;
  step?: number;
  // Color picker specific properties
  colorFormat?: ColorFormat;
  // Phone field specific properties
  defaultCountry?: string; // ISO 3166-1 alpha-2 country code (e.g., 'RS', 'US')
  showCountrySelector?: boolean;
}

export interface AvailableField {
  type: FieldType;
  label: string;
  icon: string;
}
