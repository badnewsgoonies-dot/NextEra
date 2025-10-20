/*
 * BattleSystem Tests
 * Comprehensive tests for deterministic combat engine
 */

import { describe, test, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { BattleSystem } from '../../src/systems/BattleSystem.js';
import { makeRng } from '../../src/utils/rng.js';
import { ConsoleLogger } from '../../src/systems/Logger.js';
import { EventLogger } from '../../src/systems/EventLogger.js';
import { mockPlayerTeam, mockEnemyTemplates, weakEnemy, strongEnemy, fastUnit, slowUnit } from '../fixtures/battleFixtures.js';
import type { PlayerUnit, EnemyUnitTemplate } from '../../src/types/game.js';

describe('BattleSystem', () => {
  let battleSystem: BattleSystem;
  let logger: ConsoleLogger;
  let eventLogger: EventLogger;

  beforeEach(() => {
    logger = new ConsoleLogger('error'); // Suppress logs in tests
    eventLogger = new EventLogger(logger);
    battleSystem = new BattleSystem(logger, eventLogger);
  });

  describe('Basic Execution', () => {
    test('player wins when all enemies defeated', () => {
      const rng = makeRng(12345);
      const result = battleSystem.executeBattle(mockPlayerTeam, [weakEnemy], rng, 0, 'test');

      expect(result.winner).toBe('player');
      expect(result.actions.length).toBeGreaterThan(0);
      expect(result.turnsTaken).toBeGreaterThan(0);
      expect(result.unitsDefeated).toContain('e_weak');
    });

    test('enemy wins when all players defeated', () => {
      const rng = makeRng(99999);
      const weakPlayer: PlayerUnit = {
        ...mockPlayerTeam[0],
        hp: 10,
        maxHp: 10,
        atk: 5,
        def: 2,
      };
      
      const result = battleSystem.executeBattle([weakPlayer], [strongEnemy], rng, 0, 'test');

      expect(result.winner).toBe('enemy');
      expect(result.unitsDefeated).toContain('p1');
    });

    test('handles 1v1 scenario', () => {
      const rng = makeRng(54321);
      const result = battleSystem.executeBattle([mockPlayerTeam[0]], [mockEnemyTemplates[0]], rng, 0, 'test');

      expect(['player', 'enemy', 'draw']).toContain(result.winner);
      expect(result.turnsTaken).toBeGreaterThan(0);
    });

    test('handles 2v2 scenario', () => {
      const rng = makeRng(11111);
      const result = battleSystem.executeBattle(mockPlayerTeam, mockEnemyTemplates, rng, 0, 'test');

      expect(['player', 'enemy', 'draw']).toContain(result.winner);
      expect(result.actions.length).toBeGreaterThan(0);
    });

    test('handles 4v4 scenario', () => {
      const rng = makeRng(22222);
      const largePlayerTeam = [
        ...mockPlayerTeam,
        { ...mockPlayerTeam[0], id: 'p3', name: 'Mage' },
        { ...mockPlayerTeam[1], id: 'p4', name: 'Cleric' },
      ];
      const largeEnemyTeam = [
        ...mockEnemyTemplates,
        { ...mockEnemyTemplates[0], id: 'e3', name: 'Ghost' },
        { ...mockEnemyTemplates[1], id: 'e4', name: 'Wraith' },
      ];

      const result = battleSystem.executeBattle(largePlayerTeam, largeEnemyTeam, rng, 0, 'test');

      expect(['player', 'enemy', 'draw']).toContain(result.winner);
    });
  });

  describe('Determinism', () => {
    test('same seed + same teams = same outcome', () => {
      const seed = 77777;
      
      const rng1 = makeRng(seed);
      const result1 = battleSystem.executeBattle(mockPlayerTeam, mockEnemyTemplates, rng1, 0, 'test');

      const rng2 = makeRng(seed);
      const result2 = battleSystem.executeBattle(mockPlayerTeam, mockEnemyTemplates, rng2, 0, 'test');

      expect(result1.winner).toBe(result2.winner);
      expect(result1.actions).toEqual(result2.actions);
      expect(result1.turnsTaken).toBe(result2.turnsTaken);
      expect(result1.unitsDefeated).toEqual(result2.unitsDefeated);
    });

    test('different seeds produce different damage rolls', () => {
      const rng1 = makeRng(11111);
      const result1 = battleSystem.executeBattle([mockPlayerTeam[0]], [weakEnemy], rng1, 0, 'test');

      const rng2 = makeRng(99999);
      const result2 = battleSystem.executeBattle([mockPlayerTeam[0]], [weakEnemy], rng2, 0, 'test');

      // Same teams, different seeds - likely different number of actions
      const damage1 = result1.actions.filter(a => a.type === 'attack').map(a => a.damage);
      const damage2 = result2.actions.filter(a => a.type === 'attack').map(a => a.damage);

      // At least one damage value should differ (RNG variance)
      expect(JSON.stringify(damage1) !== JSON.stringify(damage2) || damage1.length !== damage2.length).toBe(true);
    });

    test('property: determinism across many seeds', () => {
      fc.assert(
        fc.property(fc.integer(), (seed) => {
          const rng1 = makeRng(seed);
          const result1 = battleSystem.executeBattle([mockPlayerTeam[0]], [weakEnemy], rng1, 0, 'test');

          const rng2 = makeRng(seed);
          const result2 = battleSystem.executeBattle([mockPlayerTeam[0]], [weakEnemy], rng2, 0, 'test');

          return (
            result1.winner === result2.winner &&
            result1.turnsTaken === result2.turnsTaken &&
            JSON.stringify(result1.actions) === JSON.stringify(result2.actions)
          );
        }),
        { numRuns: 100 }
      );
    });

    test('turn order is deterministic', () => {
      const rng1 = makeRng(33333);
      const result1 = battleSystem.executeBattle(mockPlayerTeam, mockEnemyTemplates, rng1, 0, 'test');

      const rng2 = makeRng(33333);
      const result2 = battleSystem.executeBattle(mockPlayerTeam, mockEnemyTemplates, rng2, 0, 'test');

      // First action should be from same actor (turn order deterministic)
      expect(result1.actions[0].actorId).toBe(result2.actions[0].actorId);
    });

    test('damage rolls are deterministic', () => {
      const rng1 = makeRng(44444);
      const result1 = battleSystem.executeBattle([mockPlayerTeam[0]], [weakEnemy], rng1, 0, 'test');

      const rng2 = makeRng(44444);
      const result2 = battleSystem.executeBattle([mockPlayerTeam[0]], [weakEnemy], rng2, 0, 'test');

      // All damage values should be identical
      const damages1 = result1.actions.filter(a => a.type === 'attack').map(a => a.damage);
      const damages2 = result2.actions.filter(a => a.type === 'attack').map(a => a.damage);

      expect(damages1).toEqual(damages2);
    });
  });

  describe('Turn Order', () => {
    test('faster units act first', () => {
      const rng = makeRng(55555);
      const team = [slowUnit, fastUnit]; // Intentionally out of order
      const result = battleSystem.executeBattle(team, [weakEnemy], rng, 0, 'test');

      // First action should be from fastest unit (speed 100)
      expect(result.actions[0].actorId).toBe('p_fast');
    });

    test('player wins speed ties', () => {
      const rng = makeRng(66666);
      const sameSpeedEnemy: EnemyUnitTemplate = {
        ...weakEnemy,
        id: 'e_same_speed',
        baseStats: { ...weakEnemy.baseStats, speed: 40 }, // Same as warrior (speed 40)
      };

      const result = battleSystem.executeBattle([mockPlayerTeam[0]], [sameSpeedEnemy], rng, 0, 'test');

      // First action should be from player (wins speed ties)
      expect(result.actions[0].actorId).toBe('p1');
    });

    test('originalIndex breaks secondary ties', () => {
      const rng = makeRng(77777);
      const clone1: PlayerUnit = { ...mockPlayerTeam[0], id: 'p1a', name: 'Warrior A' };
      const clone2: PlayerUnit = { ...mockPlayerTeam[0], id: 'p1b', name: 'Warrior B' };

      const result = battleSystem.executeBattle([clone2, clone1], [weakEnemy], rng, 0, 'test');

      // First player action should be from clone2 (originalIndex 0)
      const firstPlayerAction = result.actions.find(a => a.actorId.startsWith('p1'));
      expect(firstPlayerAction?.actorId).toBe('p1b'); // clone2 was at index 0
    });

    test('dead units are skipped', () => {
      const rng = makeRng(88888);
      const result = battleSystem.executeBattle([mockPlayerTeam[0]], [weakEnemy], rng, 0, 'test');

      // After weak enemy dies, it should not have any more actions
      const defeatIndex = result.actions.findIndex(a => a.type === 'defeat' && a.actorId === 'e_weak');
      const actionsAfterDeath = result.actions.slice(defeatIndex + 1);
      const deadUnitActions = actionsAfterDeath.filter(a => a.actorId === 'e_weak' && a.type === 'attack');

      expect(deadUnitActions).toHaveLength(0);
    });
  });

  describe('Targeting', () => {
    test('attacks lowest HP enemy', () => {
      const rng = makeRng(12121);
      const damagedEnemy: EnemyUnitTemplate = {
        ...mockEnemyTemplates[0],
        id: 'e_damaged',
        baseStats: { ...mockEnemyTemplates[0].baseStats, hp: 20 }, // Lower HP
      };
      const fullHpEnemy: EnemyUnitTemplate = {
        ...mockEnemyTemplates[1],
        id: 'e_full',
      };

      const result = battleSystem.executeBattle([mockPlayerTeam[0]], [fullHpEnemy, damagedEnemy], rng, 0, 'test');

      // First attack should target the damaged enemy (lowest HP)
      expect(result.actions[0].targetId).toBe('e_damaged');
    });

    test('skips dead targets', () => {
      const rng = makeRng(23232);
      const result = battleSystem.executeBattle(mockPlayerTeam, [weakEnemy], rng, 0, 'test');

      // After enemy dies, players should have no valid targets
      const defeatIndex = result.actions.findIndex(a => a.type === 'defeat');
      const actionsAfterDefeat = result.actions.slice(defeatIndex + 1);

      // Should have no more attacks (all targets dead)
      expect(actionsAfterDefeat.filter(a => a.type === 'attack')).toHaveLength(0);
    });

    test('deterministic selection when HP tied', () => {
      const rng = makeRng(34343);
      const enemy1: EnemyUnitTemplate = { ...mockEnemyTemplates[0], id: 'e1' };
      const enemy2: EnemyUnitTemplate = { ...mockEnemyTemplates[0], id: 'e2' }; // Same stats

      const result = battleSystem.executeBattle([mockPlayerTeam[0]], [enemy1, enemy2], rng, 0, 'test');

      // First attack should target e1 (lower originalIndex)
      expect(result.actions[0].targetId).toBe('e1');
    });
  });

  describe('Damage Calculation', () => {
    test('damage follows formula: floor(atk - def/2) + rng(-2, 2)', () => {
      const rng = makeRng(45454);
      const attacker = mockPlayerTeam[0]; // atk 20, def 15
      const defender = mockEnemyTemplates[0]; // hp 80, atk 15, def 10
      
      const result = battleSystem.executeBattle([attacker], [defender], rng, 0, 'test');

      const firstAttack = result.actions.find(a => a.type === 'attack');
      expect(firstAttack).toBeDefined();

      if (firstAttack && firstAttack.damage) {
        // Expected: floor(20 - 10/2) + rng(-2, 2) = floor(15) + [-2 to 2] = 13-17
        expect(firstAttack.damage).toBeGreaterThanOrEqual(13);
        expect(firstAttack.damage).toBeLessThanOrEqual(17);
      }
    });

    test('minimum 1 damage even with high defense', () => {
      const rng = makeRng(56565);
      const weakAttacker: PlayerUnit = {
        ...mockPlayerTeam[0],
        atk: 5, // Very low attack
      };
      const highDefEnemy: EnemyUnitTemplate = {
        ...mockEnemyTemplates[0],
        baseStats: { ...mockEnemyTemplates[0].baseStats, def: 50 }, // Very high defense
      };

      const result = battleSystem.executeBattle([weakAttacker], [highDefEnemy], rng, 0, 'test');

      // All damage should be at least 1
      const damages = result.actions.filter(a => a.type === 'attack').map(a => a.damage);
      damages.forEach(dmg => {
        expect(dmg).toBeGreaterThanOrEqual(1);
      });
    });

    test('RNG variance affects damage', () => {
      const damages: number[] = [];

      // Run battle multiple times with different seeds
      for (let seed = 0; seed < 50; seed++) {
        const rng = makeRng(seed * 1000);
        const result = battleSystem.executeBattle([mockPlayerTeam[0]], [weakEnemy], rng, 0, 'test');
        
        // Collect all attack damages, not just first
        result.actions.filter(a => a.type === 'attack').forEach(a => {
          if (a.damage) damages.push(a.damage);
        });
      }

      // Should see variety in damage values (variance is -2 to +2)
      const uniqueDamages = new Set(damages);
      expect(uniqueDamages.size).toBeGreaterThanOrEqual(2); // At least 2 different damage values
    });

    test('high defense reduces damage but not below 1', () => {
      const rng = makeRng(67676);
      const highDefEnemy: EnemyUnitTemplate = {
        ...weakEnemy,
        baseStats: { ...weakEnemy.baseStats, def: 30 },
      };

      const result = battleSystem.executeBattle([mockPlayerTeam[0]], [highDefEnemy], rng, 0, 'test');

      const damages = result.actions.filter(a => a.type === 'attack').map(a => a.damage || 0);
      
      // All should be >= 1
      expect(Math.min(...damages)).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Action Logging', () => {
    test('all attacks are logged with sequence numbers', () => {
      const rng = makeRng(78787);
      const result = battleSystem.executeBattle([mockPlayerTeam[0]], [weakEnemy], rng, 0, 'test');

      const attacks = result.actions.filter(a => a.type === 'attack');
      
      expect(attacks.length).toBeGreaterThan(0);
      attacks.forEach(action => {
        expect(action.seq).toBeDefined();
        expect(action.actorId).toBeDefined();
        expect(action.targetId).toBeDefined();
        expect(action.damage).toBeDefined();
      });
    });

    test('defeats are logged', () => {
      const rng = makeRng(89898);
      const result = battleSystem.executeBattle([mockPlayerTeam[0]], [weakEnemy], rng, 0, 'test');

      const defeats = result.actions.filter(a => a.type === 'defeat');
      
      expect(defeats.length).toBeGreaterThan(0);
      expect(defeats[0].actorId).toBe('e_weak');
      expect(defeats[0].seq).toBeDefined();
    });

    test('sequence numbers increment correctly', () => {
      const rng = makeRng(90909);
      const result = battleSystem.executeBattle(mockPlayerTeam, mockEnemyTemplates, rng, 0, 'test');

      // Check all sequence numbers are unique and incrementing
      const seqs = result.actions.map(a => a.seq);
      
      for (let i = 0; i < seqs.length; i++) {
        expect(seqs[i]).toBe(i);
      }
    });

    test('no gaps in sequence numbers', () => {
      const rng = makeRng(10101);
      const result = battleSystem.executeBattle(mockPlayerTeam, mockEnemyTemplates, rng, 0, 'test');

      const seqs = result.actions.map(a => a.seq);
      const maxSeq = Math.max(...seqs);

      // Should have exactly maxSeq + 1 actions (0-indexed)
      expect(seqs.length).toBe(maxSeq + 1);
    });
  });

  describe('Victory Conditions', () => {
    test('player wins when all enemies defeated', () => {
      const rng = makeRng(20202);
      const result = battleSystem.executeBattle(mockPlayerTeam, [weakEnemy], rng, 0, 'test');

      expect(result.winner).toBe('player');
    });

    test('enemy wins when all players defeated', () => {
      const rng = makeRng(30303);
      const veryWeakPlayer: PlayerUnit = {
        ...mockPlayerTeam[0],
        hp: 1,
        maxHp: 1,
        def: 0,
      };

      const result = battleSystem.executeBattle([veryWeakPlayer], [strongEnemy], rng, 0, 'test');

      expect(result.winner).toBe('enemy');
    });

    test('draw when MAX_TURNS exceeded (stalemate)', () => {
      const rng = makeRng(40404);
      
      // Create unkillable units (very high def, low atk)
      const tankPlayer: PlayerUnit = {
        ...mockPlayerTeam[0],
        hp: 10000,
        maxHp: 10000,
        atk: 1,
        def: 100,
      };
      const tankEnemy: EnemyUnitTemplate = {
        ...mockEnemyTemplates[0],
        baseStats: { hp: 10000, atk: 1, def: 100, speed: 30 },
      };

      const result = battleSystem.executeBattle([tankPlayer], [tankEnemy], rng, 0, 'test');

      // Should result in draw after 500 turns
      expect(result.winner).toBe('draw');
      expect(result.turnsTaken).toBe(500);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty player team as instant defeat', () => {
      const rng = makeRng(50505);
      const result = battleSystem.executeBattle([], [weakEnemy], rng, 0, 'test');

      expect(result.winner).toBe('enemy');
      expect(result.turnsTaken).toBe(0);
    });

    test('handles empty enemy team as instant victory', () => {
      const rng = makeRng(60606);
      const result = battleSystem.executeBattle([mockPlayerTeam[0]], [], rng, 0, 'test');

      expect(result.winner).toBe('player');
      expect(result.turnsTaken).toBe(0);
    });

    test('handles both teams empty as draw', () => {
      const rng = makeRng(70707);
      const result = battleSystem.executeBattle([], [], rng, 0, 'test');

      expect(result.winner).toBe('draw');
      expect(result.turnsTaken).toBe(0);
    });

    test('property: battles always terminate', () => {
      fc.assert(
        fc.property(fc.integer(), (seed) => {
          const rng = makeRng(seed);
          const result = battleSystem.executeBattle([mockPlayerTeam[0]], [weakEnemy], rng, 0, 'test');

          // Battle must end within 500 turns
          return result.turnsTaken <= 500 && result.winner !== null;
        }),
        { numRuns: 50 }
      );
    });

    test('property: no units have negative HP', () => {
      fc.assert(
        fc.property(fc.integer(), (seed) => {
          const rng = makeRng(seed);
          
          // We can't directly inspect units, but we can verify via actions
          // that damage is always positive
          const result = battleSystem.executeBattle(mockPlayerTeam, mockEnemyTemplates, rng, 0, 'test');

          const damages = result.actions.filter(a => a.type === 'attack').map(a => a.damage || 0);
          return damages.every(d => d >= 1);
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Units Defeated Tracking', () => {
    test('unitsDefeated includes all killed units', () => {
      const rng = makeRng(80808);
      const result = battleSystem.executeBattle(mockPlayerTeam, [weakEnemy], rng, 0, 'test');

      expect(result.unitsDefeated).toContain('e_weak');
    });

    test('unitsDefeated matches defeat actions', () => {
      const rng = makeRng(90909);
      const result = battleSystem.executeBattle(mockPlayerTeam, mockEnemyTemplates, rng, 0, 'test');

      const defeatActions = result.actions.filter(a => a.type === 'defeat');
      const defeatedIds = defeatActions.map(a => a.actorId);

      expect(result.unitsDefeated.sort()).toEqual(defeatedIds.sort());
    });
  });
});

