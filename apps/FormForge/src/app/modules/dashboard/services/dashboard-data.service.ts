import { inject, Injectable } from '@angular/core';
import { FormApiService } from '../../core/services/form-api';
import { AIApiService } from '../../core/services/ai-api.service';

@Injectable()
export class DashboardDataService {
  private formApiService = inject(FormApiService);
  private aiApiService = inject(AIApiService);

  getForms() {
    return this.formApiService.getForms();
  }

  deleteForm(id: string) {
    return this.formApiService.deleteForm(id);
  }

  generateFormFromText() {
    return this.aiApiService.generateFormFromText();
  }
}
