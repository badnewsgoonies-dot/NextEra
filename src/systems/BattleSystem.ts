/**
 * @deprecated
 * BattleSystem (Auto-Battle) is deprecated as of NextEra v2.0
 * 
 * The auto-battler system has been replaced by manual player-controlled combat (BattleScreen.tsx).
 * This file is preserved for:
 * - Test reference
 * - Backward compatibility
 * - Historical documentation
 * 
 * DO NOT USE in new code. Use the manual BattleScreen component instead.
 * Safe to remove once all dependent code is migrated.
 * 
 * Original Features (now in BattleScreen.tsx):
 * - Turn-based combat (speed-based initiative)
 * - Deterministic (same seed + teams = same outcome)
 * - Mutable state (Decision 1b: clone units, mutate HP during battle)
 * - 500 turn limit (Decision 3c: prevent infinite loops)
 * - Draw support (Decision 4c: both teams dead or stalemate)
 */

import type { IRng } from '../utils/rng.js';
import type { ILogger } from './Logger.js';
import type { 
  PlayerUnit, 
  EnemyUnitTemplate, 
  BattleUnit, 
  BattleResult, 
  CombatAction 
} from '../types/game.js';
import { EventLogger } from './EventLogger.js';

const MAX_BATTLE_TURNS = 500;

export class BattleSystem {
  constructor(
    private readonly logger: ILogger,
    private readonly eventLogger: EventLogger
  ) {}

  /**
   * Execute a complete battle
   * 
   * @param playerTeam - Player units (max 4)
   * @param enemyTeam - Enemy unit templates from opponent spec
   * @param battleRng - Deterministic RNG (fork of main RNG)
   * @param battleIndex - Battle number (for logging)
   * @param opponentId - Opponent spec ID (for logging)
   * @returns Battle result with all actions logged
   */
  executeBattle(
    playerTeam: readonly PlayerUnit[],
    enemyTeam: readonly EnemyUnitTemplate[],
    battleRng: IRng,
    battleIndex: number,
    opponentId: string
  ): BattleResult {
    // Step 1: Initialize battle units (mutable clones)
    const battleUnits = this.initializeBattleUnits(playerTeam, enemyTeam);

    // Step 1.5: Check for empty teams before battle starts
    const initialVictory = this.checkVictory(battleUnits);
    if (initialVictory !== null) {
      // Battle ends immediately (empty team scenario)
      return {
        winner: initialVictory,
        actions: [],
        unitsDefeated: [],
        turnsTaken: 0,
      };
    }

    // Step 2: Log battle start
    this.eventLogger.logBattleStarted({
      battleIndex,
      opponentId,
      playerTeam: battleUnits.filter(u => u.isPlayer).map(u => ({ id: u.id, name: u.name, role: u.role })),
      enemyTeam: battleUnits.filter(u => !u.isPlayer).map(u => ({ id: u.id, name: u.name, role: u.role })),
    });

    // Step 3: Calculate turn order (deterministic)
    const turnOrder = this.calculateTurnOrder(battleUnits);

    // Step 4: Execute battle loop
    const actions: CombatAction[] = [];
    const unitsDefeated: string[] = [];
    let turnCount = 0;
    let seq = 0;
    let winner: 'player' | 'enemy' | 'draw' | null = null;

    while (turnCount < MAX_BATTLE_TURNS && winner === null) {
      for (const actorId of turnOrder) {
        const actor = battleUnits.find(u => u.id === actorId);
        if (!actor || actor.currentHp <= 0) continue; // Skip dead units

        // Select target (lowest HP enemy)
        const target = this.selectTarget(actor, battleUnits);
        if (!target) continue; // No valid targets

        // Execute attack
        const action = this.executeAttack(actor, target, battleRng, seq++);
        actions.push(action);

        // Check if target was defeated
        if (target.currentHp <= 0) {
          unitsDefeated.push(target.id);
          actions.push({
            type: 'defeat',
            actorId: target.id,
            seq: seq++,
          });
        }

        // Check victory condition
        winner = this.checkVictory(battleUnits);
        if (winner !== null) break;
      }

      turnCount++;
    }

    // Stalemate = draw (Decision 3c: 500 turns)
    if (winner === null) {
      winner = 'draw';
      this.logger.warn('battle:stalemate', { battleIndex, turns: turnCount });
    }

    // Log battle end
    this.eventLogger.logBattleEnded({
      battleIndex,
      winner,
      turnsTaken: turnCount,
      unitsDefeated,
    });

    if (winner === 'enemy' || winner === 'draw') {
      this.eventLogger.logBattleDefeat({
        battleIndex,
        playerTeam: battleUnits.filter(u => u.isPlayer).map(u => ({ id: u.id, name: u.name })),
      });
    }

    return {
      winner,
      actions,
      unitsDefeated,
      turnsTaken: turnCount,
    };
  }

