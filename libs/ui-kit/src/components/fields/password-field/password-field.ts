import { ChangeDetectionStrategy, Component, computed, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FieldType } from '@form-forge/models';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';
import { BaseFieldComponent } from '../../../base';

export type PasswordStrength = 'weak' | 'medium' | 'strong' | null;

@Component({
  selector: 'app-password-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './password-field.html',
  styleUrl: './password-field.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordField),
      multi: true,
    },
  ],
})
export class PasswordField extends BaseFieldComponent<string> {
  protected override readonly defaultFieldType = FieldType.Password;

  showPassword = signal(false);

  computedErrorMessage = computed(() => {
    const control = this.formControl();
    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'Password is required.';
    }
    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Password must be at least ${minLength} characters.`;
    }
    if (control.errors['pattern']) {
      return 'Password does not meet requirements.';
    }

    return 'Invalid password.';
  });

  passwordStrength = computed<PasswordStrength>(() => {
    const control = this.formControl();
    const value = control?.value;

    if (!value || value.length === 0) {
      return null;
    }

    let score = 0;

    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^a-zA-Z0-9]/.test(value)) score++;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  });

  strengthLabel = computed(() => {
    const strength = this.passwordStrength();
    if (!strength) return '';
    return strength.charAt(0).toUpperCase() + strength.slice(1);
  });

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }
}

