import { inject, Injectable } from '@angular/core';
import { FormApiService } from '../../core/services/form-api';
import { SubmissionApiService } from '../../core/services/submission-api.service';
import { SubmissionPayload } from '../../core/models/SubmissionPayload';

@Injectable()
export class FormRendererDataService {
  private formApiService = inject(FormApiService);
  private submissionsApiService = inject(SubmissionApiService);

  getFormById(id: string) {
    return this.formApiService.getById(id);
  }

  createSubmission(formId: number, payload: SubmissionPayload) {
    return this.submissionsApiService.create(formId, payload);
  }
}
