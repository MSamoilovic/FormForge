export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  FORM_CREATOR = 'form_creator',
  VIEWER = 'viewer',
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  organization_id?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  username?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export type ApiKeyScope = 'read' | 'write';

export interface CreateApiKeyRequest {
  name: string;
  scopes: ApiKeyScope[];
  expires_in_days?: number;
}

export interface ApiKey {
  id: number;
  key?: string;
  name: string;
  scopes: ApiKeyScope[];
  expires_at?: string;
  created_at: string;
  last_used_at?: string;
  is_active: boolean;
}
