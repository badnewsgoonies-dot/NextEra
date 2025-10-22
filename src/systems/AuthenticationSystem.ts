/*
 * AuthenticationSystem: User authentication and session management
 * 
 * Features:
 * - User registration with email/username/password
 * - Login with username/password
 * - Session management with tokens
 * - Password hashing (simple for demo - use bcrypt in production)
 * - localStorage persistence
 * - Session expiration (30 days)
 */

import type { ILogger } from './Logger.js';
import type {
  User,
  UserCredentials,
  RegisterData,
  AuthSession,
  AuthState,
  StoredUser,
  StoredSession,
} from '../types/auth.js';
import { ok, err, type Result } from '../utils/Result.js';

const STORAGE_KEYS = {
  USERS: 'nextera_users',
  SESSIONS: 'nextera_sessions',
  CURRENT_SESSION: 'nextera_current_session',
} as const;

const SESSION_DURATION_DAYS = 30;

export class AuthenticationSystem {
  constructor(private readonly logger: ILogger) {}

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<Result<User, string>> {
    try {
      // Validate input
      if (!data.username || data.username.length < 3) {
        return err('Username must be at least 3 characters long');
      }
      if (!data.email || !this.isValidEmail(data.email)) {
        return err('Invalid email address');
      }
      if (!data.password || data.password.length < 6) {
        return err('Password must be at least 6 characters long');
      }

      // Check if username or email already exists
      const users = this.getAllUsers();
      if (users.some(u => u.username.toLowerCase() === data.username.toLowerCase())) {
        return err('Username already taken');
      }
      if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        return err('Email already registered');
      }

      // Create new user
      const now = new Date().toISOString();
      const user: StoredUser = {
        id: this.generateId(),
        username: data.username,
        email: data.email,
        passwordHash: this.hashPassword(data.password),
        createdAt: now,
        lastLogin: now,
        displayName: data.displayName,
      };

      // Save user
      users.push(user);
      this.saveUsers(users);

      this.logger.info('auth:register', { username: user.username, email: user.email });

      return ok(this.toPublicUser(user));
    } catch (e) {
      const error = e as Error;
      this.logger.error('auth:register_failed', { error: error.message });
      return err(`Registration failed: ${error.message}`);
    }
  }

  /**
   * Login with credentials
   */
  async login(credentials: UserCredentials): Promise<Result<AuthSession, string>> {
    try {
      if (!credentials.username || !credentials.password) {
        return err('Username and password are required');
      }

      // Find user
      const users = this.getAllUsers();
      const user = users.find(
        u => u.username.toLowerCase() === credentials.username.toLowerCase()
      );

      if (!user) {
        return err('Invalid username or password');
      }

      // Verify password
      if (!this.verifyPassword(credentials.password, user.passwordHash)) {
        return err('Invalid username or password');
      }

      // Update last login
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        this.saveUsers(users);
      }

      // Create session
      const session = this.createSession(user);
      this.saveSession(session);

      this.logger.info('auth:login', { username: user.username });

      return ok({
        user: this.toPublicUser(user),
        token: session.token,
        expiresAt: session.expiresAt,
      });
    } catch (e) {
      const error = e as Error;
      this.logger.error('auth:login_failed', { error: error.message });
      return err(`Login failed: ${error.message}`);
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<Result<void, string>> {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
      this.logger.info('auth:logout');
      return ok(undefined);
    } catch (e) {
      const error = e as Error;
      this.logger.error('auth:logout_failed', { error: error.message });
      return err(`Logout failed: ${error.message}`);
    }
  }

  /**
   * Get current authenticated session
   */
  getCurrentSession(): AuthSession | null {
    try {
      const sessionData = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      if (!sessionData) {
        return null;
      }

      const session: StoredSession = JSON.parse(sessionData);

      // Check expiration
      if (new Date(session.expiresAt) < new Date()) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
        return null;
      }

      // Get user
      const users = this.getAllUsers();
      const user = users.find(u => u.id === session.userId);
      if (!user) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
        return null;
      }

      return {
        user: this.toPublicUser(user),
        token: session.token,
        expiresAt: session.expiresAt,
      };
    } catch (e) {
      this.logger.error('auth:get_session_failed', { error: (e as Error).message });
      return null;
    }
  }

  /**
   * Get current auth state
   */
  getAuthState(): AuthState {
    const session = this.getCurrentSession();
    return {
      isAuthenticated: session !== null,
      user: session?.user ?? null,
      session,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: { displayName?: string; avatarUrl?: string }
  ): Promise<Result<User, string>> {
    try {
      const users = this.getAllUsers();
      const user = users.find(u => u.id === userId);

      if (!user) {
        return err('User not found');
      }

      const updatedUser = {
        ...user,
        ...(updates.displayName !== undefined && { displayName: updates.displayName }),
        ...(updates.avatarUrl !== undefined && { avatarUrl: updates.avatarUrl }),
      };

      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        this.saveUsers(users);
      }
      this.logger.info('auth:profile_updated', { userId });

      return ok(this.toPublicUser(user));
    } catch (e) {
      const error = e as Error;
      this.logger.error('auth:update_profile_failed', { error: error.message });
      return err(`Profile update failed: ${error.message}`);
    }
  }

  // ============================================
  // Private helper methods
  // ============================================

  private getAllUsers(): StoredUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: StoredUser[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  private createSession(user: StoredUser): StoredSession {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

    return {
      userId: user.id,
      token: this.generateToken(),
      expiresAt: expiresAt.toISOString(),
    };
  }

  private saveSession(session: StoredSession): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
  }

  private toPublicUser(user: StoredUser): User {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    };
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  private hashPassword(password: string): string {
    // Simple hash for demo - use bcrypt/scrypt in production!
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `hash_${Math.abs(hash).toString(36)}_${password.length}`;
  }

  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