  /**
   * Initialize battle units from player team and enemy templates
   * Decision 1b: Mutable approach - clone units and mutate HP during battle
   */
  private initializeBattleUnits(
    playerTeam: readonly PlayerUnit[],
    enemyTeam: readonly EnemyUnitTemplate[]
  ): BattleUnit[] {
    const units: BattleUnit[] = [];

    // Convert player units
    playerTeam.forEach((unit, index) => {
      units.push({
        id: unit.id,
        name: unit.name,
        role: unit.role,
        tags: unit.tags,
        currentHp: unit.hp,
        maxHp: unit.maxHp,
        atk: unit.atk,
        def: unit.def,
        speed: unit.speed,
        isPlayer: true,
        originalIndex: index,
      });
    });

    // Convert enemy templates
    enemyTeam.forEach((template, index) => {
      units.push({
        id: template.id,
        name: template.name,
        role: template.role,
        tags: template.tags,
        currentHp: template.baseStats.hp,
        maxHp: template.baseStats.hp,
        atk: template.baseStats.atk,
        def: template.baseStats.def,
        speed: template.baseStats.speed,
        isPlayer: false,
        originalIndex: playerTeam.length + index,
      });
    });

    return units;
  }

  /**
   * Calculate turn order
   * Sort by: speed DESC, then isPlayer (true first), then originalIndex ASC
   */
  private calculateTurnOrder(units: readonly BattleUnit[]): string[] {
    const sorted = [...units].sort((a, b) => {
      // Primary: Speed (highest first)
      if (a.speed !== b.speed) return b.speed - a.speed;

      // Secondary: Player wins ties
      if (a.isPlayer !== b.isPlayer) return a.isPlayer ? -1 : 1;

      // Tertiary: Original index (deterministic)
      return a.originalIndex - b.originalIndex;
    });

    return sorted.map(u => u.id);
  }

  /**
   * Select target for attack
   * Target lowest HP enemy (deterministic)
   */
  private selectTarget(
    attacker: BattleUnit,
    allUnits: readonly BattleUnit[]
  ): BattleUnit | null {
    const enemies = allUnits.filter(u => u.isPlayer !== attacker.isPlayer && u.currentHp > 0);
    
    if (enemies.length === 0) return null;

    // Find lowest HP enemy
    // Break ties by originalIndex for determinism
    let target = enemies[0];
    for (const enemy of enemies) {
      if (enemy.currentHp < target.currentHp) {
        target = enemy;
      } else if (enemy.currentHp === target.currentHp && enemy.originalIndex < target.originalIndex) {
        target = enemy;
      }
    }

    return target;
  }

  /**
   * Calculate damage
   * Formula: floor(atk - def/2) + rng(-2, 2), minimum 1
   * Decision 2a: Use Math.floor for rounding
   */
  private calculateDamage(
    attacker: BattleUnit,
    defender: BattleUnit,
    rng: IRng
  ): number {
    const baseDamage = Math.floor(attacker.atk - defender.def / 2);
    const variance = rng.int(-2, 2);
    const totalDamage = baseDamage + variance;
    
    // Minimum 1 damage
    return Math.max(1, totalDamage);
  }

  /**
   * Execute an attack
   * Mutates defender.currentHp, returns CombatAction
   */
  private executeAttack(
    attacker: BattleUnit,
    defender: BattleUnit,
    rng: IRng,
    seq: number
  ): CombatAction {
    const damage = this.calculateDamage(attacker, defender, rng);
    
    // Apply damage (mutable)
    defender.currentHp -= damage;
    if (defender.currentHp < 0) defender.currentHp = 0;

    return {
      type: 'attack',
      actorId: attacker.id,
      targetId: defender.id,
      damage,
      seq,
    };
  }

  /**
   * Check victory condition
   * Returns 'player', 'enemy', 'draw' (simultaneous defeat), or null (ongoing)
   * Decision 4c: Draw if both teams defeated simultaneously
   */
  private checkVictory(units: readonly BattleUnit[]): 'player' | 'enemy' | 'draw' | null {
    const playersAlive = units.filter(u => u.isPlayer && u.currentHp > 0).length;
    const enemiesAlive = units.filter(u => !u.isPlayer && u.currentHp > 0).length;

    // Decision 4c: Draw if both teams dead (simultaneous defeat)
    if (playersAlive === 0 && enemiesAlive === 0) {
      return 'draw';
    }

    if (playersAlive === 0) {
      return 'enemy';
    }

    if (enemiesAlive === 0) {
      return 'player';
    }

    return null; // Battle continues
  }
}

