/*
 * UnitCard: Display unit details in selection screens
 * 
 * Features:
 * - Shows name, role, tags, stats
 * - Selectable state
 * - Keyboard navigation
 * - ARIA labels
 * - Hover/focus effects
 */

import React from 'react';
import type { PlayerUnit, Role, Tag } from '../types/game.js';

// Helper to get role color
function getRoleColor(role: Role): string {
  const roleColors: Record<Role, string> = {
    Tank: 'text-blue-600 dark:text-blue-400',
    DPS: 'text-red-600 dark:text-red-400',
    Support: 'text-green-600 dark:text-green-400',
    Specialist: 'text-purple-600 dark:text-purple-400',
  };
  return roleColors[role];
}

// Helper to get tag color
function getTagColor(tag: Tag): string {
  const tagColors: Record<Tag, string> = {
    Undead: 'bg-gray-700 text-gray-100',
    Mech: 'bg-blue-700 text-blue-100',
    Beast: 'bg-amber-700 text-amber-100',
    Holy: 'bg-yellow-600 text-yellow-100',
    Arcane: 'bg-purple-700 text-purple-100',
    Nature: 'bg-green-700 text-green-100',
  };
  return tagColors[tag];
}

export interface UnitCardProps {
  unit: PlayerUnit;
  selected: boolean;
  focused: boolean;
  onSelect: () => void;
  onFocus: () => void;
  tabIndex: number;
  disabled?: boolean;
}

export const UnitCard = React.memo(function UnitCard({
  unit,
  selected,
  focused,
  onSelect,
  onFocus,
  tabIndex,
  disabled = false,
}: UnitCardProps): React.ReactElement {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onSelect();
      }
    }
  };

  // Border color based on state
  const borderColor = selected
    ? 'border-primary border-4'
    : focused
    ? 'border-primary border-2'
    : 'border-gray-300 dark:border-gray-600 border';

  // Background based on state
  const bgColor = disabled
    ? 'bg-gray-100 dark:bg-gray-800 opacity-50'
    : selected
    ? 'bg-blue-50 dark:bg-blue-900/30'
    : 'bg-white dark:bg-surface-dark';

  const cursor = disabled ? 'cursor-not-allowed' : 'cursor-pointer';

  return (
    <div
      role="checkbox"
      aria-checked={selected}
      aria-labelledby={`unit-${unit.id}-title`}
      aria-describedby={`unit-${unit.id}-desc`}
      aria-disabled={disabled}
      tabIndex={tabIndex}
      onFocus={onFocus}
      onKeyDown={handleKeyDown}
      onClick={() => !disabled && onSelect()}
      className={`
        ${bgColor} ${borderColor} ${cursor}
        rounded-lg p-4 
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${focused || selected ? 'shadow-lg scale-105' : 'shadow-md'}
      `}
    >
      {/* Header: Name + Role */}
      <div className="flex items-start justify-between mb-3">
        <h3 id={`unit-${unit.id}-title`} className="text-lg font-bold text-gray-900 dark:text-white">
          {unit.name}
        </h3>
        <span className={`text-sm font-semibold ${getRoleColor(unit.role)}`}>
          {unit.role}
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {unit.tags.map(tag => (
          <span
            key={tag}
            className={`px-2 py-0.5 rounded text-xs font-semibold ${getTagColor(tag)}`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">HP:</span>
          <span className="font-bold text-gray-900 dark:text-white">{unit.hp}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">ATK:</span>
          <span className="font-bold text-gray-900 dark:text-white">{unit.atk}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">DEF:</span>
          <span className="font-bold text-gray-900 dark:text-white">{unit.def}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">SPD:</span>
          <span className="font-bold text-gray-900 dark:text-white">{unit.speed}</span>
        </div>
      </div>

      {/* Level (if > 1) */}
      {unit.level > 1 && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Level {unit.level} • EXP: {unit.experience}
        </div>
      )}

      {/* Selected indicator */}
      {selected && (
        <div className="mt-3 text-center text-sm font-semibold text-primary">
          ✓ Selected
        </div>
      )}

      {/* Screen reader description */}
      <span id={`unit-${unit.id}-desc`} className="sr-only">
        {unit.role}. Tags: {unit.tags.join(', ')}. 
        HP {unit.hp}, ATK {unit.atk}, DEF {unit.def}, SPD {unit.speed}.
        {selected ? ' Selected.' : ''}
        {disabled ? ' Cannot select - team full.' : ''}
      </span>
    </div>
  );
});
