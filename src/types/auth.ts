/*
 * Authentication Types
 * 
 * Type definitions for user authentication and session management
 */

export interface User {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly createdAt: string;
  readonly lastLogin: string;
  readonly displayName?: string;
  readonly avatarUrl?: string;
}

export interface UserCredentials {
  readonly username: string;
  readonly password: string;
}

export interface RegisterData extends UserCredentials {
  readonly email: string;
  readonly displayName?: string;
}

export interface AuthSession {
  readonly user: User;
  readonly token: string;
  readonly expiresAt: string;
}

export interface AuthState {
  readonly isAuthenticated: boolean;
  readonly user: User | null;
  readonly session: AuthSession | null;
}

// Internal storage types
export interface StoredUser {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly createdAt: string;
  readonly lastLogin: string;
  readonly displayName?: string;
  readonly avatarUrl?: string;
}

export interface StoredSession {
  readonly userId: string;
  readonly token: string;
  readonly expiresAt: string;
}
