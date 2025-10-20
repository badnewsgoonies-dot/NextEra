/*
 * GoldenSunHPBar: Authentic Golden Sun style HP bar
 * 
 * Features:
 * - Gradient fills (green → yellow → orange → red)
 * - Border styling matching GS aesthetic
 * - Smooth transitions
 * - Unit name with drop shadow
 * - HP number display
 */

import React from 'react';
import type { BattleUnit } from '../../types/game.js';

export interface GoldenSunHPBarProps {
  unit: BattleUnit;
  showName?: boolean;
  className?: string;
}

export function GoldenSunHPBar({
  unit,
  showName = true,
  className = '',
}: GoldenSunHPBarProps): React.ReactElement {
  const percent = Math.max(0, Math.min(100, (unit.currentHp / unit.maxHp) * 100));

  // Golden Sun HP color logic
  const getBarColors = (): { from: string; to: string } => {
    if (percent > 60) return { from: '#22c55e', to: '#16a34a' }; // Green
    if (percent > 30) return { from: '#eab308', to: '#ca8a04' }; // Yellow
    if (percent > 15) return { from: '#f97316', to: '#ea580c' }; // Orange
    return { from: '#ef4444', to: '#dc2626' }; // Red - critical!
  };

  const colors = getBarColors();

  return (
    <div className={`w-full ${className}`}>
      {/* Unit name with Golden Sun style text shadow */}
      {showName && (
        <p 
          className="text-white font-bold text-xs mb-1 tracking-wide"
          style={{
            textShadow: `
              1px 1px 2px rgba(0,0,0,0.9),
              -1px -1px 1px rgba(0,0,0,0.9),
              1px -1px 1px rgba(0,0,0,0.9),
              -1px 1px 1px rgba(0,0,0,0.9)
            `,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 700,
          }}
        >
          {unit.name}
        </p>
      )}

      {/* HP bar container - Golden Sun style */}
      <div className="relative w-full h-3 bg-gray-900 border-2 border-white/90 rounded-sm overflow-hidden shadow-lg">
        {/* Inner shadow for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
        
        {/* HP fill with gradient */}
        <div 
          className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(to right, ${colors.from}, ${colors.to})`,
          }}
        />
        
        {/* Shine effect (Golden Sun signature look) */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none" 
        />

        {/* Border highlight */}
        <div className="absolute inset-0 border border-white/20 rounded-sm pointer-events-none" />
      </div>

      {/* HP numbers - small, clean display */}
      <div className="flex justify-between mt-0.5">
        <span 
          className="text-white text-[10px] font-mono font-bold"
          style={{
            textShadow: '1px 1px 1px rgba(0,0,0,0.8)',
          }}
        >
          HP
        </span>
        <span 
          className="text-white text-[10px] font-mono font-bold"
          style={{
            textShadow: '1px 1px 1px rgba(0,0,0,0.8)',
          }}
        >
          {Math.floor(unit.currentHp)}/{unit.maxHp}
        </span>
      </div>
    </div>
  );
}

