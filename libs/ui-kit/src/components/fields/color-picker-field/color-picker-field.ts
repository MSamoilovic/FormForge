import { Component, computed, forwardRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { FieldType } from '../../../../../models/src';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';

@Component({
  selector: 'app-color-picker-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './color-picker-field.html',
  styleUrl: './color-picker-field.scss',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerField),
      multi: true,
    },
  ],
})
export class ColorPickerField implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('#000000');
  formControl = input<FormControl | undefined>(undefined);
  fieldType = input<FieldType>(FieldType.ColorPicker);
  required = input<boolean>(false);
  hint = input<string | null>(null);

  computedErrorMessage = computed(() => {
    const control = this.formControl();
    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['pattern']) {
      return 'Please enter a valid color value.';
    }

    return 'Value is not valid.';
  });

  writeValue(value: string | null): void {
    this.formControl()?.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.formControl()?.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.formControl()?.statusChanges.subscribe(() => fn());
  }

  setDisabledState?(isDisabled: boolean): void {
    return isDisabled
      ? this.formControl()?.disable()
      : this.formControl()?.enable();
  }
}

