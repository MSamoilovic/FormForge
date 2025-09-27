import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { SubmissionPayload } from '../models/SubmissionPayload';
import { SubmissionResponse } from '../models/SubmissionResponse';

@Injectable({
  providedIn: 'root',
})
export class SubmissionApiService {
  private api = inject(ApiService);

  private getEndpoint(formId: number): string {
    return `forms/${formId}/submissions`;
  }

  create(
    formId: number,
    data: SubmissionPayload
  ): Observable<SubmissionResponse> {
    return this.api.post<SubmissionResponse>(this.getEndpoint(formId), data);
  }

  getAll(formId: number): Observable<SubmissionResponse[]> {
    return this.api.get<SubmissionResponse[]>(this.getEndpoint(formId));
  }
}
