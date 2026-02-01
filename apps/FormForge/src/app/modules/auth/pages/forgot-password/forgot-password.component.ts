import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AuthLayoutComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);

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


