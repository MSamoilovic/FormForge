import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { SubmissionPayload } from '../models/SubmissionPayload';
import { SubmissionResponse } from '../models/SubmissionResponse';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SubmissionApiService {
  private api = inject(ApiService);

  private getEndpoint(formId: number): string {
    return `submissions/${formId}`;
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

  exportToCSV(formId: number, filters: { [key: string]: any }) {
    const endpoint = this.getEndpoint(formId) + '/export';

    let params = new HttpParams();
    for (const key in filters) {
      if (filters[key]) {
        params = params.append(key, filters[key]);
      }
    }

    return this.api.downloadFile(endpoint, params);
  }
}
