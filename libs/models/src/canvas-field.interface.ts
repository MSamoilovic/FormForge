import { FieldType } from './field-type.enum';

//TODO: Zasad ostaviti string u type kad budem izmenio za komponente
export interface CanvasField {
  id: string;
  type: FieldType | string;
  label: string;
  placeholder?: string;
  required?: boolean;
}
