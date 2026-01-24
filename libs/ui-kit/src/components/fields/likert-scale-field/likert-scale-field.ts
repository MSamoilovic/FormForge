import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FieldOption, FieldType, OptionValue } from '@form-forge/models';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';
import { BaseFieldComponent } from '../../../base';

@Component({
  selector: 'app-likert-scale-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './likert-scale-field.html',
  styleUrl: './likert-scale-field.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LikertScaleField),
      multi: true,
    },
  ],
})
export class LikertScaleField extends BaseFieldComponent<OptionValue> {
  protected override readonly defaultFieldType = FieldType.LikertScale;

  // LikertScaleField-specific inputs
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
