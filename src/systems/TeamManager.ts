/*
 * TeamManager: Manage player team composition
 * 
 * Features:
 * - Recruit defeated enemies as player units
 * - Enforce 4-unit team limit
 * - Handle unit replacement
 * - Validate team composition
 */

import type { PlayerUnit, EnemyUnitTemplate } from '../types/game.js';
import { ok, err, type Result } from '../utils/Result.js';

export class TeamManager {
  private readonly maxTeamSize = 4;
  private recruitCounter = 0; // Counter for deterministic ID generation

  /**
   * Add unit to team or require replacement
   */
  recruitUnit(
    currentTeam: readonly PlayerUnit[],
    enemyTemplate: EnemyUnitTemplate,
    replaceUnitId?: string
  ): Result<readonly PlayerUnit[], string> {
    // Convert enemy to player unit
    const newUnit: PlayerUnit = this.convertEnemyToPlayer(enemyTemplate);

    // Team not full - just add
    if (currentTeam.length < this.maxTeamSize) {
      return ok([...currentTeam, newUnit]);
    }

    // Team full - replacement required
    if (!replaceUnitId) {
      return err('Team full - must specify unit to replace');
    }

    const replaceIndex = currentTeam.findIndex(u => u.id === replaceUnitId);
    if (replaceIndex === -1) {
      return err(`Unit ${replaceUnitId} not found in team`);
    }

    const newTeam = [...currentTeam];
    newTeam[replaceIndex] = newUnit;
    return ok(newTeam);
  }

  /**
   * Convert enemy unit template to player unit
   * Uses counter for deterministic ID generation
   */
  private convertEnemyToPlayer(enemyTemplate: EnemyUnitTemplate): PlayerUnit {
    this.recruitCounter++;
    return {
      id: `recruited_${enemyTemplate.id}_${this.recruitCounter}`,
      name: enemyTemplate.name,
      role: enemyTemplate.role,
      tags: enemyTemplate.tags,
      hp: enemyTemplate.baseStats.hp,
      maxHp: enemyTemplate.baseStats.hp,
      atk: enemyTemplate.baseStats.atk,
      def: enemyTemplate.baseStats.def,
      speed: enemyTemplate.baseStats.speed,
      level: 1,
      experience: 0,
      portraitUrl: enemyTemplate.portraitUrl,
      spriteUrl: enemyTemplate.spriteUrl,
    };
  }

  /**
   * Check if team is valid (1-4 units)
   */
  validateTeam(team: readonly PlayerUnit[]): Result<void, string> {
    if (team.length === 0) {
      return err('Team cannot be empty');
    }
    if (team.length > this.maxTeamSize) {
      return err(`Team cannot exceed ${this.maxTeamSize} units`);
    }
    return ok(undefined);
  }

  /**
   * Check if team is full
   */
  isTeamFull(team: readonly PlayerUnit[]): boolean {
    return team.length >= this.maxTeamSize;
  }

  /**
   * Get number of available slots
   */
  getAvailableSlots(team: readonly PlayerUnit[]): number {
    return Math.max(0, this.maxTeamSize - team.length);
  }
}
