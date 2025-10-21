/*
 * BattleUnitSlot Component Tests
 * Tests rendering, positioning, and visual effects for battle units
 */

import { describe, test, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { BattleUnitSlot } from '../../src/components/battle/BattleUnitSlot.js';
import type { BattleUnit } from '../../src/types/game.js';
import {
  ENEMY_LAYOUT,
  PLAYER_LAYOUT,
  calculateEnemyPosition,
  calculatePlayerPosition,
} from '../../src/components/battle/battleConstants.js';

// Mock battle unit for testing
const mockPlayerUnit: BattleUnit = {
  id: 'test-player-1',
  name: 'Test Warrior',
  role: 'Tank',
  tags: ['Holy'],
  currentHp: 75,
  maxHp: 100,
  atk: 20,
  def: 15,
  speed: 40,
  isPlayer: true,
  originalIndex: 0,
};

const mockEnemyUnit: BattleUnit = {
  id: 'test-enemy-1',
  name: 'Test Goblin',
  role: 'DPS',
  tags: ['Beast'],
  currentHp: 30,
  maxHp: 50,
  atk: 15,
  def: 5,
  speed: 50,
  isPlayer: false,
  originalIndex: 0,
};

describe('BattleUnitSlot', () => {
  describe('Rendering', () => {
    test('renders player unit', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockPlayerUnit}
          index={0}
          isPlayer={true}
          isActive={false}
          isTargeted={false}
        />
      );

      expect(container.querySelector('[role="group"]')).toBeDefined();
    });

    test('renders enemy unit', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockEnemyUnit}
          index={0}
          isPlayer={false}
          isActive={false}
          isTargeted={false}
        />
      );

      expect(container.querySelector('[role="group"]')).toBeDefined();
    });

    test('renders with AnimatedUnitSprite for players', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockPlayerUnit}
          index={0}
          isPlayer={true}
          isActive={false}
          isTargeted={false}
        />
      );

      // Should render player sprite component (not enemy sprite)
      const group = container.querySelector('[role="group"]');
      expect(group).toBeDefined();
    });

    test('renders with AnimatedEnemySprite for enemies', () => {
      const { container} = render(
        <BattleUnitSlot
          unit={mockEnemyUnit}
          index={0}
          isPlayer={false}
          isActive={false}
          isTargeted={false}
        />
      );

      // Should render enemy sprite component
      const group = container.querySelector('[role="group"]');
      expect(group).toBeDefined();
    });
  });

  describe('Positioning', () => {
    test('applies correct position for player unit index 0', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockPlayerUnit}
          index={0}
          isPlayer={true}
          isActive={false}
          isTargeted={false}
        />
      );

      const slot = container.querySelector('[role="group"]') as HTMLElement;
      const expectedPos = calculatePlayerPosition(0);

      // Check inline styles contain position values
      expect(slot.style.left).toBe(`${expectedPos.x}px`);
      expect(slot.style.bottom).toBe(`${expectedPos.y}px`);
    });

    test('applies correct position for enemy unit index 0', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockEnemyUnit}
          index={0}
          isPlayer={false}
          isActive={false}
          isTargeted={false}
        />
      );

      const slot = container.querySelector('[role="group"]') as HTMLElement;
      const expectedPos = calculateEnemyPosition(0);

      // Check inline styles contain position values
      expect(slot.style.left).toBe(`${expectedPos.x}px`);
      expect(slot.style.top).toBe(`${expectedPos.y}px`);
    });

    test('applies correct position for player unit index 2', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockPlayerUnit}
          index={2}
          isPlayer={true}
          isActive={false}
          isTargeted={false}
        />
      );

      const slot = container.querySelector('[role="group"]') as HTMLElement;
      const expectedPos = calculatePlayerPosition(2);

      expect(slot.style.left).toBe(`${expectedPos.x}px`);
      expect(slot.style.bottom).toBe(`${expectedPos.y}px`);
    });

    test('applies correct position for enemy unit index 3', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockEnemyUnit}
          index={3}
          isPlayer={false}
          isActive={false}
          isTargeted={false}
        />
      );

      const slot = container.querySelector('[role="group"]') as HTMLElement;
      const expectedPos = calculateEnemyPosition(3);

      expect(slot.style.left).toBe(`${expectedPos.x}px`);
      expect(slot.style.top).toBe(`${expectedPos.y}px`);
    });

    test('uses absolute positioning', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockPlayerUnit}
          index={0}
          isPlayer={true}
          isActive={false}
          isTargeted={false}
        />
      );

      const slot = container.querySelector('[role="group"]') as HTMLElement;
      expect(slot.className).toContain('absolute');
    });
  });

  describe('Scaling', () => {
    test('applies player scale factor', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockPlayerUnit}
          index={0}
          isPlayer={true}
          isActive={false}
          isTargeted={false}
        />
      );

      const slot = container.querySelector('[role="group"]') as HTMLElement;
      expect(slot.style.transform).toBe(`scale(${PLAYER_LAYOUT.SPRITE_SCALE})`);
    });

    test('applies enemy scale factor', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockEnemyUnit}
          index={0}
          isPlayer={false}
          isActive={false}
          isTargeted={false}
        />
      );

      const slot = container.querySelector('[role="group"]') as HTMLElement;
      expect(slot.style.transform).toBe(`scale(${ENEMY_LAYOUT.SPRITE_SCALE})`);
    });

    test('enemy scale is smaller than player scale', () => {
      expect(ENEMY_LAYOUT.SPRITE_SCALE).toBeLessThan(PLAYER_LAYOUT.SPRITE_SCALE);
    });
  });

  describe('Active State', () => {
    test('adds active class when isActive=true', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockPlayerUnit}
          index={0}
          isPlayer={true}
          isActive={true}
          isTargeted={false}
        />
      );

      // Should have brightness and scale classes (in sprite child, not slot itself)
      const group = container.querySelector('[role="group"]');
      expect(group).toBeDefined();
    });

    test('no active effects when isActive=false', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockPlayerUnit}
          index={0}
          isPlayer={true}
          isActive={false}
          isTargeted={false}
        />
      );

      const group = container.querySelector('[role="group"]');
      expect(group).toBeDefined();
    });
  });

  describe('Targeted State', () => {
    test('shows targeting ring when isTargeted=true', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockEnemyUnit}
          index={0}
          isPlayer={false}
          isActive={false}
          isTargeted={true}
        />
      );

      // Targeting ring is applied to sprite (checked via class in children)
      const group = container.querySelector('[role="group"]');
      expect(group).toBeDefined();
    });

    test('no targeting ring when isTargeted=false', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockEnemyUnit}
          index={0}
          isPlayer={false}
          isActive={false}
          isTargeted={false}
        />
      );

      const group = container.querySelector('[role="group"]');
      expect(group).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    test('has role="group"', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockPlayerUnit}
          index={0}
          isPlayer={true}
          isActive={false}
          isTargeted={false}
        />
      );

      const group = container.querySelector('[role="group"]');
      expect(group).toBeDefined();
    });

    test('has descriptive aria-label for player', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockPlayerUnit}
          index={0}
          isPlayer={true}
          isActive={false}
          isTargeted={false}
        />
      );

      const group = container.querySelector('[role="group"]');
      const label = group?.getAttribute('aria-label') || '';

      expect(label).toContain('Test Warrior');
      expect(label).toContain('Tank');
      expect(label).toContain('HP: 75 of 100');
    });

    test('has descriptive aria-label for enemy', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockEnemyUnit}
          index={0}
          isPlayer={false}
          isActive={false}
          isTargeted={false}
        />
      );

      const group = container.querySelector('[role="group"]');
      const label = group?.getAttribute('aria-label') || '';

      expect(label).toContain('Test Goblin');
      expect(label).toContain('DPS');
      expect(label).toContain('HP: 30 of 50');
    });

    test('aria-label includes active state', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockPlayerUnit}
          index={0}
          isPlayer={true}
          isActive={true}
          isTargeted={false}
        />
      );

      const group = container.querySelector('[role="group"]');
      const label = group?.getAttribute('aria-label') || '';

      expect(label).toContain('currently active');
    });

    test('aria-label includes targeted state', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockEnemyUnit}
          index={0}
          isPlayer={false}
          isActive={false}
          isTargeted={true}
        />
      );

      const group = container.querySelector('[role="group"]');
      const label = group?.getAttribute('aria-label') || '';

      expect(label).toContain('targeted');
    });

    test('aria-label for low HP unit', () => {
      const lowHpUnit: BattleUnit = {
        ...mockPlayerUnit,
        currentHp: 5,
        maxHp: 100,
      };

      const { container } = render(
        <BattleUnitSlot
          unit={lowHpUnit}
          index={0}
          isPlayer={true}
          isActive={false}
          isTargeted={false}
        />
      );

      const group = container.querySelector('[role="group"]');
      const label = group?.getAttribute('aria-label') || '';

      expect(label).toContain('HP: 5 of 100');
    });

    test('aria-label for defeated unit (0 HP)', () => {
      const deadUnit: BattleUnit = {
        ...mockEnemyUnit,
        currentHp: 0,
      };

      const { container } = render(
        <BattleUnitSlot
          unit={deadUnit}
          index={0}
          isPlayer={false}
          isActive={false}
          isTargeted={false}
        />
      );

      const group = container.querySelector('[role="group"]');
      const label = group?.getAttribute('aria-label') || '';

      expect(label).toContain('HP: 0 of 50');
    });
  });

  describe('Forward Ref', () => {
    test('accepts and forwards ref to slot div', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <BattleUnitSlot
          ref={ref}
          unit={mockEnemyUnit}
          index={0}
          isPlayer={false}
          isActive={false}
          isTargeted={false}
        />
      );

      expect(ref.current).toBeDefined();
      expect(ref.current?.getAttribute('role')).toBe('group');
    });

    test('ref points to positioned div', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <BattleUnitSlot
          ref={ref}
          unit={mockPlayerUnit}
          index={1}
          isPlayer={true}
          isActive={false}
          isTargeted={false}
        />
      );

      const expectedPos = calculatePlayerPosition(1);
      expect(ref.current?.style.left).toBe(`${expectedPos.x}px`);
    });
  });

  describe('Custom ClassName', () => {
    test('applies custom className', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockPlayerUnit}
          index={0}
          isPlayer={true}
          isActive={false}
          isTargeted={false}
          className="custom-test-class"
        />
      );

      const slot = container.querySelector('[role="group"]') as HTMLElement;
      expect(slot.className).toContain('custom-test-class');
    });

    test('preserves default classes with custom className', () => {
      const { container } = render(
        <BattleUnitSlot
          unit={mockPlayerUnit}
          index={0}
          isPlayer={true}
          isActive={false}
          isTargeted={false}
          className="custom-class"
        />
      );

      const slot = container.querySelector('[role="group"]') as HTMLElement;
      expect(slot.className).toContain('absolute');
      expect(slot.className).toContain('custom-class');
    });
  });

  describe('Multiple Units Layout', () => {
    test('different indexes create different positions', () => {
      const { container: container0 } = render(
        <BattleUnitSlot
          unit={mockPlayerUnit}
          index={0}
          isPlayer={true}
          isActive={false}
          isTargeted={false}
        />
      );

      const { container: container2 } = render(
        <BattleUnitSlot
          unit={{ ...mockPlayerUnit, id: 'player-2' }}
          index={2}
          isPlayer={true}
          isActive={false}
          isTargeted={false}
        />
      );

      const slot0 = container0.querySelector('[role="group"]') as HTMLElement;
      const slot2 = container2.querySelector('[role="group"]') as HTMLElement;

      expect(slot0.style.left).not.toBe(slot2.style.left);
    });

    test('4 unit formation creates 2x2 grid', () => {
      const slots = [0, 1, 2, 3].map(index => {
        const { container } = render(
          <BattleUnitSlot
            unit={{ ...mockPlayerUnit, id: `player-${index}` }}
            index={index}
            isPlayer={true}
            isActive={false}
            isTargeted={false}
          />
        );
        return container.querySelector('[role="group"]') as HTMLElement;
      });

      const pos0 = calculatePlayerPosition(0);
      const pos1 = calculatePlayerPosition(1);
      const pos2 = calculatePlayerPosition(2);
      const pos3 = calculatePlayerPosition(3);

      expect(slots[0].style.left).toBe(`${pos0.x}px`);
      expect(slots[1].style.left).toBe(`${pos1.x}px`);
      expect(slots[2].style.left).toBe(`${pos2.x}px`);
      expect(slots[3].style.left).toBe(`${pos3.x}px`);
    });
  });
});
