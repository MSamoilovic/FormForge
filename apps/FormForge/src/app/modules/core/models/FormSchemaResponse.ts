import { FormSchemaPayload } from './FormSchemaPayload';

export class FormSchemaResponse extends FormSchemaPayload {
  id: string | undefined;
}

export type FormSchema = FormSchemaResponse;
