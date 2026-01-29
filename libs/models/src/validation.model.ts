export enum ValidatorType {
  Required = 'required',
  MinLength = 'minLength',
  MaxLength = 'maxLength',
  Pattern = 'pattern',
  Min = 'min',
  Max = 'max',
  Email = 'email',
  Url = 'url',
}

export interface ValidationRule {
  type: ValidatorType;
  value?: string | number | RegExp;
  message: string;
}
