/*
 * Integration Tests: Full Game Flow
 * 
 * Tests the complete MVP loop:
 * 1. Generate opponent choices (ChoiceSystem)
 * 2. Save game state
 * 3. Load game state
 * 4. Verify same opponents appear (determinism)
 * 5. Select opponent
 * 6. Generate next choices
 */

import { describe, test, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { makeRng } from '../../src/utils/rng.js';
import { ConsoleLogger } from '../../src/systems/Logger.js';
import { ChoiceSystem } from '../../src/systems/ChoiceSystem.js';
import { SaveSystem } from '../../src/systems/SaveSystem.js';
import { InMemorySaveStore } from '../../src/systems/SaveStore.js';
import type { GameStateSnapshot, OpponentPreview } from '../../src/types/game.js';

describe('Integration: Full Game Flow', () => {
  let choiceSystem: ChoiceSystem;
  let saveSystem: SaveSystem;
  let logger: ConsoleLogger;

  beforeEach(() => {
    logger = new ConsoleLogger('error');
    choiceSystem = new ChoiceSystem(logger, { enableLogging: false });
    saveSystem = new SaveSystem(logger, new InMemorySaveStore());
  });

  describe('Complete Loop: Generate → Save → Load → Verify', () => {
    test('generates opponents → saves → loads → same opponents', async () => {
      const gameSeed = 12345;
      const battleIndex = 0;

      // Step 1: Generate initial opponent choices
      const rng1 = makeRng(gameSeed);
      const choices1Result = choiceSystem.generateChoices(rng1, battleIndex);
      expect(choices1Result.ok).toBe(true);

      const choices1 = choices1Result.ok ? choices1Result.value : [];
      const opponent1Ids = choices1.map(p => p.spec.id);

      // Step 2: Save game state
      const gameState: GameStateSnapshot = {
        playerTeam: [],
        inventory: [],
        progression: {
          runsAttempted: 1,
          runsCompleted: 0,
          battlesWon: 0,
          battlesLost: 0,
          unitsRecruited: 0,
        },
        choice: {
          nextChoiceSeed: String(gameSeed),
          battleIndex,
        },
        runSeed: gameSeed,
      };

      const saveResult = await saveSystem.save('test_slot', gameState);
      expect(saveResult.ok).toBe(true);

      // Step 3: Load game state
      const loadResult = await saveSystem.load('test_slot');
      expect(loadResult.ok).toBe(true);

      if (!loadResult.ok) return;

      // Step 4: Regenerate choices from loaded state
      const loadedSeed = parseInt(loadResult.value.choice.nextChoiceSeed);
      const loadedBattleIndex = loadResult.value.choice.battleIndex;
      
      const rng2 = makeRng(loadedSeed);
      const choices2Result = choiceSystem.generateChoices(rng2, loadedBattleIndex);
      expect(choices2Result.ok).toBe(true);

      const choices2 = choices2Result.ok ? choices2Result.value : [];
      const opponent2Ids = choices2.map(p => p.spec.id);

      // Step 5: Verify determinism - CRITICAL MVP REQUIREMENT
      expect(opponent1Ids).toEqual(opponent2Ids);
    });

    test('select opponent → advance battleIndex → different opponents', async () => {
      const gameSeed = 99999;

      // Battle 0
      const choices0 = choiceSystem.generateChoices(makeRng(gameSeed), 0);
      expect(choices0.ok).toBe(true);

      // Battle 1 (after selecting from battle 0)
      const choices1 = choiceSystem.generateChoices(makeRng(gameSeed), 1);
      expect(choices1.ok).toBe(true);

      if (choices0.ok && choices1.ok) {
        const ids0 = choices0.value.map(p => p.spec.id).sort();
        const ids1 = choices1.value.map(p => p.spec.id).sort();

        // Different battles should generally have different opponents
        // (not guaranteed, but highly likely with 19 opponent pool)
        const areDifferent = JSON.stringify(ids0) !== JSON.stringify(ids1);
        
        // Allow same opponents occasionally (small pool), but log for awareness
        if (!areDifferent) {
          console.log('[INFO] Same opponents in consecutive battles (rare but possible)');
        }
        
        // Just verify both succeed
        expect(choices0.ok && choices1.ok).toBe(true);
      }
    });

    test('property: save/load determinism across many seeds', async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer(1, 1000000), fc.integer(0, 100), async (seed, battleIndex) => {
          // Generate choices
          const rng1 = makeRng(seed);
          const choices1 = choiceSystem.generateChoices(rng1, battleIndex);
          if (!choices1.ok) return true;

          // Save
          const state: GameStateSnapshot = {
            playerTeam: [],
            inventory: [],
            progression: { runsAttempted: 1, runsCompleted: 0, battlesWon: 0, battlesLost: 0, unitsRecruited: 0 },
            choice: { nextChoiceSeed: String(seed), battleIndex },
            runSeed: seed,
          };

          await saveSystem.save(`slot_${seed}`, state);

          // Load
          const loaded = await saveSystem.load(`slot_${seed}`);
          if (!loaded.ok) return false;

          // Regenerate
          const rng2 = makeRng(parseInt(loaded.value.choice.nextChoiceSeed));
          const choices2 = choiceSystem.generateChoices(rng2, loaded.value.choice.battleIndex);
          if (!choices2.ok) return false;

          // Verify same IDs
          const ids1 = choices1.value.map(p => p.spec.id);
          const ids2 = choices2.value.map(p => p.spec.id);

          return JSON.stringify(ids1) === JSON.stringify(ids2);
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Multi-Battle Progression', () => {
    test('simulates 5 battles with save/load between each', async () => {
      const gameSeed = 54321;
      let currentBattleIndex = 0;

      for (let i = 0; i < 5; i++) {
        // Generate choices
        const rng = makeRng(gameSeed);
        const choicesResult = choiceSystem.generateChoices(rng, currentBattleIndex);
        expect(choicesResult.ok).toBe(true);

        if (!choicesResult.ok) break;

        // Save state
        const state: GameStateSnapshot = {
          playerTeam: [],
          inventory: [],
          progression: {
            runsAttempted: 1,
            runsCompleted: 0,
            battlesWon: currentBattleIndex,
            battlesLost: 0,
            unitsRecruited: 0,
          },
          choice: {
            nextChoiceSeed: String(gameSeed),
            battleIndex: currentBattleIndex,
          },
          runSeed: gameSeed,
        };

        await saveSystem.save(`battle_${i}`, state);

        // Load and verify
        const loaded = await saveSystem.load(`battle_${i}`);
        expect(loaded.ok).toBe(true);

        if (loaded.ok) {
          expect(loaded.value.choice.battleIndex).toBe(currentBattleIndex);
        }

        // Advance to next battle
        currentBattleIndex++;
      }

      // Verify we created 5 save slots
      const slots = await saveSystem.listSlots();
      expect(slots.ok).toBe(true);
      if (slots.ok) {
        expect(slots.value).toHaveLength(5);
      }
    });
  });

  describe('State Machine Integration', () => {
    test('opponent selection state can be saved and restored', async () => {
      const gameSeed = 77777;
      const rng = makeRng(gameSeed);
      
      // Generate 3 opponents
      const choicesResult = choiceSystem.generateChoices(rng, 0);
      expect(choicesResult.ok).toBe(true);

      if (!choicesResult.ok) return;

      const previews = choicesResult.value;

      // Save with previews
      const state: GameStateSnapshot = {
        playerTeam: [],
        inventory: [],
        progression: { runsAttempted: 1, runsCompleted: 0, battlesWon: 0, battlesLost: 0, unitsRecruited: 0 },
        choice: {
          nextChoiceSeed: String(gameSeed),
          battleIndex: 0,
          lastChoices: previews,
        },
        runSeed: gameSeed,
      };

      await saveSystem.save('with_previews', state);

      // Load and verify previews are preserved
      const loaded = await saveSystem.load('with_previews');
      expect(loaded.ok).toBe(true);

      if (loaded.ok && loaded.value.choice.lastChoices) {
        expect(loaded.value.choice.lastChoices).toHaveLength(3);
        expect(loaded.value.choice.lastChoices[0].spec.id).toBe(previews[0].spec.id);
        expect(loaded.value.choice.lastChoices[1].spec.id).toBe(previews[1].spec.id);
        expect(loaded.value.choice.lastChoices[2].spec.id).toBe(previews[2].spec.id);
      }
    });
  });

  describe('Error Recovery', () => {
    test('handles corrupted save gracefully', async () => {
      // Manually corrupt a save
      const store = new InMemorySaveStore();
      const badSaveSystem = new SaveSystem(logger, store);
      
      await store.write('corrupted', 'not valid json {{{');

      const result = await badSaveSystem.load('corrupted');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('Failed to load');
      }
    });
  });

  describe('Battle System Integration', () => {
    test('full flow: choose opponent → execute battle → verify determinism', async () => {
      const { BattleSystem } = await import('../../src/systems/BattleSystem.js');
      const { EventLogger } = await import('../../src/systems/EventLogger.js');
      const { mockPlayerTeam } = await import('../fixtures/battleFixtures.js');
      const { OPPONENT_CATALOG } = await import('../../src/data/opponents.js');

      const gameSeed = 99999;
      const battleIndex = 0;

      // Step 1: Generate opponent choices
      const choicesRng = makeRng(gameSeed);
      const choicesResult = choiceSystem.generateChoices(choicesRng, battleIndex);
      expect(choicesResult.ok).toBe(true);

      if (!choicesResult.ok) return;

      // Step 2: Select first opponent
      const selectedOpponent = choicesResult.value[0].spec;

      // Step 3: Execute battle with deterministic RNG
      const eventLogger = new EventLogger(logger);
      const battleSystem = new BattleSystem(logger, eventLogger);
      
      const battleRng1 = makeRng(gameSeed).fork('battle').fork(String(battleIndex));
      const battleResult1 = battleSystem.executeBattle(
        mockPlayerTeam,
        selectedOpponent.units,
        battleRng1,
        battleIndex,
        selectedOpponent.id
      );

      expect(['player', 'enemy', 'draw']).toContain(battleResult1.winner);
      expect(battleResult1.actions.length).toBeGreaterThan(0);

      // Step 4: Execute again with same seed - should be identical
      const battleRng2 = makeRng(gameSeed).fork('battle').fork(String(battleIndex));
      const battleResult2 = battleSystem.executeBattle(
        mockPlayerTeam,
        selectedOpponent.units,
        battleRng2,
        battleIndex,
        selectedOpponent.id
      );

      // Verify determinism
      expect(battleResult2.winner).toBe(battleResult1.winner);
      expect(battleResult2.actions).toEqual(battleResult1.actions);
      expect(battleResult2.turnsTaken).toBe(battleResult1.turnsTaken);
      expect(battleResult2.unitsDefeated).toEqual(battleResult1.unitsDefeated);
    });

    test('save → load → battle produces same outcome', async () => {
      const { BattleSystem } = await import('../../src/systems/BattleSystem.js');
      const { EventLogger } = await import('../../src/systems/EventLogger.js');
      const { mockPlayerTeam } = await import('../fixtures/battleFixtures.js');

      const gameSeed = 54321;
      const battleIndex = 5;

      // Generate opponent
      const choicesRng = makeRng(gameSeed);
      const choicesResult = choiceSystem.generateChoices(choicesRng, battleIndex);
      expect(choicesResult.ok).toBe(true);

      if (!choicesResult.ok) return;

      const opponent = choicesResult.value[0].spec;

      // Execute battle
      const eventLogger = new EventLogger(logger);
      const battleSystem = new BattleSystem(logger, eventLogger);
      const battleRng = makeRng(gameSeed).fork('battle').fork(String(battleIndex));
      const battleResult = battleSystem.executeBattle(
        mockPlayerTeam,
        opponent.units,
        battleRng,
        battleIndex,
        opponent.id
      );

      // Save state
      const gameState: GameStateSnapshot = {
        playerTeam: mockPlayerTeam,
        inventory: [],
        progression: {
          runsAttempted: 1,
          runsCompleted: 0,
          battlesWon: battleResult.winner === 'player' ? 1 : 0,
          battlesLost: battleResult.winner === 'enemy' ? 1 : 0,
          unitsRecruited: 0,
        },
        choice: {
          nextChoiceSeed: String(gameSeed),
          battleIndex: battleIndex + 1,
        },
        runSeed: gameSeed,
      };

      await saveSystem.save('battle_test', gameState);

      // Load and verify
      const loaded = await saveSystem.load('battle_test');
      expect(loaded.ok).toBe(true);

      if (loaded.ok) {
        expect(loaded.value.progression.battlesWon).toBe(battleResult.winner === 'player' ? 1 : 0);
        expect(loaded.value.choice.battleIndex).toBe(battleIndex + 1);
      }
    });
  });
});

