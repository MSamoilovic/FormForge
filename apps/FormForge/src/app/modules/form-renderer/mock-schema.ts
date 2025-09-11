import {
  FieldType,
  FormSchema,
  RuleActionType,
  RuleConditionOperator,
} from '@form-forge/models';

export const MOCK_FORM_SCHEMA: FormSchema = {
  id: '...',
  name: 'Test Form with Rules',
  fields: [
    { id: 'ime', type: FieldType.Text, label: 'Vaše ime' },
    {
      id: 'prikazi_email',
      type: FieldType.Checkbox,
      label: 'Želite li da unesete email?',
    },
    { id: 'email', type: FieldType.Text, label: 'Email Adresa' },
  ],
  rules: [
    {
      id: 'pravilo1',
      conditions: [
        {
          fieldId: 'prikazi_email',
          operator: RuleConditionOperator.Equals,
          value: true,
        },
      ],
      actions: [{ targetFieldId: 'email', type: RuleActionType.Show }],
    },
  ],
};
