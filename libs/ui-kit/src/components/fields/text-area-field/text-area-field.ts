import { ChangeDetectionStrategy, Component, computed, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FieldType } from '@form-forge/models';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';
import { BaseFieldComponent } from '../../../base';

@Component({
  selector: 'app-text-area-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './text-area-field.html',
  styleUrl: './text-area-field.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextAreaField),
      multi: true,
    },
  ],
})
export class TextAreaField extends BaseFieldComponent<string> {
  protected override readonly defaultFieldType = FieldType.TextArea;

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

    return 'Entered value is not valid.';
  });
}
