/*
 * UnitBattleCard: Displays a unit in battle
 * Shows sprite, name, HP bar, and status
 */

import React from 'react';
import type { BattleUnit, Role } from '../../types/game.js';
import { HPBar } from './HPBar.js';

export interface UnitBattleCardProps {
  unit: BattleUnit;
  isActive?: boolean; // Currently acting
  isTargeted?: boolean; // Being attacked
  isDead?: boolean;
  className?: string;
}

// Placeholder sprite colors by role
const ROLE_COLORS: Record<Role, string> = {
  Tank: 'bg-blue-600',
  DPS: 'bg-red-600',
  Support: 'bg-purple-600',
  Specialist: 'bg-amber-600',
};

export function UnitBattleCard({
  unit,
  isActive = false,
  isTargeted = false,
  isDead = false,
  className = '',
}: UnitBattleCardProps): React.ReactElement {
  const spriteColor = ROLE_COLORS[unit.role];

  return (
    <div 
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-300 bg-white dark:bg-gray-800
        ${isActive ? 'border-yellow-400 shadow-lg shadow-yellow-400/50 scale-105 ring-4 ring-yellow-400/30' : 'border-gray-600 dark:border-gray-500'}
        ${isTargeted ? 'border-red-400 shadow-lg shadow-red-400/50 ring-4 ring-red-400/30' : ''}
        ${isDead ? 'opacity-30 grayscale' : 'opacity-100'}
        ${className}
      `}
    >
      {/* Unit Sprite (Placeholder) */}
      <div className="flex flex-col items-center mb-2">
        <div 
          className={`w-16 h-16 rounded-full ${spriteColor} border-4 border-white shadow-lg flex items-center justify-center`}
        >
          <span className="text-white text-2xl font-bold">
            {unit.name.charAt(0)}
          </span>
        </div>
        
        {/* Unit Name */}
        <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-white text-center">
          {unit.name}
        </div>
      </div>

      {/* HP Bar */}
      <HPBar currentHp={unit.currentHp} maxHp={unit.maxHp} />

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
          ACT
        </div>
      )}

      {/* Dead Overlay */}
      {isDead && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <span className="text-white text-xl font-bold">KO</span>
        </div>
      )}
    </div>
  );
}

