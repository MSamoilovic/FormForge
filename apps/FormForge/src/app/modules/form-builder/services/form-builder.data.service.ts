import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';
import { FormSchemaPayload } from '../../core/models/FormSchemaPayload';
import { FormSchemaResponse } from '../../core/models/FormSchemaResponse';

@Injectable({
  providedIn: 'root',
})
export class FormBuilderDataService {
  private api = inject(ApiService);
  private readonly endpoint = 'forms';

  getForms(): Observable<FormSchemaResponse[]> {
    return this.api.get<FormSchemaResponse[]>(this.endpoint);
  }

  getById(id: string): Observable<FormSchemaResponse> {
    return this.api.get<FormSchemaResponse>(`${this.endpoint}/${id}`);
  }

  createForm(data: FormSchemaPayload): Observable<FormSchemaResponse> {
    return this.api.post<FormSchemaResponse>(this.endpoint, data);
  }

  updateForm(
    id: number,
    data: FormSchemaPayload
  ): Observable<FormSchemaResponse> {
    return this.api.put<FormSchemaResponse>(`${this.endpoint}/${id}`, data);
  }

  deleteForm(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
