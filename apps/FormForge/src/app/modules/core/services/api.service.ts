import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormSchema } from '@form-forge/models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://127.0.0.1:8000';

  createForm(formSchema: FormSchema): Observable<FormSchema> {
    return this.http.post<FormSchema>(`${this.apiUrl}/api/forms`, formSchema);
  }

  getForms(): Observable<FormSchema[]> {
    return this.http.get<FormSchema[]>(`${this.apiUrl}/api/forms`);
  }

  getForm(id: number): Observable<FormSchema> {
    return this.http.get<FormSchema>(`${this.apiUrl}/api/forms/${id}`);
  }
}
