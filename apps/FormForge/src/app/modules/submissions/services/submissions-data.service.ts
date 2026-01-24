import { inject, Injectable } from '@angular/core';
import { SubmissionApiService } from '../../core/services/submission-api.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { NotificationService } from '../../core/services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class SubmissionsDataService {
  private submissionsApiService = inject(SubmissionApiService);
  private errorHandler = inject(ErrorHandlerService);
  private notificationService = inject(NotificationService);

  getAllSubmissions(formId: number) {
    return this.submissionsApiService.getAll(formId);
  }

  exportSubmissions(formId: number, filters: Record<string, unknown>) {
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

        this.notificationService.showSuccess('Export completed successfully.');
      },
      error: (err) => {
        this.errorHandler.handle(err, 'Submissions.export');
      },
    });
  }
}
