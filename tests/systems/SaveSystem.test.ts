import { describe, test, expect, beforeEach } from 'vitest';
import { SaveSystem } from '../../src/systems/SaveSystem.js';
import { ConsoleLogger } from '../../src/systems/Logger.js';
import { InMemorySaveStore } from '../../src/systems/SaveStore.js';
import type { GameStateSnapshot, PlayerUnit, ProgressionCounters, SaveSliceChoice } from '../../src/types/game.js';

describe('SaveSystem', () => {
  let saveSystem: SaveSystem;
  let logger: ConsoleLogger;

  const mockState: GameStateSnapshot = {
    playerTeam: [
      {
        id: 'player1',
        name: 'Hero',
        hp: 100,
        maxHp: 100,
        atk: 20,
        def: 10,
        speed: 50,
        role: 'Tank',
        tags: ['Holy'],
        level: 1,
        experience: 0,
      },
    ] as PlayerUnit[],
    inventory: [],
    progression: {
      runsAttempted: 1,
      runsCompleted: 0,
      battlesWon: 3,
      battlesLost: 0,
      unitsRecruited: 2,
    },
    choice: {
      nextChoiceSeed: 'seed123',
      battleIndex: 3,
      lastChoices: undefined,
    },
    runSeed: 12345,
  };

  beforeEach(() => {
    logger = new ConsoleLogger('error'); // Suppress logs in tests
    saveSystem = new SaveSystem(logger, new InMemorySaveStore());
  });

  describe('Save Operations', () => {
    test('saves game state successfully', async () => {
      const result = await saveSystem.save('test_slot', mockState);

      expect(result.ok).toBe(true);
    });

    test('can save to multiple slots', async () => {
      await saveSystem.save('slot1', mockState);
      await saveSystem.save('slot2', mockState);

      const list = await saveSystem.listSlots();
      expect(list.ok).toBe(true);
      if (list.ok) {
        expect(list.value).toHaveLength(2);
      }
    });
  });

  describe('Load Operations', () => {
    test('loads saved game state', async () => {
      await saveSystem.save('test_slot', mockState);
      const result = await saveSystem.load('test_slot');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.version).toBe('v1');
        expect(result.value.playerTeam).toHaveLength(1);
        expect(result.value.runSeed).toBe(12345);
      }
    });

    test('preserves all game state fields', async () => {
      await saveSystem.save('full_test', mockState);
      const result = await saveSystem.load('full_test');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const loaded = result.value;
        
        // Player team
        expect(loaded.playerTeam).toHaveLength(1);
        expect(loaded.playerTeam[0].name).toBe('Hero');
        
        // Inventory
        expect(loaded.inventory).toEqual([]);
        
        // Progression
        expect(loaded.progression.battlesWon).toBe(3);
        expect(loaded.progression.unitsRecruited).toBe(2);
        
        // Choice state
        expect(loaded.choice.nextChoiceSeed).toBe('seed123');
        expect(loaded.choice.battleIndex).toBe(3);
        
        // Run seed
        expect(loaded.runSeed).toBe(12345);
      }
    });

    test('returns error for non-existent slot', async () => {
      const result = await saveSystem.load('nonexistent');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('not found');
      }
    });
  });

  describe('Determinism (Critical for MVP)', () => {
    test('save → load → same choice state', async () => {
      const choiceState: SaveSliceChoice = {
        nextChoiceSeed: 'deterministic_seed_999',
        battleIndex: 5,
      };

      const state: GameStateSnapshot = {
        ...mockState,
        choice: choiceState,
      };

      await saveSystem.save('determinism_test', state);
      const result = await saveSystem.load('determinism_test');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.choice.nextChoiceSeed).toBe('deterministic_seed_999');
        expect(result.value.choice.battleIndex).toBe(5);
      }
    });

    test('same seed → reproducible opponent generation after load', async () => {
      // This test verifies the critical MVP requirement:
      // Loading a save should allow reproducing the exact same opponent choices

      const choiceWithPreviews: SaveSliceChoice = {
        nextChoiceSeed: 'preview_seed_777',
        battleIndex: 10,
        lastChoices: [
          {
            spec: {
              id: 'undead_patrol_01',
              name: 'Undead Patrol',
              difficulty: 'Standard',
              units: [],
              primaryTag: 'Undead',
              counterTags: [],
              rewardHint: 'Test',
            },
            counterTags: [],
            unitSummaries: [],
          },
        ],
      };

      const stateWithPreviews: GameStateSnapshot = {
        ...mockState,
        choice: choiceWithPreviews,
      };

      await saveSystem.save('preview_test', stateWithPreviews);
      const result = await saveSystem.load('preview_test');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.choice.lastChoices).toHaveLength(1);
        expect(result.value.choice.lastChoices![0].spec.id).toBe('undead_patrol_01');
        expect(result.value.choice.nextChoiceSeed).toBe('preview_seed_777');
      }
    });
  });

  describe('Delete Operations', () => {
    test('deletes existing save slot', async () => {
      await saveSystem.save('delete_test', mockState);
      const deleteResult = await saveSystem.deleteSave('delete_test');

      expect(deleteResult.ok).toBe(true);

      const loadResult = await saveSystem.load('delete_test');
      expect(loadResult.ok).toBe(false);
    });

    test('returns error when deleting non-existent slot', async () => {
      const result = await saveSystem.deleteSave('nonexistent');

      expect(result.ok).toBe(false);
    });
  });

  describe('List Operations', () => {
    test('lists all save slots', async () => {
      await saveSystem.save('slot1', mockState);
      await saveSystem.save('slot2', mockState);

      const result = await saveSystem.listSlots();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0].slot).toBeDefined();
        expect(result.value[0].modified).toBeDefined();
        expect(result.value[0].size).toBeGreaterThan(0);
      }
    });

    test('returns empty array when no saves', async () => {
      const result = await saveSystem.listSlots();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });
  });

  describe('hasSlot Utility', () => {
    test('returns true for existing slot', async () => {
      await saveSystem.save('exists', mockState);
      const exists = await saveSystem.hasSlot('exists');

      expect(exists).toBe(true);
    });

    test('returns false for non-existent slot', async () => {
      const exists = await saveSystem.hasSlot('does_not_exist');

      expect(exists).toBe(false);
    });
  });

  describe('Version Handling', () => {
    test('saved data has version field', async () => {
      await saveSystem.save('version_test', mockState);
      const result = await saveSystem.load('version_test');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.version).toBe('v1');
      }
    });

    test('saved data has timestamp', async () => {
      await saveSystem.save('timestamp_test', mockState);
      const result = await saveSystem.load('timestamp_test');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.timestamp).toBeDefined();
        // Should be valid ISO 8601
        expect(new Date(result.value.timestamp).toISOString()).toBe(result.value.timestamp);
      }
    });
  });
});

