import { Type } from '@angular/core';
import { FieldType } from '@form-forge/models';
import {
  TextField,
  NumberField,
  SelectorField,
  MultiSelectField,
  CheckboxField,
  ToggleSwitchField,
  RadioField,
  DateField,
  EmailField,
  PhoneField,
  TextAreaField,
  FileUploadField,
  RichTextField,
  ColorPickerField,
  LikertScaleField,
} from '@form-forge/ui-kit';

export const FIELD_TYPE_MAP: Record<FieldType, Type<any>> = {
  [FieldType.Text]: TextField,
  [FieldType.Number]: NumberField,
  [FieldType.Select]: SelectorField,
  [FieldType.MultiSelect]: MultiSelectField,
  [FieldType.Checkbox]: CheckboxField,
  [FieldType.ToggleSwitch]: ToggleSwitchField,
  [FieldType.Radio]: RadioField,
  [FieldType.Date]: DateField,
  [FieldType.Email]: EmailField,
  [FieldType.Phone]: PhoneField,
  [FieldType.TextArea]: TextAreaField,
  [FieldType.FileUpload]: FileUploadField,
  [FieldType.RichText]: RichTextField,
  [FieldType.ColorPicker]: ColorPickerField,
  [FieldType.LikertScale]: LikertScaleField,
};
