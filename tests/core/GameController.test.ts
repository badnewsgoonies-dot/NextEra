/*
 * GameController Tests
 * Tests the main game orchestrator and full game loop
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { GameController } from '../../src/core/GameController.js';
import { ConsoleLogger } from '../../src/systems/Logger.js';
import { SaveSystem } from '../../src/systems/SaveSystem.js';
import { InMemorySaveStore } from '../../src/systems/SaveStore.js';
import { mockPlayerTeam } from '../fixtures/battleFixtures.js';

describe('GameController', () => {
  let controller: GameController;
  let logger: ConsoleLogger;
  let sharedSaveStore: InMemorySaveStore;
  let sharedSaveSystem: SaveSystem;

  beforeEach(() => {
    logger = new ConsoleLogger('error');
    sharedSaveStore = new InMemorySaveStore();
    sharedSaveSystem = new SaveSystem(logger, sharedSaveStore);
    controller = new GameController(logger, sharedSaveSystem);
  });

  describe('Run Management', () => {
    test('startRun initializes game state', () => {
      const result = controller.startRun(mockPlayerTeam);

      expect(result.ok).toBe(true);
      
      const state = controller.getState();
      expect(state.playerTeam).toHaveLength(2);
      expect(state.battleIndex).toBe(0);
      expect(state.runSeed).toBeGreaterThan(0);
    });

    test('startRun with custom seed uses provided seed', () => {
      const customSeed = 99999;
      const result = controller.startRun(mockPlayerTeam, customSeed);

      expect(result.ok).toBe(true);
      
      const state = controller.getState();
      expect(state.runSeed).toBe(customSeed);
    });

    test('startRun increments runsAttempted', () => {
      const initialAttempts = controller.getState().progression.runsAttempted;
      
      controller.startRun(mockPlayerTeam);
      
      const newAttempts = controller.getState().progression.runsAttempted;
      expect(newAttempts).toBe(initialAttempts + 1);
    });

    test('startRun transitions to opponent_select', () => {
      controller.startRun(mockPlayerTeam);

      expect(controller.getCurrentState()).toBe('opponent_select');
    });
  });

  describe('Opponent Selection Flow', () => {
    beforeEach(() => {
      controller.startRun(mockPlayerTeam, 12345);
    });

    test('generateOpponentChoices returns 3 previews', () => {
      const result = controller.generateOpponentChoices();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(3);
      }
    });

    test('generateOpponentChoices is deterministic with same seed', () => {
      const controller1 = new GameController(logger, sharedSaveSystem);
      controller1.startRun(mockPlayerTeam, 55555);
      const result1 = controller1.generateOpponentChoices();

      const controller2 = new GameController(logger, sharedSaveSystem);
      controller2.startRun(mockPlayerTeam, 55555);
      const result2 = controller2.generateOpponentChoices();

      expect(result1.ok).toBe(true);
      expect(result2.ok).toBe(true);

      if (result1.ok && result2.ok) {
        const ids1 = result1.value.map(p => p.spec.id);
        const ids2 = result2.value.map(p => p.spec.id);
        expect(ids1).toEqual(ids2);
      }
    });

    test('selectOpponent stores selection', () => {
      const choicesResult = controller.generateOpponentChoices();
      expect(choicesResult.ok).toBe(true);

      if (choicesResult.ok) {
        const firstOpponentId = choicesResult.value[0].spec.id;
        const selectResult = controller.selectOpponent(firstOpponentId);

        expect(selectResult.ok).toBe(true);
        
        const state = controller.getState();
        expect(state.selectedOpponentId).toBe(firstOpponentId);
      }
    });

    test('selectOpponent transitions to team_prep', () => {
      const choicesResult = controller.generateOpponentChoices();
      if (!choicesResult.ok) return;

      controller.selectOpponent(choicesResult.value[0].spec.id);

      expect(controller.getCurrentState()).toBe('team_prep');
    });

    test('selectOpponent rejects invalid opponent ID', () => {
      controller.generateOpponentChoices();

      const result = controller.selectOpponent('invalid_id');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('not found');
      }
    });
  });

  describe.skip('Battle Flow (deprecated - auto-battle removed)', () => {
    // These tests used executeBattle() which is now deprecated
    // Manual battle testing happens in BattleScreen integration tests
    beforeEach(() => {
      controller.startRun(mockPlayerTeam, 77777);
      const choices = controller.generateOpponentChoices();
      if (choices.ok) {
        controller.selectOpponent(choices.value[0].spec.id);
      }
    });

    test('startBattle transitions to battle state', () => {
      const result = controller.startBattle();

      expect(result.ok).toBe(true);
      expect(controller.getCurrentState()).toBe('battle');
    });

    test.skip('executeBattle is deprecated - manual battle in BattleScreen.tsx', () => {
      // This test is skipped because executeBattle() is deprecated
      // Battle execution now happens in the manual BattleScreen component
      // Integration tests verify the full manual battle flow
    });

    test('executeBattle updates progression on player victory', () => {
      controller.startBattle();
      
      const initialWins = controller.getState().progression.battlesWon;
      const result = controller.executeBattle();

      if (result.ok && result.value.winner === 'player') {
        const newWins = controller.getState().progression.battlesWon;
        expect(newWins).toBe(initialWins + 1);
      }
    });

    test('executeBattle transitions to rewards on player win', () => {
      controller.startBattle();
      
      const result = controller.executeBattle();

      if (result.ok && result.value.winner === 'player') {
        expect(controller.getCurrentState()).toBe('rewards');
      }
    });

    test('executeBattle transitions to defeat on enemy win', () => {
      controller.startBattle();
      
      const result = controller.executeBattle();

      if (result.ok && result.value.winner === 'enemy') {
        expect(controller.getCurrentState()).toBe('defeat');
      }
    });

    test('executeBattle transitions to menu on draw', () => {
      controller.startBattle();
      
      const result = controller.executeBattle();

      if (result.ok && result.value.winner === 'draw') {
        expect(controller.getCurrentState()).toBe('menu');
      }
    });

    test('battle is deterministic with same seed', () => {
      const seed = 33333;

      // First run
      const controller1 = new GameController(logger, sharedSaveSystem);
      controller1.startRun(mockPlayerTeam, seed);
      const choices1 = controller1.generateOpponentChoices();
      if (choices1.ok) {
        controller1.selectOpponent(choices1.value[0].spec.id);
        controller1.startBattle();
        const battle1 = controller1.executeBattle();

        // Second run with same seed
        const controller2 = new GameController(logger, sharedSaveSystem);
        controller2.startRun(mockPlayerTeam, seed);
        const choices2 = controller2.generateOpponentChoices();
        if (choices2.ok) {
          controller2.selectOpponent(choices2.value[0].spec.id);
          controller2.startBattle();
          const battle2 = controller2.executeBattle();

          // Results should be identical
          expect(battle1.ok && battle2.ok).toBe(true);
          if (battle1.ok && battle2.ok) {
            expect(battle2.value.winner).toBe(battle1.value.winner);
            expect(battle2.value.actions).toEqual(battle1.value.actions);
            expect(battle2.value.turnsTaken).toBe(battle1.value.turnsTaken);
          }
        }
      }
    });
  });

  describe('Save and Load', () => {
    test('saveGame preserves game state', async () => {
      controller.startRun(mockPlayerTeam, 88888);
      controller.generateOpponentChoices();

      const saveResult = await controller.saveGame('test_slot');

      expect(saveResult.ok).toBe(true);
    });

    test('loadGame restores game state', async () => {
      const seed = 66666;
      controller.startRun(mockPlayerTeam, seed);
      const choices = controller.generateOpponentChoices();
      
      await controller.saveGame('restore_test');

      // Create new controller with same save system and load
      const newController = new GameController(logger, sharedSaveSystem);
      const loadResult = await newController.loadGame('restore_test');

      expect(loadResult.ok).toBe(true);
      
      const loadedState = newController.getState();
      expect(loadedState.runSeed).toBe(seed);
      expect(loadedState.playerTeam).toHaveLength(2);
      expect(loadedState.battleIndex).toBe(0);
    });

    test('save → load → generate produces same opponents', async () => {
      const seed = 44444;
      controller.startRun(mockPlayerTeam, seed);
      const choices1 = controller.generateOpponentChoices();

      await controller.saveGame('determinism_test');

      // Load in new controller with same save system
      const newController = new GameController(logger, sharedSaveSystem);
      await newController.loadGame('determinism_test');
      const choices2 = newController.generateOpponentChoices();

      expect(choices1.ok && choices2.ok).toBe(true);
      if (choices1.ok && choices2.ok) {
        const ids1 = choices1.value.map(p => p.spec.id);
        const ids2 = choices2.value.map(p => p.spec.id);
        expect(ids2).toEqual(ids1);
      }
    });
  });

  describe('Multi-Battle Loop', () => {
    test('complete loop: choose → battle → advance → choose again', () => {
      controller.startRun(mockPlayerTeam, 11111);

      // Battle 1
      const choices1 = controller.generateOpponentChoices();
      expect(choices1.ok).toBe(true);

      if (choices1.ok) {
        controller.selectOpponent(choices1.value[0].spec.id);
        controller.startBattle();
        const battle1 = controller.executeBattle();

        if (battle1.ok && battle1.value.winner === 'player') {
          // Assume we're now in rewards state
          expect(controller.getCurrentState()).toBe('rewards');
          
          // Manual transition to recruit (rewards screen would do this)
          controller.getStateMachine().transitionTo('recruit');
          
          // Advance to next battle
          const advanceResult = controller.advanceToNextBattle();
          expect(advanceResult.ok).toBe(true);
          expect(controller.getCurrentState()).toBe('opponent_select');
          expect(controller.getState().battleIndex).toBe(1);

          // Battle 2
          const choices2 = controller.generateOpponentChoices();
          expect(choices2.ok).toBe(true);
        }
      }
    });
  });

  describe('State Machine Integration', () => {
    test('enforces valid state transitions', () => {
      controller.startRun(mockPlayerTeam);

      // Can't start battle without selecting opponent
      const invalidBattle = controller.startBattle();
      expect(invalidBattle.ok).toBe(false);
    });

    test('prevents executing battle before startBattle', () => {
      controller.startRun(mockPlayerTeam);
      const choices = controller.generateOpponentChoices();
      if (choices.ok) {
        controller.selectOpponent(choices.value[0].spec.id);
        
        // Try to execute without calling startBattle()
        const result = controller.executeBattle();
        expect(result.ok).toBe(false);
      }
    });

    test('state machine history tracks transitions', () => {
      controller.startRun(mockPlayerTeam);
      
      const history = controller.getStateMachine().getHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0]).toBe('menu');
    });
  });
});

