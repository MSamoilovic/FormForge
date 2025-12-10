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
  selector: 'app-multiselect-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './multiselect-field.html',
  styleUrl: './multiselect-field.scss',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectField),
      multi: true,
    },
  ],
})
export class MultiSelectField implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly options = input<FieldOption[]>([]);
  readonly formControl = input<FormControl | undefined>(undefined);
  readonly placeholder = input<string>('');
  readonly fieldType = input<FieldType>(FieldType.MultiSelect);
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

  onSelectionChange(event: Event): void {
    // Mark as touched when user interacts with the field
    this.formControl()?.markAsTouched();
  }

  writeValue(value: any): void {
    const arrayValue = Array.isArray(value) ? value : (value ? [value] : []);
    this.formControl()?.setValue(arrayValue, { emitEvent: false });
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

