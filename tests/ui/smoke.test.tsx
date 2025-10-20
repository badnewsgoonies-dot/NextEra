/*
 * UI Smoke Tests
 * Quick validation that components render without crashing
 */

import { describe, test, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { DifficultyDots } from '../../src/components/DifficultyDots.js';
import { CounterTags } from '../../src/components/CounterTags.js';
import { Card } from '../../src/components/Card.js';
import type { Tag } from '../../src/types/game.js';

describe('UI Smoke Tests', () => {
  describe('DifficultyDots', () => {
    test('renders Standard difficulty (1 dot)', () => {
      const { container } = render(<DifficultyDots difficulty="Standard" />);
      const dots = container.querySelectorAll('span[aria-hidden="true"]');
      expect(dots).toHaveLength(1);
    });

    test('renders Normal difficulty (2 dots)', () => {
      const { container } = render(<DifficultyDots difficulty="Normal" />);
      const dots = container.querySelectorAll('span[aria-hidden="true"]');
      expect(dots).toHaveLength(2);
    });

    test('renders Hard difficulty (3 dots)', () => {
      const { container } = render(<DifficultyDots difficulty="Hard" />);
      const dots = container.querySelectorAll('span[aria-hidden="true"]');
      expect(dots).toHaveLength(3);
    });

    test('has aria-label for accessibility', () => {
      const { container } = render(<DifficultyDots difficulty="Hard" />);
      const element = container.querySelector('[aria-label]');
      expect(element).toHaveAttribute('aria-label', 'Hard difficulty');
    });
  });

  describe('CounterTags', () => {
    test('renders tags when enabled', () => {
      const tags: Tag[] = ['Holy', 'Beast'];
      const { getByText } = render(<CounterTags counterTags={tags} enabled={true} />);
      
      expect(getByText('Holy')).toBeDefined();
      expect(getByText('Beast')).toBeDefined();
      expect(getByText('Counters:')).toBeDefined();
    });

    test('hides when disabled', () => {
      const tags: Tag[] = ['Holy', 'Beast'];
      const { container } = render(<CounterTags counterTags={tags} enabled={false} />);
      
      expect(container.firstChild).toBeNull();
    });

    test('hides when tags array is empty', () => {
      const { container } = render(<CounterTags counterTags={[]} enabled={true} />);
      
      expect(container.firstChild).toBeNull();
    });

    test('has aria-label with tag names', () => {
      const tags: Tag[] = ['Undead', 'Arcane'];
      const { container } = render(<CounterTags counterTags={tags} enabled={true} />);
      
      const element = container.querySelector('[aria-label*="Counters"]');
      expect(element).toBeDefined();
    });
  });

  describe('Card', () => {
    test('renders children', () => {
      const { getByText } = render(<Card>Test Content</Card>);
      expect(getByText('Test Content')).toBeDefined();
    });

    test('applies custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    test('supports variant prop', () => {
      const { container } = render(<Card variant="elevated">Content</Card>);
      expect(container.firstChild).toHaveClass('shadow-card-hover');
    });

    test('handles onClick when interactive', () => {
      let clicked = false;
      const { container } = render(
        <Card variant="interactive" onClick={() => { clicked = true; }}>
          Content
        </Card>
      );
      
      container.firstChild?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(clicked).toBe(true);
    });
  });
});

