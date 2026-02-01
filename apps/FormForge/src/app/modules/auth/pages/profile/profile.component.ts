import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeService } from '../../../core/services/theme.service';
import { UserRole } from '../../../core/models/auth.models';

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private themeService = inject(ThemeService);

  user = this.authService.currentUser;
  isDarkMode = computed(() => this.themeService.currentTheme() === 'dark');

  isUpdatingProfile = signal(false);
  isChangingPassword = signal(false);
  hideCurrentPassword = signal(true);
  hideNewPassword = signal(true);
  hideConfirmPassword = signal(true);

  profileForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.maxLength(100)]],
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9_]+$/),
      ],
    ],
  });

  passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: [
      '',
      [Validators.required, Validators.minLength(8), this.passwordStrengthValidator],
    ],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const currentUser = this.user();
    if (currentUser) {
      this.profileForm.patchValue({
        fullName: currentUser.full_name || '',
        username: currentUser.username,
      });
    }
  }

  passwordStrengthValidator(control: { value: string }): { passwordStrength: boolean } | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    const valid = hasUpperCase && hasLowerCase && hasNumber;
    return valid ? null : { passwordStrength: true };
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isUpdatingProfile.set(true);

    const { fullName, username } = this.profileForm.getRawValue();

    this.authService
      .updateProfile({
        full_name: fullName,
        username,
      })
      .subscribe({
        next: () => {
          this.notification.showSuccess('Profile updated successfully');
          this.isUpdatingProfile.set(false);
        },
        error: (err) => {
          this.isUpdatingProfile.set(false);
          this.notification.showError(err.error?.detail || 'Failed to update profile');
        },
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.notification.showError('Passwords do not match');
      return;
    }

    this.isChangingPassword.set(true);

    const { currentPassword } = this.passwordForm.getRawValue();

    this.authService
      .changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      .subscribe({
        next: () => {
          this.notification.showSuccess('Password changed successfully');
          this.isChangingPassword.set(false);
          this.passwordForm.reset();
        },
        error: (err) => {
          this.isChangingPassword.set(false);
          this.notification.showError(err.error?.detail || 'Failed to change password');
        },
      });
  }

  getRoleBadgeColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: '#9c27b0',
      [UserRole.ORG_ADMIN]: '#2196f3',
      [UserRole.FORM_CREATOR]: '#4caf50',
      [UserRole.VIEWER]: '#607d8b',
    };
    return colors[role] || '#607d8b';
  }

  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: 'Super Admin',
      [UserRole.ORG_ADMIN]: 'Org Admin',
      [UserRole.FORM_CREATOR]: 'Form Creator',
      [UserRole.VIEWER]: 'Viewer',
    };
    return labels[role] || role;
  }

  getInitials(): string {
    const currentUser = this.user();
    if (!currentUser) return '?';

    if (currentUser.full_name) {
      return currentUser.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return currentUser.username.slice(0, 2).toUpperCase();
  }
}

