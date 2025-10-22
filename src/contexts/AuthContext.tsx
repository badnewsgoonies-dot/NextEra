/*
 * AuthContext: Global authentication state management
 * 
 * Provides authentication state and methods to all components
 * via React Context API
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthenticationSystem } from '../systems/AuthenticationSystem.js';
import { ConsoleLogger } from '../systems/Logger.js';
import type { AuthState } from '../types/auth.js';

interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
    displayName?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { displayName?: string; avatarUrl?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [authSystem] = useState(() => new AuthenticationSystem(new ConsoleLogger('info')));
  const [authState, setAuthState] = useState<AuthState>(() => authSystem.getAuthState());

  // Check for existing session on mount
  useEffect(() => {
    const session = authSystem.getCurrentSession();
    if (session) {
      setAuthState({
        isAuthenticated: true,
        user: session.user,
        session,
      });
    }
  }, [authSystem]);

  const login = async (username: string, password: string): Promise<void> => {
    const result = await authSystem.login({ username, password });
    if (!result.ok) {
      throw new Error(result.error);
    }

    setAuthState({
      isAuthenticated: true,
      user: result.value.user,
      session: result.value,
    });
  };

  const register = async (
    email: string,
    username: string,
    password: string,
    displayName?: string
  ): Promise<void> => {
    const result = await authSystem.register({
      email,
      username,
      password,
      displayName,
    });

    if (!result.ok) {
      throw new Error(result.error);
    }

    // Auto-login after registration
    await login(username, password);
  };

  const logout = async (): Promise<void> => {
    const result = await authSystem.logout();
    if (!result.ok) {
      throw new Error(result.error);
    }

    setAuthState({
      isAuthenticated: false,
      user: null,
      session: null,
    });
  };

  const updateProfile = async (updates: {
    displayName?: string;
    avatarUrl?: string;
  }): Promise<void> => {
    if (!authState.user) {
      throw new Error('Not authenticated');
    }

    const result = await authSystem.updateProfile(authState.user.id, updates);
    if (!result.ok) {
      throw new Error(result.error);
    }

    // Update local state
    setAuthState(prev => ({
      ...prev,
      user: result.value,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
