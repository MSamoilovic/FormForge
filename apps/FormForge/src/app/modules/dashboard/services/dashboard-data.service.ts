import { inject, Injectable } from '@angular/core';
import { FormApiService } from '../../core/services/form-api';

@Injectable()
export class DashboardDataService {
  private formApiService = inject(FormApiService);

  getForms() {
    return this.formApiService.getForms();
  }

  deleteForm(id: string) {
    return this.formApiService.deleteForm(id);
  }
}
