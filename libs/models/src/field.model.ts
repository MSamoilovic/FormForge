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
}

export enum ColorFormat {
  HEX = 'hex',
  RGB = 'rgb',
  RGBA = 'rgba',
  HSL = 'hsl',
  HSLA = 'hsla',
}

export interface FieldOption {
  label: string;
  value: any;
}

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
