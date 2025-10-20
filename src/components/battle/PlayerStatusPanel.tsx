/*
 * PlayerStatusPanel: Status box for the current acting player unit
 */

import React from 'react';
import type { BattleUnit } from '../../types/game.js';
import { HPBar } from './HPBar.js';

export interface PlayerStatusPanelProps {
  unit?: BattleUnit;
  phase: 'menu' | 'targeting' | 'animating' | 'resolving';
  defending: boolean;
}

export function PlayerStatusPanel({
  unit,
  phase,
  defending,
}: PlayerStatusPanelProps): React.ReactElement {
  if (!unit) {
    return (
      <div className="bg-slate-900/80 border-2 border-cyan-400 rounded-lg p-3">
        <div className="text-sm text-gray-300">No active unit</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border-2 border-cyan-400 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">{unit.name}</div>
        <div className="text-xs text-cyan-300 uppercase">{phase}</div>
      </div>

      <div className="mt-2">
        <HPBar currentHp={unit.currentHp} maxHp={unit.maxHp} />
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
        <div className="bg-slate-800 rounded px-2 py-1 text-center">
          ATK <span className="font-semibold">{unit.atk}</span>
        </div>
        <div className="bg-slate-800 rounded px-2 py-1 text-center">
          DEF <span className="font-semibold">{unit.def}</span>
        </div>
        <div className="bg-slate-800 rounded px-2 py-1 text-center">
          SPD <span className="font-semibold">{unit.speed}</span>
        </div>
      </div>

      {defending && (
        <div className="mt-2 text-amber-300 text-sm">🛡️ Defending (next hit halved)</div>
      )}
    </div>
  );
}

