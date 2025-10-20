/*
 * Accessibility Tests
 * Uses axe-core to audit components for WCAG 2.1 AA compliance
 */

import { describe, test, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { makeRng } from '../../src/utils/rng.js';
import { ConsoleLogger } from '../../src/systems/Logger.js';
import { ChoiceSystem } from '../../src/systems/ChoiceSystem.js';
import { OpponentSelectScreen } from '../../src/screens/OpponentSelectScreen.js';
import { DifficultyDots } from '../../src/components/DifficultyDots.js';
import { CounterTags } from '../../src/components/CounterTags.js';
import { Card } from '../../src/components/Card.js';
import type { Tag } from '../../src/types/game.js';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Audit', () => {
  describe('Component Level (axe-core)', () => {
    test('DifficultyDots has no accessibility violations', async () => {
      const { container } = render(<DifficultyDots difficulty="Hard" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('CounterTags has no accessibility violations', async () => {
      const tags: Tag[] = ['Holy', 'Beast', 'Arcane'];
      const { container } = render(<CounterTags counterTags={tags} enabled={true} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Card has no accessibility violations', async () => {
      const { container } = render(
        <Card variant="interactive">
          <h2>Test Card</h2>
          <p>Card content</p>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('OpponentSelectScreen has no accessibility violations', async () => {
      const logger = new ConsoleLogger('error');
      const choiceSystem = new ChoiceSystem(logger, { enableLogging: false });
      const rng = makeRng(12345);
      const choicesResult = choiceSystem.generateChoices(rng, 0);

      if (!choicesResult.ok) {
        throw new Error('Failed to generate test previews');
      }

      const { container } = render(
        <OpponentSelectScreen
          previews={choicesResult.value}
          battleIndex={0}
          onSelect={() => {}}
          onCancel={() => {}}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    test('all interactive elements are keyboard accessible', async () => {
      const logger = new ConsoleLogger('error');
      const choiceSystem = new ChoiceSystem(logger, { enableLogging: false });
      const rng = makeRng(99999);
      const choicesResult = choiceSystem.generateChoices(rng, 0);

      if (!choicesResult.ok) return;

      const { container } = render(
        <OpponentSelectScreen
          previews={choicesResult.value}
          battleIndex={0}
          onSelect={() => {}}
          onCancel={() => {}}
        />
      );

      // Find all tabbable elements
      const tabbable = container.querySelectorAll('[tabindex="0"]');
      
      // Should have at least 1 tabbable element (focused card in roving tabindex)
      expect(tabbable.length).toBeGreaterThanOrEqual(1);
    });

    test('roving tabindex pattern: only one card has tabindex="0"', async () => {
      const logger = new ConsoleLogger('error');
      const choiceSystem = new ChoiceSystem(logger, { enableLogging: false });
      const rng = makeRng(55555);
      const choicesResult = choiceSystem.generateChoices(rng, 0);

      if (!choicesResult.ok) return;

      const { container } = render(
        <OpponentSelectScreen
          previews={choicesResult.value}
          battleIndex={0}
          onSelect={() => {}}
          onCancel={() => {}}
        />
      );

      const cards = container.querySelectorAll('[role="radio"]');
      const tabbableCards = Array.from(cards).filter(card => card.getAttribute('tabindex') === '0');

      // Roving tabindex: exactly one card should be tabbable
      expect(tabbableCards).toHaveLength(1);
    });
  });

  describe('ARIA Labels and Roles', () => {
    test('OpponentSelectScreen has radiogroup role', async () => {
      const logger = new ConsoleLogger('error');
      const choiceSystem = new ChoiceSystem(logger, { enableLogging: false });
      const rng = makeRng(33333);
      const choicesResult = choiceSystem.generateChoices(rng, 0);

      if (!choicesResult.ok) return;

      const { container } = render(
        <OpponentSelectScreen
          previews={choicesResult.value}
          battleIndex={0}
          onSelect={() => {}}
          onCancel={() => {}}
        />
      );

      const radiogroup = container.querySelector('[role="radiogroup"]');
      expect(radiogroup).toBeDefined();
      expect(radiogroup).toHaveAttribute('aria-label');
    });

    test('each opponent card has radio role', async () => {
      const logger = new ConsoleLogger('error');
      const choiceSystem = new ChoiceSystem(logger, { enableLogging: false });
      const rng = makeRng(44444);
      const choicesResult = choiceSystem.generateChoices(rng, 0);

      if (!choicesResult.ok) return;

      const { container } = render(
        <OpponentSelectScreen
          previews={choicesResult.value}
          battleIndex={0}
          onSelect={() => {}}
          onCancel={() => {}}
        />
      );

      const radios = container.querySelectorAll('[role="radio"]');
      expect(radios).toHaveLength(3);

      // Each radio should have aria-checked and aria-label
      radios.forEach(radio => {
        expect(radio).toHaveAttribute('aria-checked');
        expect(radio).toHaveAttribute('aria-label');
      });
    });

    test('live region exists for screen reader announcements', async () => {
      const logger = new ConsoleLogger('error');
      const choiceSystem = new ChoiceSystem(logger, { enableLogging: false });
      const rng = makeRng(66666);
      const choicesResult = choiceSystem.generateChoices(rng, 0);

      if (!choicesResult.ok) return;

      const { container } = render(
        <OpponentSelectScreen
          previews={choicesResult.value}
          battleIndex={0}
          onSelect={() => {}}
          onCancel={() => {}}
        />
      );

      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeDefined();
      expect(liveRegion).toHaveAttribute('role', 'status');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });
  });
});

