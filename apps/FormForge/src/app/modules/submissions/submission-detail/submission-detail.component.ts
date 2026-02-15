import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SubmissionsDataService } from '../services/submissions-data.service';
import { SubmissionResponse } from '../../core/models/SubmissionResponse';
import { ThemeService } from '../../core/services/theme.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideLoader2,
  lucideCalendar,
  lucideHash,
} from '@ng-icons/lucide';
import { CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent } from '../../../shared/ui/card';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { cn } from '../../../shared/utils/cn';

@Component({
  selector: 'app-submission-detail',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    ButtonComponent,
    DatePipe,
    JsonPipe,
  ],
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucideLoader2,
      lucideCalendar,
      lucideHash,
    }),
  ],
  templateUrl: './submission-detail.component.html',
  styleUrl: './submission-detail.component.scss',
})
export class SubmissionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private submissionDataService = inject(SubmissionsDataService);
  private themeService = inject(ThemeService);
  private errorHandler = inject(ErrorHandlerService);

  protected cn = cn;

  submission = signal<SubmissionResponse | null>(null);
  isLoading = signal<boolean>(true);
  formId: number | null = null;
  submissionId: number | null = null;

  public isDarkMode = computed(
    () => this.themeService.currentTheme() === 'dark'
  );

  submissionData = computed(() => {
    const sub = this.submission();
    if (!sub) return [];
    
    return Object.entries(sub.data).map(([key, value]) => ({
      key,
      value,
    }));
  });

  ngOnInit() {
    const formIdParam = this.route.snapshot.paramMap.get('formId');
    const submissionIdParam = this.route.snapshot.paramMap.get('submissionId');
    
    if (formIdParam && submissionIdParam) {
      this.formId = +formIdParam;
      this.submissionId = +submissionIdParam;
      this.loadSubmission();
    } else {
      this.errorHandler.showError('Form ID or Submission ID is missing', 'SubmissionDetail.init');
      this.isLoading.set(false);
    }
  }

  private loadSubmission() {
    if (!this.formId) return;

    this.isLoading.set(true);
    this.submissionDataService.getAllSubmissions(this.formId).subscribe({
      next: (data) => {
        const submission = data.find((s) => s.id === this.submissionId);
        if (submission) {
          this.submission.set(submission);
        } else {
          this.errorHandler.showError('Submission not found', 'SubmissionDetail.load');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorHandler.handle(error, 'SubmissionDetail.load');
      },
    });
  }

  goBack() {
    if (this.formId) {
      this.router.navigate(['/submissions', this.formId]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}

