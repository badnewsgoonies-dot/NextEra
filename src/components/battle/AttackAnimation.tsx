/*
 * AttackAnimation: Visual effect overlay for attack actions
 *
 * Displays role-based colored effects at target position during attacks.
 * Uses CSS animations for simple, performant visual feedback.
 *
 * Features:
 * - Role-specific colors (Tank=green, DPS=red, Support=blue, Specialist=amber)
 * - Dual-layer animation (ping + pulse) for visual interest
 * - Automatic cleanup after duration
 * - Positioned absolutely at target coordinates
 * - Accessible (hidden from screen readers)
 *
 * Future Enhancement:
 * - Replace CSS effects with Golden Sun-style Psynergy GIFs
 * - This is a temporary placeholder using Tailwind animations
 * - Original plan included loading /sprites/psynergy/*.gif files
 */

import React, { useState, useEffect } from 'react';
import type { Role } from '../../types/game.js';

// ============================================
// Role-Based Visual Configuration
// ============================================

/**
 * Attack effect colors mapped to unit roles
 * Matches the theme and feel of each role type
 */
const ATTACK_COLORS: Record<Role, string> = {
  Tank: '#16a34a', // Green - sturdy, defensive
  DPS: '#ef4444', // Red - aggressive, damage-focused
  Support: '#3b82f6', // Blue - magical, helpful
  Specialist: '#f59e0b', // Amber - unique, versatile
};

// ============================================
// Component Interface
// ============================================

export interface AttackAnimationProps {
  /** Role of the attacking unit (determines effect color) */
  attackerRole: Role;
  /** Screen position where the attack effect should appear */
  targetPosition: { x: number; y: number };
  /** Callback when animation completes (for cleanup) */
  onComplete: () => void;
  /** Duration of the animation in milliseconds */
  duration?: number;
}

// ============================================
// Main Component
// ============================================

/**
 * AttackAnimation renders a temporary visual effect at target position
 *
 * The effect consists of two overlapping circles:
 * 1. Outer ring with "ping" animation (expands and fades)
 * 2. Inner circle with "pulse" animation (scales up/down)
 *
 * Both circles use the role-specific color with glowing shadows.
 * After the specified duration, the component calls onComplete and hides itself.
 *
 * @example
 * ```tsx
 * <AttackAnimation
 *   attackerRole="DPS"
 *   targetPosition={{ x: 500, y: 300 }}
 *   onComplete={() => setShowAnim(false)}
 *   duration={800}
 * />
 * ```
 */
export function AttackAnimation({
  attackerRole,
  targetPosition,
  onComplete,
  duration = 1000,
}: AttackAnimationProps): React.ReactElement {
  const [visible, setVisible] = useState(true);

  /**
   * Auto-hide after duration and trigger completion callback
   * Cleanup timeout on unmount to prevent memory leaks
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, duration);

    // Important: clear timeout if component unmounts early
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  // Don't render anything if animation is complete
  if (!visible) return <></>;

  const color = ATTACK_COLORS[attackerRole];

  return (
    <div
      className="absolute inset-0 pointer-events-none z-50"
      role="presentation"
      aria-hidden="true"
    >
      {/* Outer expanding ring (ping animation) */}
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

      {/* Inner pulsing circle (pulse animation) */}
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
