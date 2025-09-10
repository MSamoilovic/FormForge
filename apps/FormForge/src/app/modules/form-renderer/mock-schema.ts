import { FieldType, FormSchema, ValidatorType } from '@form-forge/models';

export const MOCK_FORM_SCHEMA: FormSchema = {
  id: '...',
  name: 'Uzorak Prijave za Događaj',
  description: 'Molimo popunite Vaše podatke.',
  fields: [
    {
      id: 'ime',
      type: FieldType.Text,
      label: 'Ime i Prezime',
      placeholder: 'Ime Prezime',
      validations: [
        { type: ValidatorType.Required, message: 'Ovo polje je obavezno.' },
      ],
    },
    {
      id: 'email',
      type: FieldType.Text,
      label: 'Email Adresa',
      validations: [
        { type: ValidatorType.Required, message: 'Email je obavezan.' },
        {
          type: ValidatorType.Pattern,
          value: '^\\S+@\\S+\\.\\S+$',
          message: 'Unesite validan email.',
        },
      ],
    },
    {
      id: 'godine',
      type: FieldType.Number,
      label: 'Godine',
      validations: [
        {
          type: ValidatorType.Min,
          value: 18,
          message: 'Morate biti punoletni.',
        },
      ],
    },
    {
      id: 'zanimanje',
      type: FieldType.Select,
      label: 'Zanimanje',
      options: [
        { label: 'Programer', value: 'dev' },
        { label: 'Dizajner', value: 'design' },
        { label: 'Menadžer', value: 'pm' },
      ],
    },
    {
      id: 'uslovi',
      type: FieldType.Checkbox,
      label: 'Prihvatam uslove korišćenja',
      validations: [
        { type: ValidatorType.Required, message: 'Morate prihvatiti uslove.' },
      ],
    },
  ],
  rules: [],
};
