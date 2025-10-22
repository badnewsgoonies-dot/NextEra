/*
 * LoginScreen: User login interface
 * 
 * Features:
 * - Username/password login form
 * - Input validation
 * - Error display
 * - Link to registration
 * - Beautiful Golden Sun-inspired UI
 */

import React, { useState } from 'react';

export interface LoginScreenProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
  error?: string;
}

export function LoginScreen({
  onLogin,
  onSwitchToRegister,
  error,
}: LoginScreenProps): React.ReactElement {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!username || !password) {
      setLocalError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(username, password);
    } catch (err) {
      setLocalError((err as Error).message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-yellow-800 to-amber-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Title Card */}
        <div className="bg-gradient-to-b from-yellow-100 to-amber-200 rounded-t-lg p-6 border-4 border-amber-900 shadow-2xl">
          <h1 className="text-5xl font-bold text-center text-amber-900 mb-2 tracking-wide">
            ⚔️ NextEra ⚔️
          </h1>
          <p className="text-center text-amber-800 text-sm">
            The Golden Sun Awaits
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gradient-to-b from-amber-50 to-yellow-100 border-4 border-t-0 border-amber-900 rounded-b-lg p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-bold text-amber-900 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white border-3 border-amber-700 rounded-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-amber-900 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white border-3 border-amber-700 rounded-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {displayError && (
              <div className="bg-red-100 border-2 border-red-600 rounded-lg p-3">
                <p className="text-red-800 text-sm font-semibold text-center">
                  ⚠️ {displayError}
                </p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg border-2 border-amber-900"
            >
              {isLoading ? '⏳ Logging in...' : '⚔️ Enter the Arena'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-amber-800 text-sm mb-2">
              New to NextEra?
            </p>
            <button
              onClick={onSwitchToRegister}
              disabled={isLoading}
              className="text-amber-900 hover:text-yellow-700 font-bold underline text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create an Account →
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-amber-200 text-xs">
            🌟 Inspired by Golden Sun 🌟
          </p>
        </div>
      </div>
    </div>
  );
}
