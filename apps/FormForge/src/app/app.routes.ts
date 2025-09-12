import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'builder',
    loadChildren: () =>
      import('./modules/form-builder/form-builder.routes').then(
        (m) => m.FORM_BUILDER_ROUTES
      ),
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
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
