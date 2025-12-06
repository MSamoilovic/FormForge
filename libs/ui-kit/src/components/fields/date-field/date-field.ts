import { Component, computed, forwardRef, input } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FieldType } from '../../../../../models/src';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';

@Component({
  selector: 'app-date-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './date-field.html',
  styleUrl: './date-field.scss',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateField),
      multi: true,
    },
  ],
})
export class DateField implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('');
  formControl = input<FormControl | undefined>(undefined);
  fieldType = input<FieldType>(FieldType.Date);
  required = input<boolean>(false);
  hint = input<string | null>(null);

  computedErrorMessage = computed(() => {
    const control = this.formControl();
    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'Ovo polje je obavezno.';
    }
    if (control.errors['matDatepickerParse']) {
      return 'Unesite validan datum.';
    }

    return 'Unesena vrednost nije validna.';
  });

  writeValue(value: any): void {
    this.formControl()?.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.formControl()?.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.formControl()?.statusChanges.subscribe(() => fn());
  }

  setDisabledState?(isDisabled: boolean): void {
    return isDisabled
      ? this.formControl()?.disable()
      : this.formControl()?.enable();
  }
}
