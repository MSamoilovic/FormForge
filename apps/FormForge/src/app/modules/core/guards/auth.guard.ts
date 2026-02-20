import { inject } from '@angular/core';
import { Router, CanActivateFn, CanMatchFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.models';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasValidToken()) {
    return true;
  }

  const returnUrl = state.url;
  router.navigate(['/login'], {
    queryParams: { returnUrl },
  });

  return false;
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasValidToken()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.hasValidToken()) {
      router.navigate(['/login']);
      return false;
    }

    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
}

export const adminGuard: CanActivateFn = roleGuard([
  UserRole.SUPER_ADMIN,
  UserRole.ORG_ADMIN,
]);

export const formCreatorGuard: CanActivateFn = roleGuard([
  UserRole.SUPER_ADMIN,
  UserRole.ORG_ADMIN,
  UserRole.FORM_CREATOR,
]);

export const authCanMatch: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasValidToken()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
