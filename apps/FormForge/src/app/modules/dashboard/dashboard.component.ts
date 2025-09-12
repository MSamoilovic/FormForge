import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatIconModule,
    MatListModule,
    MatCardModule,
    DatePipe,
    MatButtonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private router = inject(Router);

  forms = signal<any[]>([
    {
      id: '1',
      name: 'Contact Form',
      createdAt: new Date(),
      submissionCount: 15,
    },
    {
      id: '2',
      name: 'Event Registration',
      createdAt: new Date(),
      submissionCount: 88,
    },
    {
      id: '3',
      name: 'User Feedback',
      createdAt: new Date(),
      submissionCount: 42,
    },
  ]);

  createNewForm(): void {
    this.router.navigate(['/builder']);
  }

  editForm(id: string): void {
    this.router.navigate(['/builder', id]);
  }
}
