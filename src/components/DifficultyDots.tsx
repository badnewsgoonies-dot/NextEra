/*
 * DifficultyDots: Visual difficulty indicator
 * 
 * Displays 1-3 colored dots representing opponent difficulty:
 * - Standard: 1 blue dot
 * - Normal: 2 amber dots
 * - Hard: 3 red dots
 * 
 * Per Decision #2: No threat scores - use difficulty dots instead
 */

import React from 'react';
import type { Difficulty } from '../types/game.js';

export interface DifficultyDotsProps {
  difficulty: Difficulty;
  className?: string;
}

const DIFFICULTY_CONFIG = {
  Standard: {
    dots: 1,
    color: 'bg-difficulty-standard',
    label: 'Standard difficulty',
  },
  Normal: {
    dots: 2,
    color: 'bg-difficulty-normal',
    label: 'Normal difficulty',
  },
  Hard: {
    dots: 3,
    color: 'bg-difficulty-hard',
    label: 'Hard difficulty',
  },
} as const;

export function DifficultyDots({ difficulty, className = '' }: DifficultyDotsProps): React.ReactElement {
  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <div 
      className={`flex items-center gap-1 ${className}`}
      aria-label={config.label}
      role="img"
    >
      {Array.from({ length: config.dots }, (_, i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full ${config.color}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

