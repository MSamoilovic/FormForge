import { Route } from '@angular/router';
import { SubmissionsComponent } from './submissions.component';

export const SUBMISSIONS_ROUTES: Route[] = [
  { path: ':formId', component: SubmissionsComponent },
];
