import { Route } from '@angular/router';
import { SubmissionsComponent } from './submissions.component';
import { SubmissionDetailComponent } from './submission-detail/submission-detail.component';

export const SUBMISSIONS_ROUTES: Route[] = [
  { path: ':formId', component: SubmissionsComponent },
  { path: ':formId/:submissionId', component: SubmissionDetailComponent },
];
