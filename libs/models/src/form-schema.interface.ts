import { DynamicField } from './field.interface';

export interface FormSchema {
  id: string;
  name: string;
  description?: string;
  fields: DynamicField[];
}
