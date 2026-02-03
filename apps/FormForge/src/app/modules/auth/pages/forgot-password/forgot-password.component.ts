import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideMail,
  lucideSend,
  lucideArrowLeft,
  lucideLoader2,
  lucideMailCheck,
} from '@ng-icons/lucide';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { cn } from '../../../../shared/utils/cn';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIconComponent, AuthLayoutComponent],
  viewProviders: [
    provideIcons({
      lucideMail,
      lucideSend,
      lucideArrowLeft,
      lucideLoader2,
      lucideMailCheck,
    }),
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);

  protected cn = cn;

  isLoading = signal(false);
  isSubmitted = signal(false);
  submittedEmail = signal('');

  forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const { email } = this.forgotForm.getRawValue();

    // Simulate API call - in real app this would call authService.forgotPassword(email)
    setTimeout(() => {
      this.isLoading.set(false);
      this.submittedEmail.set(email);
      this.isSubmitted.set(true);
    }, 1500);
  }

  getErrorMessage(): string {
    const control = this.forgotForm.get('email');
    if (!control?.errors) return '';

    if (control.errors['required']) {
      return 'Email is required';
    }
    if (control.errors['email']) {
      return 'Please enter a valid email';
    }
    return '';
  }

  resetForm(): void {
    this.isSubmitted.set(false);
    this.submittedEmail.set('');
    this.forgotForm.reset();
  }
}
