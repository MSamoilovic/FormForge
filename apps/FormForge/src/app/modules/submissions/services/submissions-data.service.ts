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
}
