import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormSchemaResponse } from '../models/FormSchemaResponse';
import { FormSchemaPayload } from '../models/FormSchemaPayload';
import { FieldType } from '@form-forge/models';

const FIELD_TYPE_NORMALIZE: Record<string, FieldType> = {
  textarea: FieldType.TextArea,
  multiselect: FieldType.MultiSelect,
  toggleswitch: FieldType.ToggleSwitch,
  fileupload: FieldType.FileUpload,
  richtext: FieldType.RichText,
  colorpicker: FieldType.ColorPicker,
  likertscale: FieldType.LikertScale,
};

function normalizeFieldType(raw: string): FieldType {
  const normalized = FIELD_TYPE_NORMALIZE[raw.toLowerCase().replace(/_/g, '')];
  return normalized ?? (raw as FieldType);
}

function normalizeSchema(schema: FormSchemaResponse): FormSchemaResponse {
  return {
    ...schema,
    fields: schema.fields.map((f) => ({
      ...f,
      type: normalizeFieldType(f.type as string),
    })),
  };
}

@Injectable({
  providedIn: 'root',
})
export class FormApiService {
  private api = inject(ApiService);

  private readonly endpoint = 'forms';

  getForms(): Observable<FormSchemaResponse[]> {
    return this.api.get<FormSchemaResponse[]>(this.endpoint);
  }

  getById(id: string): Observable<FormSchemaResponse> {
    return this.api
      .get<FormSchemaResponse>(`${this.endpoint}/${id}`)
      .pipe(map(normalizeSchema));
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
