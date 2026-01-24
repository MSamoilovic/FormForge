import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormSchema } from '@form-forge/models';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { DashboardDataService } from './services/dashboard-data.service';
import { MatTooltip } from '@angular/material/tooltip';
import { NotificationService } from '../core/services/notification.service';
import { ErrorHandlerService } from '../core/services/error-handler.service';
import { GenerateFormDialogComponent } from './components/generate-form/generate-form-dialog.component';
import { AIApiService } from '../core/services/ai-api.service';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinner,
    RouterLink,
    MatTooltip,
    MatDialogModule,
  ],
  providers: [DashboardDataService, NotificationService, AIApiService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(DashboardDataService);
  private notificationService = inject(NotificationService);
  private errorHandler = inject(ErrorHandlerService);
  private themeService = inject(ThemeService);

  dialog = inject(MatDialog);

  forms = signal<FormSchema[]>([]);
  isLoading = signal<boolean>(true);

  public isDarkMode = computed(
    () => this.themeService.currentTheme() === 'dark'
  );

  ngOnInit() {
    this.loadForms();
  }

  loadForms(): void {
    this.isLoading.set(true);
    this.apiService.getForms().subscribe({
      next: (data) => {
        this.forms.set(data as FormSchema[]);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorHandler.handle(err, 'Dashboard.loadForms');
      },
    });
  }

  createNewForm(): void {
    this.router.navigate(['/builder']);
  }

  editForm(id: string): void {
    this.router.navigate(['/builder', id]);
  }

  deleteForm(id: string, name: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        message: `Are you sure you want to delete the form "${name}"? This action cannot be undone.`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.apiService.deleteForm(id).subscribe({
          next: () => {
            this.forms.update((currentForms) =>
              currentForms.filter((f) => f.id !== id)
            );

            this.notificationService.showSuccess(
              `Form "${name}" was successfully deleted.`
            );
          },
          error: (err) => {
            this.errorHandler.handle(err, 'Dashboard.deleteForm');
          },
        });
      }
    });
  }

  generateFormFromText(): void {
    const dialogRef = this.dialog.open(GenerateFormDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result) {
        this.router.navigate(['/builder'], {
          state: { generatedSchema: result },
        });
      }
    });
  }
}
