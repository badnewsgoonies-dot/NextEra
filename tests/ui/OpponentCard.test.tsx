/*
 * OpponentCard Component Tests
 * Tests keyboard navigation, accessibility, and interaction
 */

import { describe, test, expect, vi } from 'vitest';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { OpponentCard } from '../../src/components/OpponentCard.js';
import type { OpponentPreview } from '../../src/types/game.js';

const mockPreview: OpponentPreview = {
  spec: {
    id: 'test_opponent_01',
    name: 'Test Opponent',
    difficulty: 'Normal',
    units: [
      { id: 'u1', name: 'Test Unit 1', role: 'Tank', tags: ['Undead'], baseStats: { hp: 100, atk: 20, def: 15, speed: 40 } },
      { id: 'u2', name: 'Test Unit 2', role: 'DPS', tags: ['Mech'], baseStats: { hp: 60, atk: 30, def: 5, speed: 60 } },
    ],
    primaryTag: 'Undead',
    counterTags: ['Holy', 'Beast'],
    specialRule: 'Test special rule',
    rewardHint: 'Test Rewards',
  },
  threatScore: undefined,
  counterTags: ['Holy', 'Beast'],
  unitSummaries: [
    { name: 'Test Unit 1', role: 'Tank' },
    { name: 'Test Unit 2', role: 'DPS' },
  ],
};

describe('OpponentCard', () => {
  describe('Rendering', () => {
    test('renders opponent name', () => {
      const { getByText } = render(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={false}
          expanded={false}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={-1}
        />
      );

      expect(getByText('Test Opponent')).toBeDefined();
    });

    test('renders difficulty dots', () => {
      const { container } = render(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={false}
          expanded={false}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={-1}
        />
      );

      // Should have 2 dots for Normal difficulty
      const dots = container.querySelectorAll('[aria-label="Normal difficulty"] span');
      expect(dots).toHaveLength(2);
    });

    test('renders unit summaries', () => {
      const { getByText } = render(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={false}
          expanded={false}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={-1}
        />
      );

      expect(getByText('Test Unit 1')).toBeDefined();
      expect(getByText('Test Unit 2')).toBeDefined();
    });

    test('renders reward hint', () => {
      const { getByText } = render(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={false}
          expanded={false}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={-1}
        />
      );

      expect(getByText('Test Rewards')).toBeDefined();
    });
  });

  describe('Keyboard Interaction', () => {
    test('calls onSelect when Enter pressed', () => {
      const onSelect = vi.fn();
      const { container } = render(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={true}
          expanded={false}
          onSelect={onSelect}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={0}
        />
      );

      const card = container.firstChild as HTMLElement;
      fireEvent.keyDown(card, { key: 'Enter' });

      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    test('calls onSelect when Space pressed', () => {
      const onSelect = vi.fn();
      const { container } = render(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={true}
          expanded={false}
          onSelect={onSelect}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={0}
        />
      );

      const card = container.firstChild as HTMLElement;
      fireEvent.keyDown(card, { key: ' ' });

      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    test('calls onToggleExpand when ArrowUp pressed', () => {
      const onToggleExpand = vi.fn();
      const { container } = render(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={true}
          expanded={false}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={onToggleExpand}
          tabIndex={0}
        />
      );

      const card = container.firstChild as HTMLElement;
      fireEvent.keyDown(card, { key: 'ArrowUp' });

      expect(onToggleExpand).toHaveBeenCalledTimes(1);
    });

    test('calls onToggleExpand when ArrowDown pressed', () => {
      const onToggleExpand = vi.fn();
      const { container } = render(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={true}
          expanded={false}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={onToggleExpand}
          tabIndex={0}
        />
      );

      const card = container.firstChild as HTMLElement;
      fireEvent.keyDown(card, { key: 'ArrowDown' });

      expect(onToggleExpand).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    test('has role="radio"', () => {
      const { container } = render(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={false}
          expanded={false}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={-1}
        />
      );

      const card = container.querySelector('[role="radio"]');
      expect(card).toBeDefined();
    });

    test('aria-checked reflects selected state', () => {
      const { container, rerender } = render(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={false}
          expanded={false}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={-1}
        />
      );

      let card = container.querySelector('[role="radio"]');
      expect(card).toHaveAttribute('aria-checked', 'false');

      rerender(
        <OpponentCard
          preview={mockPreview}
          selected={true}
          focused={false}
          expanded={false}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={-1}
        />
      );

      card = container.querySelector('[role="radio"]');
      expect(card).toHaveAttribute('aria-checked', 'true');
    });

    test('aria-label includes expanded state', () => {
      const { container, rerender } = render(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={false}
          expanded={false}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={-1}
        />
      );

      let card = container.querySelector('[role="radio"]');
      let label = card?.getAttribute('aria-label') || '';
      expect(label).not.toContain('expanded');

      rerender(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={false}
          expanded={true}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={-1}
        />
      );

      card = container.querySelector('[role="radio"]');
      label = card?.getAttribute('aria-label') || '';
      expect(label).toContain('expanded');
    });

    test('tabIndex respects roving tabindex pattern', () => {
      const { container, rerender } = render(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={false}
          expanded={false}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={-1}
        />
      );

      let card = container.querySelector('[role="radio"]');
      expect(card).toHaveAttribute('tabindex', '-1');

      rerender(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={true}
          expanded={false}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={0}
        />
      );

      card = container.querySelector('[role="radio"]');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    test('has descriptive aria-label', () => {
      const { container } = render(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={false}
          expanded={false}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={-1}
        />
      );

      const card = container.querySelector('[role="radio"]');
      const label = card?.getAttribute('aria-label') || '';
      
      expect(label).toContain('Test Opponent');
      expect(label).toContain('Normal difficulty');
      expect(label).toContain('Undead');
      expect(label).toContain('2 units');
    });
  });

  describe('Visual States', () => {
    test('applies focus styles when focused', () => {
      const { container } = render(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={true}
          expanded={false}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={0}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border-primary');
      expect(card.className).toContain('opacity-100');
    });

    test('applies selected styles when selected', () => {
      const { container } = render(
        <OpponentCard
          preview={mockPreview}
          selected={true}
          focused={false}
          expanded={false}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={-1}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border-primary');
      expect(card.className).toContain('border-4');
    });

    test('shows selection hint when selected', () => {
      const { getByText } = render(
        <OpponentCard
          preview={mockPreview}
          selected={true}
          focused={false}
          expanded={false}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={-1}
        />
      );

      expect(getByText(/Selected/)).toBeDefined();
    });
  });

  describe('Expand/Collapse', () => {
    test('shows special rule when expanded', () => {
      const { getByText } = render(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={false}
          expanded={true}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={-1}
        />
      );

      expect(getByText('Test special rule')).toBeDefined();
    });

    test('hides special rule when collapsed', () => {
      const { queryByText } = render(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={false}
          expanded={false}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={-1}
        />
      );

      expect(queryByText('Test special rule')).toBeNull();
    });

    test('shows all units when expanded', () => {
      const { getByText } = render(
        <OpponentCard
          preview={mockPreview}
          selected={false}
          focused={false}
          expanded={true}
          onSelect={vi.fn()}
          onFocus={vi.fn()}
          onToggleExpand={vi.fn()}
          tabIndex={-1}
        />
      );

      expect(getByText('Test Unit 1')).toBeDefined();
      expect(getByText('Test Unit 2')).toBeDefined();
    });
  });
});

