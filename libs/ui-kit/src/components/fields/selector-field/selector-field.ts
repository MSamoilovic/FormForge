import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FieldOption, FieldType } from '@form-forge/models';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';
import { BaseFieldComponent } from '../../../base';

@Component({
  selector: 'app-selector-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './selector-field.html',
  styleUrl: './selector-field.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorField),
      multi: true,
    },
  ],
})
export class SelectorField extends BaseFieldComponent<string> {
  protected override readonly defaultFieldType = FieldType.Select;

  // SelectorField-specific inputs
  readonly options = input<FieldOption[]>([]);

  computedErrorMessage = computed(() => {
    const control = this.formControl();
    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    return 'Value is not valid.';
  });
}
