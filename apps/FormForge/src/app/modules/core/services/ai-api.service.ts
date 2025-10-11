import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { FormSchemaResponse } from '../models/FormSchemaResponse';

@Injectable()
export class AIApiService {
  private apiService = inject(ApiService);
  private url = 'ai';

  generateFormFromText(promptText?: string) {
    return this.apiService.post<FormSchemaResponse>(
      this.url + '/generate-form-from-text',
      { prompt: promptText }
    );
  }
}
