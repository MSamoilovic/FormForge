import { Component, computed, forwardRef, input } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FieldOption, FieldType } from '../../../../../models/src';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';

@Component({
  selector: 'app-likert-scale-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './likert-scale-field.html',
  styleUrl: './likert-scale-field.scss',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LikertScaleField),
      multi: true,
    },
  ],
})
export class LikertScaleField implements ControlValueAccessor {
  label = input<string>('');
  formControl = input<FormControl | undefined>(undefined);
  options = input<FieldOption[]>([]);
  fieldType = input<FieldType>(FieldType.LikertScale);
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

