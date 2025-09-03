import { FieldType } from './field-type.enum';

export interface DynamicField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  value?: any;
  required?: boolean;
  options?: string[];
  validations?: any[];
  conditional?: {
    fieldId: string;
    value: any;
  };
}
