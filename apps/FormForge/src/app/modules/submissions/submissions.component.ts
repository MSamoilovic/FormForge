import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SubmissionsDataService } from './services/submissions-data.service';
import { SubmissionResponse } from '../core/models/SubmissionResponse';

@Component({
  selector: 'app-submissions',
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './submissions.component.html',
  styleUrl: './submissions.component.scss',
})
export class SubmissionsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private submissionDataService = inject(SubmissionsDataService);

  private formId: number | null = null;

  submissions = signal<SubmissionResponse[]>([]);
  isLoading = signal<boolean>(true);

  displayedColumns = computed(() => {
    const firstSubmission = this.submissions()[0];
    if (!firstSubmission) {
      return [];
    }

    return ['id', 'submitted_at', ...Object.keys(firstSubmission.data)];
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('formId');
    if (idParam) {
      this.formId = +idParam;
      this.loadSubmissions(this.formId);
    } else {
      console.error('Form ID is missing from URL');
      this.isLoading.set(false);
    }
  }

  private loadSubmissions(formId: number) {
    this.isLoading.set(true);
    this.submissionDataService.getAllSubmissions(formId).subscribe({
      next: (data) => {
        this.submissions.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading Submissions:', error);
        this.isLoading.set(false);
      },
    });
  }
}
