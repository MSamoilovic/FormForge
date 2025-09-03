import { DynamicField } from './field.model';

export interface FormSchema {
  id: string;
  name: string;
  description?: string;
  fields: DynamicField[];
}
