/*
 * AttackAnimation: Display psynergy attack effects
 * 
 * Features:
 * - Role-based psynergy GIF selection
 * - Position overlay on target
 * - Auto-cleanup after animation
 */

import React, { useState, useEffect } from 'react';
import type { Role } from '../../types/game.js';

// Map roles to psynergy animations
const PSYNERGY_ANIMATIONS: Record<Role, string> = {
  Tank: '/sprites/psynergy/Grand_Gaia.gif',
  DPS: '/sprites/psynergy/Dragon_Fire.gif',
  Support: '/sprites/psynergy/Deluge.gif',
  Specialist: '/sprites/psynergy/Spark_Plasma.gif',
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

  return (
    <div
      className="absolute inset-0 pointer-events-none z-50"
      role="presentation"
      aria-hidden="true"
    >
      <img
        src={PSYNERGY_ANIMATIONS[attackerRole]}
        alt="Attack effect"
        className="w-32 h-32 absolute animate-pulse"
        style={{
          left: `${targetPosition.x}px`,
          top: `${targetPosition.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
}
