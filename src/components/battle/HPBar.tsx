/*
 * HPBar: Animated HP bar component
 * Shows current HP / max HP with smooth animations
 */

import React from 'react';

export interface HPBarProps {
  currentHp: number;
  maxHp: number;
  className?: string;
}

export function HPBar({ currentHp, maxHp, className = '' }: HPBarProps): React.ReactElement {
  const percentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  
  // Color based on HP percentage
  const barColor = percentage > 60 
    ? 'bg-green-500' 
    : percentage > 30 
    ? 'bg-yellow-500' 
    : 'bg-red-500';

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
        <span>HP</span>
        <span>{Math.floor(currentHp)}/{maxHp}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={currentHp}
          aria-valuemin={0}
          aria-valuemax={maxHp}
          aria-label={`HP: ${Math.floor(currentHp)} out of ${maxHp}`}
        />
      </div>
    </div>
  );
}

