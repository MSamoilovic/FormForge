import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FieldOption, FieldType, OptionValue } from '@form-forge/models';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';
import { BaseFieldComponent } from '../../../base';

@Component({
  selector: 'app-radio-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './radio-field.html',
  styleUrl: './radio-field.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioField),
      multi: true,
    },
  ],
})
export class RadioField extends BaseFieldComponent<OptionValue> {
  protected override readonly defaultFieldType = FieldType.Radio;

  // RadioField-specific inputs
  readonly options = input<FieldOption[]>([]);

  computedErrorMessage = computed(() => {
    const control = this.formControl();
    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    return 'Entered value is not valid.';
  });
}
