import { FormRule } from './rule.model';
import { FormField } from './field.model';

export interface FormSchema {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  rules?: FormRule[];
}
