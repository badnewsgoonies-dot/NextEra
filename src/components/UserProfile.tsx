/*
 * UserProfile: Display user info and logout button
 * 
 * Shows current user's information and provides logout functionality
 */

import React from 'react';
import type { User } from '../types/auth.js';

export interface UserProfileProps {
  user: User;
  onLogout: () => void;
  compact?: boolean;
}

export function UserProfile({
  user,
  onLogout,
  compact = false,
}: UserProfileProps): React.ReactElement {
  const displayName = user.displayName || user.username;

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-md">
        <div className="flex items-center gap-2">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
            {displayName}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 shadow-lg border-2 border-indigo-300 dark:border-gray-600">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-600 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-white dark:border-gray-600 shadow-md">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-indigo-900 dark:text-gray-100">
              {displayName}
            </h2>
            <p className="text-sm text-indigo-700 dark:text-gray-300">
              @{user.username}
            </p>
            <p className="text-xs text-indigo-600 dark:text-gray-400 mt-1">
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors shadow-md"
        >
          🚪 Logout
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t-2 border-indigo-300 dark:border-gray-600">
        <div>
          <p className="text-xs text-indigo-700 dark:text-gray-400 font-semibold">
            Member Since
          </p>
          <p className="text-sm text-indigo-900 dark:text-gray-200">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-indigo-700 dark:text-gray-400 font-semibold">
            Last Login
          </p>
          <p className="text-sm text-indigo-900 dark:text-gray-200">
            {new Date(user.lastLogin).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
