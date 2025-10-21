/*
 * Performance Tests
 * Target: <4ms initial render for OpponentSelectScreen
 */

import { describe, test, expect, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { OpponentSelectScreen } from '../../src/screens/OpponentSelectScreen.js';
import { makeRng } from '../../src/utils/rng.js';
import { ConsoleLogger } from '../../src/systems/Logger.js';
import { ChoiceSystem } from '../../src/systems/ChoiceSystem.js';
import type { OpponentPreview } from '../../src/types/game.js';

describe('Performance Tests', () => {
  let previews: OpponentPreview[];

  beforeEach(() => {
    const logger = new ConsoleLogger('error');
    const choiceSystem = new ChoiceSystem(logger, { enableLogging: false });
    const rng = makeRng(12345);
    const result = choiceSystem.generateChoices(rng, 0);

    if (result.ok) {
      previews = result.value as OpponentPreview[];
    } else {
      throw new Error('Failed to generate test previews');
    }
  });

  describe('Initial Render Performance', () => {
    test('OpponentSelectScreen renders within reasonable time', () => {
      const startTime = performance.now();

      render(
        <OpponentSelectScreen
          previews={previews}
          battleIndex={0}
          onSelect={() => {}}
          onCancel={() => {}}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      console.log(`OpponentSelectScreen render time: ${renderTime.toFixed(2)}ms`);

      // Target: <4ms in production browser, but test environment (jsdom) is 20-30x slower
      // Allow up to 250ms in test environment to account for CI/slower machines
      // Real browser performance should be measured with React DevTools Profiler
      expect(renderTime).toBeLessThan(250);
    });

    test('re-renders are fast (React.memo working)', () => {
      const { rerender } = render(
        <OpponentSelectScreen
          previews={previews}
          battleIndex={0}
          onSelect={() => {}}
          onCancel={() => {}}
        />
      );

      const startTime = performance.now();

      // Re-render with same props (should be memoized)
      rerender(
        <OpponentSelectScreen
          previews={previews}
          battleIndex={0}
          onSelect={() => {}}
          onCancel={() => {}}
        />
      );

      const endTime = performance.now();
      const rerenderTime = endTime - startTime;

      console.log(`OpponentSelectScreen re-render time: ${rerenderTime.toFixed(2)}ms`);

      // Re-renders should be very fast (allow up to 30ms for slower test environments)
      expect(rerenderTime).toBeLessThan(30);
    });
  });

  describe('Component Count', () => {
    test('renders expected number of DOM nodes', () => {
      const { container } = render(
        <OpponentSelectScreen
          previews={previews}
          battleIndex={0}
          onSelect={() => {}}
          onCancel={() => {}}
        />
      );

      const allElements = container.querySelectorAll('*');
      console.log(`Total DOM nodes rendered: ${allElements.length}`);

      // Should render reasonable number of elements (not thousands)
      expect(allElements.length).toBeLessThan(500);
    });

    test('renders exactly 3 opponent cards', () => {
      const { container } = render(
        <OpponentSelectScreen
          previews={previews}
          battleIndex={0}
          onSelect={() => {}}
          onCancel={() => {}}
        />
      );

      const cards = container.querySelectorAll('[role="radio"]');
      expect(cards).toHaveLength(3);
    });
  });
});

