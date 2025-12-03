import { Component, forwardRef, input } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FieldOption, FieldType } from '../../../../../models/src';

@Component({
  selector: 'app-radio-field',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './radio-field.html',
  styleUrl: './radio-field.css',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioField),
      multi: true,
    },
  ],
})
export class RadioField implements ControlValueAccessor {
  label = input<string>('');
  formControl = input<FormControl | undefined>(undefined);
  options = input<FieldOption[]>([]);
  fieldType = input<FieldType>(FieldType.Radio);

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
