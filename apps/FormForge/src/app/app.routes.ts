import { Route } from '@angular/router';
import { authGuard, authCanMatch } from './modules/core/guards/auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'builder',
    loadChildren: () =>
      import('./modules/form-builder/form-builder.routes').then(
        (m) => m.FORM_BUILDER_ROUTES
      ),
    canMatch: [authCanMatch],
  },
  {
    path: 'renderer',
    loadChildren: () =>
      import('./modules/form-renderer/form-renderer.routes').then(
        (m) => m.FORM_RENDERER_ROUTES
      ),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./modules/dashboard/dashboard.routes').then(
        (m) => m.DASHBOARD_ROUTES
      ),
    canMatch: [authCanMatch],
  },
  {
    path: 'submissions',
    loadChildren: () =>
      import('./modules/submissions/submissions.routes').then(
        (m) => m.SUBMISSIONS_ROUTES
      ),
    canMatch: [authCanMatch],
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
  {
    path: 'register',
    redirectTo: '/auth/register',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
