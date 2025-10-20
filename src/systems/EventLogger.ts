/*
 * EventLogger: Game-specific event logging wrapper.
 * 
 * Provides type-safe event emission for MVP telemetry:
 * - choice:generated
 * - choice:selected
 * - choice:degraded
 * - battle:started
 * - battle:ended
 * - battle:defeat
 * - unit:recruited
 * - run:started
 * - run:completed
 * 
 * Usage:
 *   const eventLogger = new EventLogger(logger);
 *   eventLogger.logChoiceGenerated({ battleIndex, previews, ... });
 */

import type { ILogger } from './Logger.js';
import type {
  GameEventType,
  ChoiceGeneratedEvent,
  ChoiceSelectedEvent,
  BattleStartedEvent,
} from '../types/game.js';

export class EventLogger {
  constructor(private readonly logger: ILogger) {}

  /**
   * Log choice generation event
   */
  logChoiceGenerated(data: ChoiceGeneratedEvent): void {
    this.logger.info('choice:generated', {
      battleIndex: data.battleIndex,
      previewCount: data.previews.length,
      previews: data.previews,
      seed: data.seed,
      attempts: data.attempts,
      degraded: data.degraded,
    });
  }

  /**
   * Log choice selection event
   */
  logChoiceSelected(data: ChoiceSelectedEvent): void {
    this.logger.info('choice:selected', {
      battleIndex: data.battleIndex,
      selectedId: data.selectedId,
      difficulty: data.difficulty,
      primaryTag: data.primaryTag,
    });
  }

  /**
   * Log choice degraded event (constraints relaxed after re-rolls)
   */
  logChoiceDegraded(data: { battleIndex: number; reason: string; attempts: number }): void {
    this.logger.warn('choice:degraded', {
      battleIndex: data.battleIndex,
      reason: data.reason,
      attempts: data.attempts,
    });
  }

  /**
   * Log battle start event
   */
  logBattleStarted(data: BattleStartedEvent): void {
    this.logger.info('battle:started', {
      battleIndex: data.battleIndex,
      opponentId: data.opponentId,
      playerTeamSize: data.playerTeam.length,
      enemyTeamSize: data.enemyTeam.length,
      playerTeam: data.playerTeam,
      enemyTeam: data.enemyTeam,
    });
  }

  /**
   * Log battle end event
   */
  logBattleEnded(data: {
    battleIndex: number;
    winner: 'player' | 'enemy' | 'draw';
    turnsTaken: number;
    unitsDefeated: readonly string[];
  }): void {
    this.logger.info('battle:ended', {
      battleIndex: data.battleIndex,
      winner: data.winner,
      turnsTaken: data.turnsTaken,
      unitsDefeatedCount: data.unitsDefeated.length,
    });
  }

  /**
   * Log battle defeat event
   */
  logBattleDefeat(data: {
    battleIndex: number;
    playerTeam: readonly { id: string; name: string }[];
  }): void {
    this.logger.error('battle:defeat', {
      battleIndex: data.battleIndex,
      teamSize: data.playerTeam.length,
      teamComp: data.playerTeam.map(u => u.name).join(', '),
    });
  }

  /**
   * Log unit recruitment event
   */
  logUnitRecruited(data: {
    unitId: string;
    unitName: string;
    role: string;
    replacedUnitId?: string;
  }): void {
    this.logger.info('unit:recruited', {
      unitId: data.unitId,
      unitName: data.unitName,
      role: data.role,
      wasReplacement: !!data.replacedUnitId,
      replacedUnitId: data.replacedUnitId,
    });
  }

  /**
   * Log run start event
   */
  logRunStarted(data: { runSeed: number; starterTeamSize: number }): void {
    this.logger.info('run:started', {
      runSeed: data.runSeed,
      starterTeamSize: data.starterTeamSize,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log run completion event
   */
  logRunCompleted(data: {
    battlesWon: number;
    unitsRecruited: number;
    finalTeamSize: number;
  }): void {
    this.logger.info('run:completed', {
      battlesWon: data.battlesWon,
      unitsRecruited: data.unitsRecruited,
      finalTeamSize: data.finalTeamSize,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Generic event logging (for custom events)
   */
  logEvent(type: GameEventType, data: Record<string, unknown>): void {
    this.logger.info(type, data);
  }
}

