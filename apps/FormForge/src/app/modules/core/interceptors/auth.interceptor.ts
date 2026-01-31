import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/public/',
];

function isPublicEndpoint(url: string): boolean {
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  if (isPublicEndpoint(req.url)) {
    return next(req);
  }

  const token = authService.getAccessToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublicEndpoint(req.url)) {
        return handleUnauthorizedError(authService, req, next);
      }

      return throwError(() => error);
    })
  );
};

function handleUnauthorizedError(
  authService: AuthService,
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) {
  const refreshToken = authService.getRefreshToken();

  if (!refreshToken) {
    authService.logout();
    return throwError(() => new Error('Session expired. Please login again.'));
  }

  return authService.refreshToken().pipe(
    switchMap(() => {
      const newToken = authService.getAccessToken();
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${newToken}`,
        },
      });
      return next(authReq);
    }),
    catchError((refreshError) => {
      authService.logout();
      return throwError(() => refreshError);
    })
  );
}
