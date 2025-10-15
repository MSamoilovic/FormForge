import { ValidationRule } from './validation.model';
import { FormRule } from './rule.model';
import { FormTheme } from './theme.model';

export enum FieldType {
  Text = 'text',
  Number = 'number',
  Select = 'select',
  Radio = 'radio',
  Checkbox = 'checkbox',
  Date = 'date',
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
}

export interface AvailableField {
  type: FieldType;
  label: string;
  icon: string;
}
