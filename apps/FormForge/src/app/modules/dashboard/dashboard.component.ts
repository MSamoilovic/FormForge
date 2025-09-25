import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormSchema } from '@form-forge/models';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilderDataService } from '../form-builder/services/form-builder.data.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinner,
  ],
  providers: [FormBuilderDataService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(FormBuilderDataService);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);

  forms = signal<FormSchema[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadForms();
  }

  loadForms(): void {
    this.isLoading.set(true);
    this.apiService.getForms().subscribe({
      next: (data) => {
        this.forms.set(data as FormSchema[]);
        this.isLoading.set(false);
        console.log('Uspešno učitane forme:', data);
      },
      error: (err) => {
        console.error('Greška pri učitavanju formi:', err);
        this.isLoading.set(false);
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
              //TODO: Investigate and resolve
              currentForms.filter((f) => f.id !== id)
            );
            this.snackBar.open(
              `Form "${name}" was successfully deleted.`,
              'OK',
              { duration: 3000 }
            );
          },
          error: (err) => {
            console.error('Error deleting form:', err);
            this.snackBar.open(
              'Could not delete form. Please try again.',
              'Error',
              { duration: 5000 }
            );
          },
        });
      }
    });
  }
}
