import { FieldType } from './field-type.enum';

export interface CanvasField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options: string[];
}
