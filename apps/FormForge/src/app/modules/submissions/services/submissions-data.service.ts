import { inject, Injectable } from '@angular/core';
import { SubmissionApiService } from '../../core/services/submission-api.service';

@Injectable({
  providedIn: 'root',
})
export class SubmissionsDataService {
  private submissionsApiService = inject(SubmissionApiService);

  getAllSubmissions(formId: number) {
    return this.submissionsApiService.getAll(formId);
  }

  exportSubmissions(formId: number, filters: any) {
    this.submissionsApiService.exportToCSV(formId, filters).subscribe({
      next: (data) => {
        const url = window.URL.createObjectURL(data);

        const a = document.createElement('a');
        a.href = url;
        a.download = `form_${formId}_submissions_${new Date().getTime()}.csv`;

        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Export failed:', err);
      },
    });
  }
}
