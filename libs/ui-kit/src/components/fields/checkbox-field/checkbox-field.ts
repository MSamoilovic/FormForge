import { CommonModule } from '@angular/common';
import { Component, computed, forwardRef, input } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { FieldError } from '../../field-error/field-error';
import { FieldHint } from '../../field-hint/field-hint';

@Component({
  selector: 'app-checkbox-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FieldError, FieldHint],
  templateUrl: './checkbox-field.html',
  styleUrls: ['./checkbox-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxField),
      multi: true,
    },
  ],
})
export class CheckboxField implements ControlValueAccessor {
  label = input<string>('');
  formControl = input<FormControl>();
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

    return 'The entered value is not valid.';
  });

  shouldShowError = computed(() => {
    const control = this.formControl();
    const errorMsg = this.computedErrorMessage();
    return (
      errorMsg !== null && control !== undefined && (control.touched || control.dirty) && control.invalid
    );
  });

  shouldShowHint = computed(() => {
    return (
      !this.shouldShowError() && this.hint() !== null && this.hint() !== ''
    );
  });

  writeValue(value: boolean | null): void {
    this.formControl()?.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: boolean | null) => void): void {
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
