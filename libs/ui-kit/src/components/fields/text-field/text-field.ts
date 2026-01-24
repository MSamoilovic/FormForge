import { ChangeDetectionStrategy, Component, computed, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FieldType } from '@form-forge/models';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';
import { BaseFieldComponent } from '../../../base';

@Component({
  selector: 'app-text-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './text-field.html',
  styleUrl: './text-field.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextField),
      multi: true,
    },
  ],
})
export class TextField extends BaseFieldComponent<string> {
  protected override readonly defaultFieldType = FieldType.Text;

  computedErrorMessage = computed(() => {
    const control = this.formControl();
    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Field must have at least ${minLength} characters.`;
    }
    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return `Field must have at most ${maxLength} characters.`;
    }
    if (control.errors['pattern']) {
      return 'Value is not in the correct format.';
    }
    return 'Value is not valid.';
  });
}
