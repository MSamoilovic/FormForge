import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../core/services/api.service';
import { FormSchema } from '@form-forge/models';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinner,
  ],
  providers: [ApiService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);

  forms = signal<FormSchema[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadForms();
  }

  loadForms(): void {
    this.isLoading.set(true);
    this.apiService.getForms().subscribe({
      next: (data) => {
        this.forms.set(data);
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
}
