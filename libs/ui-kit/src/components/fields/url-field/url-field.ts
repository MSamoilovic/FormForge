import { ChangeDetectionStrategy, Component, computed, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FieldType } from '@form-forge/models';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';
import { BaseFieldComponent } from '../../../base';

@Component({
  selector: 'app-url-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './url-field.html',
  styleUrl: './url-field.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UrlField),
      multi: true,
    },
  ],
})
export class UrlField extends BaseFieldComponent<string> {
  protected override readonly defaultFieldType = FieldType.Url;

  computedErrorMessage = computed(() => {
    const control = this.formControl();
    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }
    if (control.errors['pattern']) {
      return 'Please enter a valid URL.';
    }

    return 'Entered value is not a valid URL.';
  });

  onBlur(): void {
    const control = this.formControl();
    if (!control) return;

    let value = control.value?.trim();
    if (!value) return;

    if (!value.match(/^https?:\/\//i) && !value.startsWith('//')) {
      value = 'https://' + value;
      control.setValue(value);
    }
  }
}

