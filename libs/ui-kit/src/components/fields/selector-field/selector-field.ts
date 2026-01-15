import { Component, computed, forwardRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { FieldOption, FieldType } from '@form-forge/models';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';

@Component({
  selector: 'app-selector-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './selector-field.html',
  styleUrl: './selector-field.scss',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorField),
      multi: true,
    },
  ],
})
export class SelectorField implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly options = input<FieldOption[]>([]);
  readonly formControl = input<FormControl | undefined>(undefined);
  readonly placeholder = input<string>('');
  readonly fieldType = input<FieldType>(FieldType.Select);
  readonly required = input<boolean>(false);
  readonly hint = input<string | null>(null);

  computedErrorMessage = computed(() => {
    const control = this.formControl();
    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
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
