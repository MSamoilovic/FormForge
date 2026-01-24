import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FieldType } from '@form-forge/models';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';
import { BaseFieldComponent } from '../../../base';

@Component({
  selector: 'app-number-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './number-field.html',
  styleUrl: './number-field.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberField),
      multi: true,
    },
  ],
})
export class NumberField extends BaseFieldComponent<number> {
  protected override readonly defaultFieldType = FieldType.Number;

  // NumberField-specific inputs
  readonly min = input<number | undefined>(undefined);
  readonly max = input<number | undefined>(undefined);
  readonly step = input<number | undefined>(undefined);

  computedErrorMessage = computed(() => {
    const control = this.formControl();
    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }
    if (control.errors['min']) {
      const min = control.errors['min'].min;
      return `Value must be at least ${min}.`;
    }
    if (control.errors['max']) {
      const max = control.errors['max'].max;
      return `Value can't be larger than ${max}.`;
    }

    return 'Entered value is not valid.';
  });
}
