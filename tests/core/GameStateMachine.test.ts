import { describe, test, expect, beforeEach } from 'vitest';
import { GameStateMachine } from '../../src/core/GameStateMachine.js';
import type { GameState } from '../../src/types/game.js';

describe('GameStateMachine', () => {
  let fsm: GameStateMachine;

  beforeEach(() => {
    fsm = new GameStateMachine();
  });

  describe('Initialization', () => {
    test('starts in menu state', () => {
      expect(fsm.getState()).toBe('menu');
    });

    test('history is empty initially', () => {
      expect(fsm.getHistory()).toEqual([]);
    });
  });

  describe('Valid Transitions', () => {
    test('menu → starter_select', () => {
      const result = fsm.transitionTo('starter_select');
      expect(result.ok).toBe(true);
      expect(fsm.getState()).toBe('starter_select');
    });

    test('complete happy path: menu → starter → opponent → team → battle → rewards → recruit → opponent (loop)', () => {
      const states: GameState[] = ['starter_select', 'opponent_select', 'team_prep', 'battle', 'rewards', 'recruit', 'opponent_select'];
      
      for (const state of states) {
        const result = fsm.transitionTo(state);
        expect(result.ok).toBe(true);
        expect(fsm.getState()).toBe(state);
      }
    });

    test('defeat flow: battle → defeat → menu', () => {
      // Navigate to battle
      fsm.transitionTo('starter_select');
      fsm.transitionTo('opponent_select');
      fsm.transitionTo('team_prep');
      fsm.transitionTo('battle');

      // Lose battle
      const defeatResult = fsm.transitionTo('defeat');
      expect(defeatResult.ok).toBe(true);
      expect(fsm.getState()).toBe('defeat');

      // Return to menu (Decision #5: permadeath)
      const menuResult = fsm.transitionTo('menu');
      expect(menuResult.ok).toBe(true);
      expect(fsm.getState()).toBe('menu');
    });

    test('win flow: battle → rewards → recruit → opponent_select', () => {
      // Navigate to battle
      fsm.transitionTo('starter_select');
      fsm.transitionTo('opponent_select');
      fsm.transitionTo('team_prep');
      fsm.transitionTo('battle');

      // Win battle
      expect(fsm.transitionTo('rewards').ok).toBe(true);
      expect(fsm.transitionTo('recruit').ok).toBe(true);
      expect(fsm.transitionTo('opponent_select').ok).toBe(true);
      expect(fsm.getState()).toBe('opponent_select');
    });
  });

  describe('Invalid Transitions', () => {
    test('menu → battle (skip required states)', () => {
      const result = fsm.transitionTo('battle');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('Invalid transition');
        expect(result.error).toContain('menu -> battle');
      }
      expect(fsm.getState()).toBe('menu'); // State unchanged
    });

    test('opponent_select → battle (skip team_prep)', () => {
      fsm.transitionTo('starter_select');
      fsm.transitionTo('opponent_select');
      
      const result = fsm.transitionTo('battle');
      expect(result.ok).toBe(false);
      expect(fsm.getState()).toBe('opponent_select'); // State unchanged
    });

    test('rewards → opponent_select (skip recruit)', () => {
      // Navigate to rewards
      fsm.transitionTo('starter_select');
      fsm.transitionTo('opponent_select');
      fsm.transitionTo('team_prep');
      fsm.transitionTo('battle');
      fsm.transitionTo('rewards');

      const result = fsm.transitionTo('opponent_select');
      expect(result.ok).toBe(false);
      expect(fsm.getState()).toBe('rewards'); // State unchanged
    });

    test('defeat → opponent_select (must return to menu first)', () => {
      // Navigate to defeat
      fsm.transitionTo('starter_select');
      fsm.transitionTo('opponent_select');
      fsm.transitionTo('team_prep');
      fsm.transitionTo('battle');
      fsm.transitionTo('defeat');

      const result = fsm.transitionTo('opponent_select');
      expect(result.ok).toBe(false);
      expect(fsm.getState()).toBe('defeat');
    });
  });

  describe('History Tracking', () => {
    test('tracks state history', () => {
      fsm.transitionTo('starter_select');
      fsm.transitionTo('opponent_select');
      fsm.transitionTo('team_prep');

      const history = fsm.getHistory();
      expect(history).toEqual(['menu', 'starter_select', 'opponent_select']);
    });

    test('getPreviousState returns last state', () => {
      fsm.transitionTo('starter_select');
      fsm.transitionTo('opponent_select');

      expect(fsm.getPreviousState()).toBe('starter_select');
    });

    test('getPreviousState returns null if no history', () => {
      expect(fsm.getPreviousState()).toBe(null);
    });
  });

  describe('Reset', () => {
    test('reset returns to menu and clears history', () => {
      fsm.transitionTo('starter_select');
      fsm.transitionTo('opponent_select');
      
      fsm.reset();

      expect(fsm.getState()).toBe('menu');
      expect(fsm.getHistory()).toEqual([]);
      expect(fsm.getPreviousState()).toBe(null);
    });
  });

  describe('Serialization', () => {
    test('serialize and deserialize preserves state', () => {
      fsm.transitionTo('starter_select');
      fsm.transitionTo('opponent_select');
      fsm.transitionTo('team_prep');

      const serialized = fsm.serialize();
      
      const newFsm = new GameStateMachine();
      const result = newFsm.deserialize(serialized);

      expect(result.ok).toBe(true);
      expect(newFsm.getState()).toBe('team_prep');
      expect(newFsm.getHistory()).toEqual(['menu', 'starter_select', 'opponent_select']);
    });

    test('deserialize rejects invalid state', () => {
      const invalidJson = JSON.stringify({ current: 'invalid_state', history: [] });
      
      const result = fsm.deserialize(invalidJson);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('Invalid state');
      }
    });

    test('deserialize rejects malformed JSON', () => {
      const result = fsm.deserialize('not valid json');
      expect(result.ok).toBe(false);
    });
  });

  describe('canTransitionTo', () => {
    test('returns true for valid transition', () => {
      expect(fsm.canTransitionTo('starter_select')).toBe(true);
    });

    test('returns false for invalid transition', () => {
      expect(fsm.canTransitionTo('battle')).toBe(false);
    });

    test('updates after state change', () => {
      expect(fsm.canTransitionTo('battle')).toBe(false);
      
      fsm.transitionTo('starter_select');
      fsm.transitionTo('opponent_select');
      fsm.transitionTo('team_prep');
      
      expect(fsm.canTransitionTo('battle')).toBe(true);
    });
  });
});

