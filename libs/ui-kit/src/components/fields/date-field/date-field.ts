import { ChangeDetectionStrategy, Component, computed, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FieldType } from '@form-forge/models';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';
import { BaseFieldComponent } from '../../../base';

@Component({
  selector: 'app-date-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './date-field.html',
  styleUrl: './date-field.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateField),
      multi: true,
    },
  ],
})
export class DateField extends BaseFieldComponent<string> {
  protected override readonly defaultFieldType = FieldType.Date;

  computedErrorMessage = computed(() => {
    const control = this.formControl();
    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }
    if (control.errors['matDatepickerParse']) {
      return 'Please enter a valid date.';
    }

    return 'Entered value is not valid.';
  });
}
