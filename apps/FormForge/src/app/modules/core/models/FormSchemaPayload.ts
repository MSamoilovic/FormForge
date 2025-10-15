import { FormField, FormRule, FormTheme } from '@form-forge/models';

export class FormSchemaPayload {
  constructor(
    public name: string,
    public description: string,
    public fields: FormField[],
    public rules: FormRule[],
    public formTheme?: FormTheme
  ) {}
}
