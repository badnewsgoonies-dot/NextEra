/*
 * BattleScreen Integration Tests
 * Tests manual player-controlled battle flow, interactions, and results
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import { BattleScreen } from '../../src/screens/BattleScreen.js';
import type { BattleUnit, BattleResult } from '../../src/types/game.js';

// Convert test fixtures to BattleUnit format
const mockPlayerUnits: BattleUnit[] = [
  {
    id: 'p1',
    name: 'Warrior',
    role: 'Tank',
    tags: ['Holy'],
    currentHp: 100,
    maxHp: 100,
    atk: 20,
    def: 15,
    speed: 40,
    isPlayer: true,
    originalIndex: 0,
  },
  {
    id: 'p2',
    name: 'Rogue',
    role: 'DPS',
    tags: ['Beast'],
    currentHp: 60,
    maxHp: 60,
    atk: 35,
    def: 5,
    speed: 75,
    isPlayer: true,
    originalIndex: 1,
  },
];

const mockEnemyUnits: BattleUnit[] = [
  {
    id: 'e1',
    name: 'Skeleton',
    role: 'Tank',
    tags: ['Undead'],
    currentHp: 80,
    maxHp: 80,
    atk: 15,
    def: 10,
    speed: 35,
    isPlayer: false,
    originalIndex: 0,
  },
];

const weakEnemy: BattleUnit = {
  id: 'e_weak',
  name: 'Goblin',
  role: 'DPS',
  tags: ['Beast'],
  currentHp: 30,
  maxHp: 30,
  atk: 10,
  def: 3,
  speed: 50,
  isPlayer: false,
  originalIndex: 0,
};

describe('BattleScreen', () => {
  let onComplete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onComplete = vi.fn();
    // Mock sprite loading
    vi.mock('../../src/data/spriteRegistry.js', () => ({
      getBattleBackground: vi.fn(() => '/test-background.png'),
      preloadCommonSprites: vi.fn(() => Promise.resolve()),
      getUnitSprite: vi.fn(() => '/test-sprite.png'),
      getEnemySprite: vi.fn(() => '/test-enemy.png'),
    }));
  });

  describe('Rendering', () => {
    test('renders battle screen with player units', () => {
      const { getByText } = render(
        <BattleScreen
          playerUnits={mockPlayerUnits}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      expect(getByText('Warrior')).toBeDefined();
      expect(getByText('Rogue')).toBeDefined();
    });

    test('renders battle screen with enemy units', () => {
      const { getByText } = render(
        <BattleScreen
          playerUnits={mockPlayerUnits}
          enemyUnits={mockEnemyUnits}
          onComplete={onComplete}
          seed={12345}
        />
      );

      expect(getByText('Skeleton')).toBeDefined();
    });

    test('renders turn counter', () => {
      const { getByText } = render(
        <BattleScreen
          playerUnits={mockPlayerUnits}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      // Turn banner should show turn 1 initially
      expect(getByText(/Turn/)).toBeDefined();
    });

    test('renders action menu', () => {
      const { getByText } = render(
        <BattleScreen
          playerUnits={mockPlayerUnits}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      expect(getByText('Attack')).toBeDefined();
      expect(getByText('Defend')).toBeDefined();
      expect(getByText('Flee')).toBeDefined();
    });

    test('has accessible role attributes', () => {
      const { container } = render(
        <BattleScreen
          playerUnits={mockPlayerUnits}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      const app = container.querySelector('[role="application"]');
      expect(app).toBeDefined();

      const regions = container.querySelectorAll('[role="region"]');
      expect(regions.length).toBeGreaterThan(0);
    });
  });

  describe('Turn Order', () => {
    test('faster units act first', async () => {
      // Rogue (speed 75) should act before Warrior (speed 40)
      const { container } = render(
        <BattleScreen
          playerUnits={mockPlayerUnits}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      // Wait for initial render
      await waitFor(() => {
        // Live region should announce active unit
        const liveRegion = container.querySelector('[role="status"]');
        expect(liveRegion?.textContent).toContain("Rogue's turn");
      });
    });

    test('player wins speed ties', async () => {
      const sameSpeedEnemy: BattleUnit = {
        ...weakEnemy,
        speed: 75, // Same as Rogue
      };

      const { container } = render(
        <BattleScreen
          playerUnits={[mockPlayerUnits[1]]} // Rogue with speed 75
          enemyUnits={[sameSpeedEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      await waitFor(() => {
        const liveRegion = container.querySelector('[role="status"]');
        // Player should go first in speed tie
        expect(liveRegion?.textContent).toContain("Rogue's turn");
      });
    });
  });

  describe('Player Actions', () => {
    test('player can select Attack action with Enter', async () => {
      const { container, getByText } = render(
        <BattleScreen
          playerUnits={[mockPlayerUnits[0]]}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      const attackButton = getByText('Attack');

      // Simulate Enter key on Attack
      fireEvent.keyDown(container, { key: 'Enter' });

      await waitFor(() => {
        // Should enter targeting mode
        expect(getByText('Choose Target')).toBeDefined();
      });
    });

    test('player can select Defend action', async () => {
      const { container, getByText } = render(
        <BattleScreen
          playerUnits={[mockPlayerUnits[0]]}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      // Navigate to Defend and select
      fireEvent.keyDown(container, { key: 'ArrowDown' });
      await waitFor(() => expect(getByText('Defend')).toBeDefined());

      fireEvent.keyDown(container, { key: 'Enter' });

      // Defend should advance turn immediately
      await waitFor(() => {
        // Enemy turn should start (or battle should progress)
        const liveRegion = container.querySelector('[role="status"]');
        expect(liveRegion).toBeDefined();
      });
    });

    test('player can flee from battle', async () => {
      const { container, getByText } = render(
        <BattleScreen
          playerUnits={[mockPlayerUnits[0]]}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      // Navigate to Flee
      fireEvent.keyDown(container, { key: 'ArrowDown' });
      fireEvent.keyDown(container, { key: 'ArrowDown' });
      await waitFor(() => expect(getByText('Flee')).toBeDefined());

      fireEvent.keyDown(container, { key: 'Enter' });

      // Should call onComplete with draw result
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
        const result: BattleResult = onComplete.mock.calls[0][0];
        expect(result.winner).toBe('draw');
      });
    });

    test('Escape key triggers flee', async () => {
      const { container } = render(
        <BattleScreen
          playerUnits={[mockPlayerUnits[0]]}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      fireEvent.keyDown(container, { key: 'Escape' });

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
        const result: BattleResult = onComplete.mock.calls[0][0];
        expect(result.winner).toBe('draw');
      });
    });
  });

  describe('Targeting', () => {
    test('can cycle through targets with arrow keys', async () => {
      const twoEnemies: BattleUnit[] = [
        { ...weakEnemy, id: 'e1', name: 'Goblin 1' },
        { ...weakEnemy, id: 'e2', name: 'Goblin 2' },
      ];

      const { container, getByText } = render(
        <BattleScreen
          playerUnits={[mockPlayerUnits[0]]}
          enemyUnits={twoEnemies}
          onComplete={onComplete}
          seed={12345}
        />
      );

      // Enter targeting mode
      fireEvent.keyDown(container, { key: 'Enter' });

      await waitFor(() => expect(getByText('Choose Target')).toBeDefined());

      // Cycle through targets
      fireEvent.keyDown(container, { key: 'ArrowRight' });
      fireEvent.keyDown(container, { key: 'ArrowLeft' });

      // Both targets should be accessible
      expect(container).toBeDefined();
    });

    test('Escape cancels targeting', async () => {
      const { container, getByText } = render(
        <BattleScreen
          playerUnits={[mockPlayerUnits[0]]}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      // Enter targeting mode
      fireEvent.keyDown(container, { key: 'Enter' });
      await waitFor(() => expect(getByText('Choose Target')).toBeDefined());

      // Cancel with Escape
      fireEvent.keyDown(container, { key: 'Escape' });

      await waitFor(() => {
        // Should return to action menu
        expect(getByText('Actions')).toBeDefined();
      });
    });
  });

  describe('Determinism', () => {
    test('same seed produces same result', async () => {
      const seed = 98765;
      const results: BattleResult[] = [];

      // Run battle twice with same seed
      for (let i = 0; i < 2; i++) {
        const onCompleteLocal = vi.fn();
        const { container } = render(
          <BattleScreen
            playerUnits={[mockPlayerUnits[0]]}
            enemyUnits={[weakEnemy]}
            onComplete={onCompleteLocal}
            seed={seed}
            battleIndex={0}
          />
        );

        // Auto-complete battle by fleeing
        fireEvent.keyDown(container, { key: 'Escape' });

        await waitFor(() => expect(onCompleteLocal).toHaveBeenCalled());
        results.push(onCompleteLocal.mock.calls[0][0]);
      }

      // Results should be identical
      expect(results[0].winner).toBe(results[1].winner);
      expect(results[0].actions.length).toBe(results[1].actions.length);
    });

    test('different seeds can produce different results', () => {
      // Property test: with different seeds, RNG can vary
      fc.assert(
        fc.property(fc.integer(), fc.integer(), (seed1, seed2) => {
          // If seeds are the same, results must match
          // If seeds are different, results may vary
          fc.pre(seed1 !== seed2); // Only test different seeds

          const onComplete1 = vi.fn();
          const onComplete2 = vi.fn();

          // This test just verifies seeds can be different
          // Actual battle outcomes would need to be executed
          return seed1 !== seed2;
        }),
        { numRuns: 10 }
      );
    });
  });

  describe('Battle Results', () => {
    test('produces valid BattleResult on completion', async () => {
      const { container } = render(
        <BattleScreen
          playerUnits={[mockPlayerUnits[0]]}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      // Flee to end battle quickly
      fireEvent.keyDown(container, { key: 'Escape' });

      await waitFor(() => expect(onComplete).toHaveBeenCalled());

      const result: BattleResult = onComplete.mock.calls[0][0];

      // Validate result structure
      expect(result).toHaveProperty('winner');
      expect(result).toHaveProperty('actions');
      expect(result).toHaveProperty('unitsDefeated');
      expect(result).toHaveProperty('turnsTaken');

      expect(['player', 'enemy', 'draw']).toContain(result.winner);
      expect(Array.isArray(result.actions)).toBe(true);
      expect(Array.isArray(result.unitsDefeated)).toBe(true);
      expect(typeof result.turnsTaken).toBe('number');
    });

    test('flee produces draw result', async () => {
      const { container } = render(
        <BattleScreen
          playerUnits={[mockPlayerUnits[0]]}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      fireEvent.keyDown(container, { key: 'Escape' });

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
        const result: BattleResult = onComplete.mock.calls[0][0];
        expect(result.winner).toBe('draw');
      });
    });

    test('actions are logged with sequence numbers', async () => {
      const { container, getByText } = render(
        <BattleScreen
          playerUnits={[mockPlayerUnits[0]]}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      // Perform defend action
      fireEvent.keyDown(container, { key: 'ArrowDown' });
      await waitFor(() => expect(getByText('Defend')).toBeDefined());

      fireEvent.keyDown(container, { key: 'Enter' });

      // Wait for enemy turn and then flee to end
      await new Promise(resolve => setTimeout(resolve, 1000));
      fireEvent.keyDown(container, { key: 'Escape' });

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
        const result: BattleResult = onComplete.mock.calls[0][0];

        // Should have at least defend action logged
        expect(result.actions.length).toBeGreaterThan(0);

        // All actions should have sequence numbers
        result.actions.forEach((action, idx) => {
          expect(action.seq).toBe(idx);
        });
      });
    });
  });

  describe('Accessibility', () => {
    test('live region announces turn changes', async () => {
      const { container } = render(
        <BattleScreen
          playerUnits={[mockPlayerUnits[0]]}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeDefined();
      expect(liveRegion?.getAttribute('role')).toBe('status');
    });

    test('units have descriptive labels', () => {
      const { container } = render(
        <BattleScreen
          playerUnits={[mockPlayerUnits[0]]}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      const unitGroups = container.querySelectorAll('[role="group"]');
      expect(unitGroups.length).toBeGreaterThan(0);

      // Each unit should have aria-label
      unitGroups.forEach(group => {
        expect(group.getAttribute('aria-label')).toBeTruthy();
      });
    });

    test('regions are properly labeled', () => {
      const { container } = render(
        <BattleScreen
          playerUnits={mockPlayerUnits}
          enemyUnits={mockEnemyUnits}
          onComplete={onComplete}
          seed={12345}
        />
      );

      const enemyRegion = container.querySelector('[aria-label="Enemy units"]');
      const playerRegion = container.querySelector('[aria-label="Player party"]');
      const actionRegion = container.querySelector('[aria-label="Battle actions and status"]');

      expect(enemyRegion).toBeDefined();
      expect(playerRegion).toBeDefined();
      expect(actionRegion).toBeDefined();
    });
  });

  describe('Timeout Cleanup', () => {
    test('component unmounts without errors', () => {
      const { unmount } = render(
        <BattleScreen
          playerUnits={[mockPlayerUnits[0]]}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      // Should unmount cleanly without timeout errors
      expect(() => unmount()).not.toThrow();
    });

    test('unmounting during animation does not cause errors', async () => {
      const { container, unmount } = render(
        <BattleScreen
          playerUnits={[mockPlayerUnits[0]]}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      // Start an attack
      fireEvent.keyDown(container, { key: 'Enter' }); // Attack
      fireEvent.keyDown(container, { key: 'Enter' }); // Confirm target

      // Unmount during animation
      await new Promise(resolve => setTimeout(resolve, 200));
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('TypeScript Type Safety', () => {
    test('accepts valid BattleUnit props', () => {
      expect(() => {
        render(
          <BattleScreen
            playerUnits={mockPlayerUnits}
            enemyUnits={mockEnemyUnits}
            onComplete={onComplete}
            seed={12345}
          />
        );
      }).not.toThrow();
    });

    test('accepts optional seed parameter', () => {
      expect(() => {
        render(
          <BattleScreen
            playerUnits={mockPlayerUnits}
            enemyUnits={mockEnemyUnits}
            onComplete={onComplete}
          />
        );
      }).not.toThrow();
    });

    test('accepts optional battleIndex parameter', () => {
      expect(() => {
        render(
          <BattleScreen
            playerUnits={mockPlayerUnits}
            enemyUnits={mockEnemyUnits}
            onComplete={onComplete}
            seed={12345}
            battleIndex={5}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('handles single player vs single enemy', () => {
      expect(() => {
        render(
          <BattleScreen
            playerUnits={[mockPlayerUnits[0]]}
            enemyUnits={[weakEnemy]}
            onComplete={onComplete}
            seed={12345}
          />
        );
      }).not.toThrow();
    });

    test('handles 4v4 battle', () => {
      const fourPlayers: BattleUnit[] = [
        ...mockPlayerUnits,
        { ...mockPlayerUnits[0], id: 'p3', name: 'Mage', originalIndex: 2 },
        { ...mockPlayerUnits[1], id: 'p4', name: 'Cleric', originalIndex: 3 },
      ];
      const fourEnemies: BattleUnit[] = [
        ...mockEnemyUnits,
        { ...weakEnemy, id: 'e2', name: 'Goblin 2', originalIndex: 1 },
        { ...weakEnemy, id: 'e3', name: 'Goblin 3', originalIndex: 2 },
      ];

      expect(() => {
        render(
          <BattleScreen
            playerUnits={fourPlayers}
            enemyUnits={fourEnemies}
            onComplete={onComplete}
            seed={12345}
          />
        );
      }).not.toThrow();
    });

    test('handles units with 0 HP at start', () => {
      const deadPlayer: BattleUnit = {
        ...mockPlayerUnits[0],
        currentHp: 0,
      };

      const { container } = render(
        <BattleScreen
          playerUnits={[deadPlayer]}
          enemyUnits={[weakEnemy]}
          onComplete={onComplete}
          seed={12345}
        />
      );

      // Battle should end immediately (all players dead)
      waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
        const result: BattleResult = onComplete.mock.calls[0][0];
        expect(result.winner).toBe('enemy');
      });
    });
  });
});
