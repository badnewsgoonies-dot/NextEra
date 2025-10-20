/*
 * AttackAnimation: Display attack visual effect
 * 
 * Features:
 * - Simple flash/pulse effect on target
 * - Position overlay on target
 * - Auto-cleanup after animation
 * 
 * Note: Psynergy GIFs removed - using CSS effects for now
 */

import React, { useState, useEffect } from 'react';
import type { Role } from '../../types/game.js';

// Role-based colors for attack effects
const ATTACK_COLORS: Record<Role, string> = {
  Tank: '#16a34a',    // Green
  DPS: '#ef4444',     // Red
  Support: '#3b82f6', // Blue
  Specialist: '#f59e0b', // Amber
};

export interface AttackAnimationProps {
  attackerRole: Role;
  targetPosition: { x: number; y: number };
  onComplete: () => void;
  duration?: number; // milliseconds
}

export function AttackAnimation({
  attackerRole,
  targetPosition,
  onComplete,
  duration = 1000,
}: AttackAnimationProps): React.ReactElement {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!visible) return <></>;

  const color = ATTACK_COLORS[attackerRole];

  return (
    <div
      className="absolute inset-0 pointer-events-none z-50"
      role="presentation"
      aria-hidden="true"
    >
      {/* Simple colored flash effect - no GIFs */}
      <div
        className="absolute rounded-full animate-ping opacity-75"
        style={{
          left: `${targetPosition.x}px`,
          top: `${targetPosition.y}px`,
          transform: 'translate(-50%, -50%)',
          width: '100px',
          height: '100px',
          backgroundColor: color,
          boxShadow: `0 0 40px ${color}, 0 0 80px ${color}`,
        }}
      />
      <div
        className="absolute rounded-full animate-pulse"
        style={{
          left: `${targetPosition.x}px`,
          top: `${targetPosition.y}px`,
          transform: 'translate(-50%, -50%)',
          width: '60px',
          height: '60px',
          backgroundColor: color,
          boxShadow: `0 0 20px #fff`,
        }}
      />
    </div>
  );
}
