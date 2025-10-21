/*
 * AnimatedUnitSprite: Party member sprite with full Golden Sun animations
 * 
 * Features:
 * - Automatic animation state management
 * - Weapon-based sprite selection
 * - Smooth transitions between states
 * - Fallback to placeholder on sprite load failure
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { BattleUnit, Role } from '../../types/game.js';
import { 
  getPartySpriteSet, 
  getUnitWeapon, 
  type WeaponType 
} from '../../data/spriteRegistry.js';
import { SpriteAnimator } from '../../systems/SpriteAnimator.js';

export interface AnimatedUnitSpriteProps {
  unit: BattleUnit;
  weapon?: WeaponType;
  isAttacking?: boolean;
  isHit?: boolean;
  onAttackComplete?: () => void;
  onHitComplete?: () => void;
  className?: string;
}

// Fallback colored circles (existing system)
const ROLE_COLORS: Record<Role, string> = {
  Tank: 'bg-blue-600',
  DPS: 'bg-red-600',
  Support: 'bg-purple-600',
  Specialist: 'bg-amber-600',
};

export function AnimatedUnitSprite({
  unit,
  weapon,
  isAttacking = false,
  isHit = false,
  onAttackComplete,
  onHitComplete,
  className = '',
}: AnimatedUnitSpriteProps): React.ReactElement {
  const animator = useRef(new SpriteAnimator()).current;
  const [currentSprite, setCurrentSprite] = useState<string | null>(null);
  const [spriteLoadFailed, setSpriteLoadFailed] = useState(false);
  const [spriteLoading, setSpriteLoading] = useState(true);
  const lastAttackState = useRef(isAttacking);
  const lastHitState = useRef(isHit);

  // Get weapon for this unit
  const unitWeapon = weapon || getUnitWeapon(unit.name);

  // Get sprite set
  const spriteSet = getPartySpriteSet(unit.name, unitWeapon);

  // Update current sprite based on animator state
  const updateSprite = useCallback(() => {
    if (!spriteSet) {
      setSpriteLoadFailed(true);
      return;
    }

    const sprite = animator.getCurrentSprite(spriteSet);
    setCurrentSprite(sprite);
  }, [spriteSet, animator]);

  // Subscribe to animation state changes
  useEffect(() => {
    const unsubscribe = animator.onChange(updateSprite);
    updateSprite(); // Initial update

    return unsubscribe;
  }, [animator, updateSprite]);

  // Handle attack trigger
  useEffect(() => {
    if (isAttacking && !lastAttackState.current) {
      animator.playAttack(() => {
        onAttackComplete?.();
      });
    }
    lastAttackState.current = isAttacking;
  }, [isAttacking, animator, onAttackComplete]);

  // Handle hit trigger
  useEffect(() => {
    if (isHit && !lastHitState.current) {
      animator.playHit(() => {
        onHitComplete?.();
      });
    }
    lastHitState.current = isHit;
  }, [isHit, animator, onHitComplete]);

  // Handle downed state
  useEffect(() => {
    if (unit.currentHp <= 0) {
      animator.playDowned();
    }
  }, [unit.currentHp, animator]);

  // Cleanup on unmount
  useEffect(() => {
    return () => animator.destroy();
  }, [animator]);

  // Fallback to colored circle if sprite loading fails
  if (spriteLoadFailed || !spriteSet || !currentSprite) {
    const color = ROLE_COLORS[unit.role];
    return (
      <div className={`w-32 h-32 rounded-full ${color} border-4 border-white shadow-lg flex items-center justify-center ${className}`}>
        <span className="text-white text-3xl font-bold">
          {unit.name.charAt(0)}
        </span>
      </div>
    );
  }

  // Render Golden Sun sprite with loading skeleton (larger size)
  return (
    <div className="relative">
      {spriteLoading && (
        <div className="absolute inset-0 w-40 h-40 bg-slate-700/50 animate-pulse rounded-lg" />
      )}
      <img
        src={currentSprite}
        alt={unit.name}
        width={160}
        height={160}
        className={`w-40 h-40 object-contain ${className} ${spriteLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ 
          imageRendering: 'pixelated',
          filter: unit.currentHp <= 0 ? 'grayscale(100%) opacity(0.5)' : 'none',
        }}
        onLoad={() => setSpriteLoading(false)}
        onError={() => {
          console.warn(`Failed to load sprite: ${currentSprite}`);
          setSpriteLoadFailed(true);
          setSpriteLoading(false);
        }}
      />
    </div>
  );
}

