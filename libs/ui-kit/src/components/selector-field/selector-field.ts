import { Component, forwardRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-selector-field',
  imports: [CommonModule, ReactiveFormsModule],
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
  readonly options = input<string[]>([]);
  readonly formControl = input.required<FormControl>();

  writeValue(value: any): void {
    this.formControl()?.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.formControl().valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.formControl().statusChanges.subscribe(() => fn());
  }

  setDisabledState?(isDisabled: boolean): void {
    return isDisabled
      ? this.formControl().disable()
      : this.formControl().enable();
  }
}
