/*
 * BattleUnitSlot: Reusable component for rendering units in battle
 *
 * Handles positioning, sprite display, HP bars, and visual effects
 * for both player and enemy units. Reduces duplication and ensures
 * consistent styling across the battlefield.
 *
 * Features:
 * - Automatic positioning based on index and formation type
 * - Active unit highlighting with role-specific glow effects
 * - Target selection rings
 * - Hit/attack animations
 * - Accessible ARIA labels for screen readers
 */

import React, { forwardRef } from 'react';
import type { BattleUnit } from '../../types/game.js';
import { AnimatedUnitSprite } from './AnimatedUnitSprite.js';
import { AnimatedEnemySprite } from './AnimatedEnemySprite.js';
import { GoldenSunHPBar } from './GoldenSunHPBar.js';
import {
  calculateEnemyPosition,
  calculatePlayerPosition,
  ENEMY_LAYOUT,
  PLAYER_LAYOUT,
  ACTIVE_UNIT_EFFECTS,
  TARGET_EFFECTS,
} from './battleConstants.js';

export interface BattleUnitSlotProps {
  /** The unit to display */
  unit: BattleUnit;
  /** Position index in formation (0-3) */
  index: number;
  /** Whether this is a player unit (vs enemy) */
  isPlayer: boolean;
  /** Whether this unit is currently active (taking turn) */
  isActive: boolean;
  /** Whether this unit is targeted by an attack */
  isTargeted: boolean;
  /** Whether this unit is currently attacking */
  isAttacking?: boolean;
  /** Whether this unit is being hit by an attack */
  isHit?: boolean;
  /** Optional CSS class names */
  className?: string;
}

/**
 * BattleUnitSlot renders a single unit on the battlefield
 *
 * Automatically positions the unit based on its index and team (player/enemy)
 * using a 2x2 diagonal formation layout. Applies visual effects for active
 * units and targets. Provides accessibility labels for screen readers.
 *
 * Use forwardRef to allow parent to attach refs for position tracking
 * (needed for attack animations to target specific units)
 */
export const BattleUnitSlot = forwardRef<HTMLDivElement, BattleUnitSlotProps>(
  (
    {
      unit,
      index,
      isPlayer,
      isActive,
      isTargeted,
      isAttacking = false,
      isHit = false,
      className = '',
    },
    ref
  ) => {
    // Calculate position based on formation type
    const position = isPlayer
      ? calculatePlayerPosition(index)
      : calculateEnemyPosition(index);

    // Select appropriate sprite scale
    const scale = isPlayer ? PLAYER_LAYOUT.SPRITE_SCALE : ENEMY_LAYOUT.SPRITE_SCALE;

    // Active unit visual effects (glow and scale)
    const activeGlow = isPlayer
      ? ACTIVE_UNIT_EFFECTS.PLAYER_GLOW
      : ACTIVE_UNIT_EFFECTS.ENEMY_GLOW;
    const activeGlowRadius = isPlayer
      ? ACTIVE_UNIT_EFFECTS.PLAYER_GLOW_RADIUS
      : ACTIVE_UNIT_EFFECTS.ENEMY_GLOW_RADIUS;
    const activeScale = isPlayer
      ? ACTIVE_UNIT_EFFECTS.PLAYER_SCALE
      : ACTIVE_UNIT_EFFECTS.ENEMY_SCALE;

    // Target ring color
    const ringColor = isPlayer
      ? TARGET_EFFECTS.PLAYER_RING_COLOR
      : TARGET_EFFECTS.ENEMY_RING_COLOR;

    // Build CSS classes for active state
    const activeClasses = isActive
      ? `scale-${activeScale} brightness-${ACTIVE_UNIT_EFFECTS.BRIGHTNESS}`
      : '';

    // Build CSS classes for targeting ring
    const targetClasses = isTargeted
      ? `ring-${TARGET_EFFECTS.RING_WIDTH} ${ringColor} ring-offset-${TARGET_EFFECTS.RING_OFFSET} ring-offset-black/60 rounded-lg`
      : '';

    // ARIA label for accessibility
    const ariaLabel = `${unit.name}, ${unit.role}, HP: ${unit.currentHp} of ${unit.maxHp}${
      isActive ? ', currently active' : ''
    }${isTargeted ? ', targeted' : ''}`;

    return (
      <div
        ref={ref}
        className={`absolute pointer-events-auto ${className}`}
        style={{
          left: `${position.x}px`,
          [isPlayer ? 'bottom' : 'top']: `${position.y}px`,
          transform: `scale(${scale})`,
        }}
        role="group"
        aria-label={ariaLabel}
      >
        <div className="flex flex-col items-center">
          {/* Unit sprite with animations and effects */}
          {isPlayer ? (
            <AnimatedUnitSprite
              unit={unit}
              isAttacking={isAttacking}
              isHit={isHit}
              className={`
                transition-all duration-200
                ${activeClasses}
                ${targetClasses}
              `}
              style={
                isActive
                  ? {
                      filter: `drop-shadow(0 0 ${activeGlowRadius}px ${activeGlow})`,
                    }
                  : undefined
              }
            />
          ) : (
            <AnimatedEnemySprite
              unit={unit}
              isHit={isHit}
              className={`
                transition-all duration-200
                ${activeClasses}
                ${targetClasses}
              `}
              style={
                isActive
                  ? {
                      filter: `drop-shadow(0 0 ${activeGlowRadius}px ${activeGlow})`,
                    }
                  : undefined
              }
            />
          )}

          {/* HP Bar */}
          <div className="mt-3 w-36 md:w-40" aria-hidden="true">
            <GoldenSunHPBar unit={unit} showName={true} />
          </div>
        </div>
      </div>
    );
  }
);

BattleUnitSlot.displayName = 'BattleUnitSlot';
