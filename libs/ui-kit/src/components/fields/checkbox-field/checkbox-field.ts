import { CommonModule } from '@angular/common';
import { Component, computed, forwardRef, input } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-checkbox-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
  formControl = input.required<FormControl>();
  required = input<boolean | undefined>(undefined);
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

  writeValue(value: boolean | null): void {
    this.formControl().setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: boolean | null) => void): void {
    this.formControl().valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.formControl().statusChanges.subscribe(() => fn());
  }

  setDisabledState?(isDisabled: boolean): void {
    return isDisabled
      ? this.formControl().disable()
      : this.formControl().enable();
  }
}
