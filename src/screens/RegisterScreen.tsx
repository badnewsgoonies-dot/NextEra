/*
 * RegisterScreen: User registration interface
 * 
 * Features:
 * - Email, username, password registration
 * - Optional display name
 * - Input validation
 * - Error display
 * - Link to login
 * - Beautiful Golden Sun-inspired UI
 */

import React, { useState } from 'react';

export interface RegisterScreenProps {
  onRegister: (
    email: string,
    username: string,
    password: string,
    displayName?: string
  ) => Promise<void>;
  onSwitchToLogin: () => void;
  error?: string;
}

export function RegisterScreen({
  onRegister,
  onSwitchToLogin,
  error,
}: RegisterScreenProps): React.ReactElement {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Validation
    if (!email || !username || !password) {
      setLocalError('Please fill in all required fields');
      return;
    }

    if (username.length < 3) {
      setLocalError('Username must be at least 3 characters long');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await onRegister(email, username, password, displayName || undefined);
    } catch (err) {
      setLocalError((err as Error).message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Title Card */}
        <div className="bg-gradient-to-b from-purple-100 to-indigo-200 rounded-t-lg p-6 border-4 border-indigo-900 shadow-2xl">
          <h1 className="text-5xl font-bold text-center text-indigo-900 mb-2 tracking-wide">
            ⚔️ NextEra ⚔️
          </h1>
          <p className="text-center text-indigo-800 text-sm">
            Begin Your Journey
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-gradient-to-b from-purple-50 to-indigo-100 border-4 border-t-0 border-indigo-900 rounded-b-lg p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-indigo-900 mb-6 text-center">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-indigo-900 mb-2"
              >
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white border-3 border-indigo-700 rounded-lg text-indigo-900 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                placeholder="your.email@example.com"
                autoComplete="email"
              />
            </div>

            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-bold text-indigo-900 mb-2"
              >
                Username *
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white border-3 border-indigo-700 rounded-lg text-indigo-900 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                placeholder="Choose a username"
                autoComplete="username"
              />
            </div>

            {/* Display Name Input */}
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-bold text-indigo-900 mb-2"
              >
                Display Name (optional)
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white border-3 border-indigo-700 rounded-lg text-indigo-900 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                placeholder="How should we call you?"
                autoComplete="name"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-indigo-900 mb-2"
              >
                Password * (min. 6 characters)
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white border-3 border-indigo-700 rounded-lg text-indigo-900 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                placeholder="Create a strong password"
                autoComplete="new-password"
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-bold text-indigo-900 mb-2"
              >
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white border-3 border-indigo-700 rounded-lg text-indigo-900 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                placeholder="Re-enter your password"
                autoComplete="new-password"
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

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-gradient-to-b from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg border-2 border-indigo-900"
            >
              {isLoading ? '⏳ Creating Account...' : '✨ Begin Your Journey'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-indigo-800 text-sm mb-2">
              Already have an account?
            </p>
            <button
              onClick={onSwitchToLogin}
              disabled={isLoading}
              className="text-indigo-900 hover:text-purple-700 font-bold underline text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-indigo-200 text-xs">
            🌟 Inspired by Golden Sun 🌟
          </p>
        </div>
      </div>
    </div>
  );
}
