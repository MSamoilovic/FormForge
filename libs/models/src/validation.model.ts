export enum ValidatorType {
  Required = 'required',
  MinLength = 'minLength',
  MaxLength = 'maxLength',
  Pattern = 'pattern',
  Min = 'min',
  Max = 'max',
}

export interface ValidationRule {
  type: ValidatorType;
  value?: any;
  message: string;
}
