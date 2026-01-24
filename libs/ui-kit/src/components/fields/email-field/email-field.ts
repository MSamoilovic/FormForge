import { ChangeDetectionStrategy, Component, computed, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FieldType } from '@form-forge/models';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';
import { BaseFieldComponent } from '../../../base';

@Component({
  selector: 'app-email-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './email-field.html',
  styleUrl: './email-field.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmailField),
      multi: true,
    },
  ],
})
export class EmailField extends BaseFieldComponent<string> {
  protected override readonly defaultFieldType = FieldType.Email;

  computedErrorMessage = computed(() => {
    const control = this.formControl();
    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'This fields is required.';
    }
    if (control.errors['email']) {
      return 'Email address is not valid.';
    }
    if (control.errors['pattern']) {
      return 'Pattern is not matching.';
    }

    return 'Entered value is not valid.';
  });
}
