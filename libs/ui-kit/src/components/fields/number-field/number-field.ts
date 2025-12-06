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
  selector: 'app-number-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './number-field.html',
  styleUrl: './number-field.scss',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberField),
      multi: true,
    },
  ],
})
export class NumberField implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('');
  formControl = input<FormControl | undefined>(undefined);
  fieldType = input<FieldType>(FieldType.Number);
  min = input<number | undefined>(undefined);
  max = input<number | undefined>(undefined);
  step = input<number | undefined>(undefined);
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
    if (control.errors['min']) {
      const min = control.errors['min'].min;
      return `Value must be at least ${min}.`;
    }
    if (control.errors['max']) {
      const max = control.errors['max'].max;
      return `Value can't be larger than ${max}.`;
    }

    return 'Entered value is not valid.';
  });

  writeValue(value: number | null): void {
    this.formControl()?.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: number | null) => void): void {
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
