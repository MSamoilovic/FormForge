import { Routes } from '@angular/router';
import { FormRenderer } from './form-renderer';

export const FORM_RENDERER_ROUTES: Routes = [
  { path: '', component: FormRenderer },
  { path: ':id', component: FormRenderer },
];
