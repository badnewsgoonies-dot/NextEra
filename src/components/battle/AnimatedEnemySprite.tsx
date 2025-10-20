/*
 * AnimatedEnemySprite: Enemy unit sprite with Golden Sun graphics
 * 
 * Enemies use single static sprites (no animation states like party members)
 * But we can add visual effects (shake on hit, fade on death)
 */

import React, { useState, useEffect } from 'react';
import type { BattleUnit, Role } from '../../types/game.js';
import { getEnemySprite } from '../../data/spriteRegistry.js';

export interface AnimatedEnemySpriteProps {
  unit: BattleUnit;
  isHit?: boolean;
  className?: string;
}

// Fallback colors if sprite fails
const ROLE_COLORS: Record<Role, string> = {
  Tank: 'bg-red-800',
  DPS: 'bg-red-600',
  Support: 'bg-purple-800',
  Specialist: 'bg-amber-800',
};

export function AnimatedEnemySprite({
  unit,
  isHit = false,
  className = '',
}: AnimatedEnemySpriteProps): React.ReactElement {
  const [spriteLoadFailed, setSpriteLoadFailed] = useState(false);
  const [shaking, setShaking] = useState(false);

  const spritePath = getEnemySprite(unit.name, unit.role);

  // Shake effect when hit
  useEffect(() => {
    if (isHit) {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isHit]);

  // Fallback to colored shape
  if (spriteLoadFailed || !spritePath) {
    const color = ROLE_COLORS[unit.role];
    return (
      <div className={`w-20 h-20 rounded ${color} border-4 border-red-900 shadow-lg flex items-center justify-center ${className}`}>
        <span className="text-white text-xl font-bold">
          {unit.name.charAt(0)}
        </span>
      </div>
    );
  }

  // Render Golden Sun enemy sprite
  return (
    <div className={`relative ${className}`}>
      <img
        src={spritePath}
        alt={unit.name}
        className={`
          w-24 h-24 object-contain
          ${shaking ? 'animate-shake' : ''}
          ${unit.currentHp <= 0 ? 'opacity-30 grayscale' : 'opacity-100'}
        `}
        style={{ 
          imageRendering: 'pixelated',
          transition: 'opacity 500ms, filter 500ms',
        }}
        onError={() => {
          console.warn(`Failed to load enemy sprite: ${spritePath}`);
          setSpriteLoadFailed(true);
        }}
      />

      {/* Death overlay */}
      {unit.currentHp <= 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-2xl font-bold drop-shadow-lg">
            💀
          </span>
        </div>
      )}
    </div>
  );
}

