import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private defaultConfig: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'right',
    verticalPosition: 'bottom',
  };

  showSuccess(message: string): void {
    this.snackBar.open(message, 'OK', {
      ...this.defaultConfig,
      panelClass: ['success-snackbar'],
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Error', {
      ...this.defaultConfig,
      panelClass: ['error-snackbar'],
    });
  }

  showInfo(message: string): void {
    this.snackBar.open(message, 'Info', {
      ...this.defaultConfig,
      panelClass: ['info-snackbar'],
    });
  }
}
