/*
 * Card: Base card component for UI elements
 * 
 * Adapted from legacy Card.tsx with MVP styling
 * Provides consistent card styling across the application
 */

import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'interactive';
  onClick?: () => void;
}

const VARIANT_STYLES = {
  default: 'bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-card',
  elevated: 'bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-card-hover',
  interactive: 'bg-white dark:bg-surface-dark border-2 border-border-light dark:border-border-dark shadow-card hover:shadow-card-hover hover:border-primary transition-all cursor-pointer',
} as const;

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  onClick,
}: CardProps): React.ReactElement {
  return (
    <div 
      className={`rounded-lg p-4 ${VARIANT_STYLES[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

