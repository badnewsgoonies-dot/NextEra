/*
 * EnemyUnit: Wrapper around UnitBattleCard for clarity + future enemy-only UI hooks
 */

import React from 'react';
import type { BattleUnit } from '../../types/game.js';
import { UnitBattleCard } from './UnitBattleCard.js';

export interface EnemyUnitProps {
  unit: BattleUnit;
  isActive?: boolean;
  isTargeted?: boolean;
}

export function EnemyUnit({
  unit,
  isActive = false,
  isTargeted = false,
}: EnemyUnitProps): React.ReactElement {
  return (
    <UnitBattleCard
      unit={unit}
      isActive={isActive}
      isTargeted={isTargeted}
      isDead={unit.currentHp <= 0}
      className="w-40"
    />
  );
}

