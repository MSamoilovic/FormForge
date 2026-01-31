import { inject, Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import {
  User,
  UserRole,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  TokenResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  CreateApiKeyRequest,
  ApiKey,
} from '../models/auth.models';

const ACCESS_TOKEN_KEY = 'ff_access_token';
const REFRESH_TOKEN_KEY = 'ff_refresh_token';
const USER_KEY = 'ff_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private readonly endpoint = 'auth';

  private currentUserSignal = signal<User | null>(this.loadUserFromStorage());
  private isLoadingSignal = signal<boolean>(false);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly userRole = computed(() => this.currentUserSignal()?.role ?? null);

  private authState$ = new BehaviorSubject<boolean>(this.hasValidToken());

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = this.getAccessToken();
    if (token) {
      this.authState$.next(true);
    }
  }

  private loadUserFromStorage(): User | null {
    try {
      const userJson = localStorage.getItem(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  private saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  private saveUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private clearAuthData(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
    this.authState$.next(false);
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.saveTokens(response.access_token, response.refresh_token);
    this.saveUser(response.user);
    this.authState$.next(true);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  hasValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000;
      return Date.now() < expiration;
    } catch {
      return false;
    }
  }

  getAuthState(): Observable<boolean> {
    return this.authState$.asObservable();
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return this.api.post<AuthResponse>(`${this.endpoint}/register`, data).pipe(
      tap((response) => {
        this.handleAuthResponse(response);
        this.isLoadingSignal.set(false);
      }),
      catchError((error) => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return this.api.post<AuthResponse>(`${this.endpoint}/login`, data).pipe(
      tap((response) => {
        this.handleAuthResponse(response);
        this.isLoadingSignal.set(false);
      }),
      catchError((error) => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = { refresh_token: refreshToken };

    return this.api.post<TokenResponse>(`${this.endpoint}/refresh`, request).pipe(
      tap((response) => {
        this.saveTokens(response.access_token, response.refresh_token);
        this.authState$.next(true);
      }),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(redirectTo: string = '/login'): void {
    this.clearAuthData();
    this.router.navigate([redirectTo]);
  }

  getCurrentUser(): Observable<User> {
    return this.api.get<User>(`${this.endpoint}/me`).pipe(
      tap((user) => this.saveUser(user))
    );
  }

  updateProfile(data: UpdateProfileRequest): Observable<User> {
    return this.api.put<User>(`${this.endpoint}/me`, data).pipe(
      tap((user) => this.saveUser(user))
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/change-password`, data);
  }

  createApiKey(data: CreateApiKeyRequest): Observable<ApiKey> {
    return this.api.post<ApiKey>(`${this.endpoint}/api-keys`, data);
  }

  getApiKeys(): Observable<ApiKey[]> {
    return this.api.get<ApiKey[]>(`${this.endpoint}/api-keys`);
  }

  deleteApiKey(keyId: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/api-keys/${keyId}`);
  }

  hasRole(role: UserRole): boolean {
    return this.currentUserSignal()?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const currentRole = this.currentUserSignal()?.role;
    return currentRole ? roles.includes(currentRole) : false;
  }

  isAdmin(): boolean {
    return this.hasAnyRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]);
  }

  canManageForms(): boolean {
    return this.hasAnyRole([
      UserRole.SUPER_ADMIN,
      UserRole.ORG_ADMIN,
      UserRole.FORM_CREATOR,
    ]);
  }
}
