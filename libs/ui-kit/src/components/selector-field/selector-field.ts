import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { FieldType } from '../../../../models/src';

@Component({
  selector: 'app-selector-field',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './selector-field.html',
  styleUrl: './selector-field.scss',
  standalone: true,
})
export class SelectorField implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly options = input<string[]>([]);
  readonly formControl = input<FormControl | undefined>(undefined);
  readonly placeholder = input<string>('');
  readonly fieldType = input<FieldType>(FieldType.Select);

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
