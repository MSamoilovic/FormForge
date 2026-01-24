import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FieldType } from '@form-forge/models';
import { FieldError } from '../../field-error/field-error';
import { FieldHint } from '../../field-hint/field-hint';
import { BaseFieldComponent } from '../../../base';

@Component({
  selector: 'app-checkbox-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FieldError, FieldHint],
  templateUrl: './checkbox-field.html',
  styleUrls: ['./checkbox-field.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxField),
      multi: true,
    },
  ],
})
export class CheckboxField extends BaseFieldComponent<boolean> {
  protected override readonly defaultFieldType = FieldType.Checkbox;

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

  // Checkbox-specific computed signals for template
  shouldShowError = computed(() => {
    const control = this.formControl();
    const errorMsg = this.computedErrorMessage();
    return (
      errorMsg !== null && control !== undefined && (control.touched || control.dirty) && control.invalid
    );
  });

  shouldShowHint = computed(() => {
    return (
      !this.shouldShowError() && this.hint() !== null && this.hint() !== ''
    );
  });
}
