import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FormSchemaPayload } from '../../core/models/FormSchemaPayload';
import { FormSchemaResponse } from '../../core/models/FormSchemaResponse';
import { FormApiService } from '../../core/services/form-api';

@Injectable({
  providedIn: 'root',
})
export class FormBuilderDataService {
  private api = inject(FormApiService);

  getForms(): Observable<FormSchemaResponse[]> {
    return this.api.getForms();
  }

  getById(id: string): Observable<FormSchemaResponse> {
    return this.api.getById(id);
  }

  createForm(data: FormSchemaPayload): Observable<FormSchemaResponse> {
    return this.api.createForm(data);
  }

  updateForm(
    id: number,
    data: FormSchemaPayload
  ): Observable<FormSchemaResponse> {
    return this.api.updateForm(id, data);
  }

  deleteForm(id: string): Observable<void> {
    return this.api.deleteForm(id);
  }
}
