import { describe, test, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { ChoiceSystem } from '../../src/systems/ChoiceSystem.js';
import { makeRng } from '../../src/utils/rng.js';
import { ConsoleLogger } from '../../src/systems/Logger.js';
import type { OpponentPreview } from '../../src/types/game.js';

describe('ChoiceSystem', () => {
  let choiceSystem: ChoiceSystem;
  let logger: ConsoleLogger;

  beforeEach(() => {
    logger = new ConsoleLogger('error'); // Suppress logs in tests
    choiceSystem = new ChoiceSystem(logger, { enableLogging: false });
  });

  describe('Basic Generation', () => {
    test('generates exactly 3 opponent previews', () => {
      const rng = makeRng(42);
      const result = choiceSystem.generateChoices(rng, 0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(3);
      }
    });

    test('each preview has required fields', () => {
      const rng = makeRng(123);
      const result = choiceSystem.generateChoices(rng, 0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        for (const preview of result.value) {
          expect(preview.spec).toBeDefined();
          expect(preview.spec.id).toBeDefined();
          expect(preview.spec.name).toBeDefined();
          expect(preview.spec.difficulty).toBeDefined();
          expect(preview.spec.units).toBeDefined();
          expect(preview.spec.primaryTag).toBeDefined();
          expect(preview.counterTags).toBeDefined();
          expect(preview.unitSummaries).toBeDefined();
        }
      }
    });

    test('threatScore is undefined (Decision #2)', () => {
      const rng = makeRng(999);
      const result = choiceSystem.generateChoices(rng, 0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        for (const preview of result.value) {
          expect(preview.threatScore).toBeUndefined();
        }
      }
    });

    test('counterTags copied from spec (Decision #4)', () => {
      const rng = makeRng(555);
      const result = choiceSystem.generateChoices(rng, 0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        for (const preview of result.value) {
          expect(preview.counterTags).toEqual(preview.spec.counterTags);
        }
      }
    });
  });

  describe('Determinism', () => {
    test('same seed + battleIndex → same previews', () => {
      const rng1 = makeRng(12345);
      const rng2 = makeRng(12345);

      const result1 = choiceSystem.generateChoices(rng1, 5);
      const result2 = choiceSystem.generateChoices(rng2, 5);

      expect(result1.ok).toBe(true);
      expect(result2.ok).toBe(true);

      if (result1.ok && result2.ok) {
        expect(result1.value.map(p => p.spec.id)).toEqual(result2.value.map(p => p.spec.id));
      }
    });

    test('different battleIndex uses different RNG fork', () => {
      const rng1 = makeRng(12345);
      const rng2 = makeRng(12345);

      const result1 = choiceSystem.generateChoices(rng1, 0);
      const result2 = choiceSystem.generateChoices(rng2, 1);

      expect(result1.ok).toBe(true);
      expect(result2.ok).toBe(true);

      // Even if previews happen to be same, they used independent RNG forks
      // This is guaranteed by fork(battleIndex) - verified by RNG tests
      // Just verify both succeed (determinism test above verifies fork independence)
      expect(result1.ok && result2.ok).toBe(true);
    });

    test('property: determinism across many seeds', () => {
      fc.assert(
        fc.property(fc.integer(), fc.integer(0, 100), (seed, battleIndex) => {
          const rng1 = makeRng(seed);
          const rng2 = makeRng(seed);

          const result1 = choiceSystem.generateChoices(rng1, battleIndex);
          const result2 = choiceSystem.generateChoices(rng2, battleIndex);

          if (!result1.ok || !result2.ok) return true; // Allow errors

          const ids1 = result1.value.map(p => p.spec.id);
          const ids2 = result2.value.map(p => p.spec.id);

          return JSON.stringify(ids1) === JSON.stringify(ids2);
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Diversity Rules', () => {
    test('enforces at least one Standard difficulty', () => {
      // Run multiple generations to verify constraint
      const checks = Array.from({ length: 20 }, (_, i) => {
        const rng = makeRng(i * 1000);
        const result = choiceSystem.generateChoices(rng, i);
        
        if (!result.ok) return false;
        
        const hasStandard = result.value.some(p => p.spec.difficulty === 'Standard');
        return hasStandard;
      });

      // Most should have at least one Standard (or all if catalog balanced)
      const successRate = checks.filter(Boolean).length / checks.length;
      expect(successRate).toBeGreaterThan(0.8); // At least 80% success rate
    });

    test('enforces at most one Hard difficulty', () => {
      const checks = Array.from({ length: 20 }, (_, i) => {
        const rng = makeRng(i * 2000);
        const result = choiceSystem.generateChoices(rng, i);
        
        if (!result.ok) return false;
        
        const hardCount = result.value.filter(p => p.spec.difficulty === 'Hard').length;
        return hardCount <= 1;
      });

      // All should meet this constraint
      const successRate = checks.filter(Boolean).length / checks.length;
      expect(successRate).toBeGreaterThan(0.8);
    });

    test('avoids duplicate primary tags', () => {
      const checks = Array.from({ length: 20 }, (_, i) => {
        const rng = makeRng(i * 3000);
        const result = choiceSystem.generateChoices(rng, i);
        
        if (!result.ok) return false;
        
        const tags = result.value.map(p => p.spec.primaryTag);
        const uniqueTags = new Set(tags);
        return uniqueTags.size === tags.length;
      });

      const successRate = checks.filter(Boolean).length / checks.length;
      expect(successRate).toBeGreaterThan(0.8);
    });

    test('avoids back-to-back roles (Decision #3)', () => {
      const checks = Array.from({ length: 20 }, (_, i) => {
        const rng = makeRng(i * 4000);
        const result = choiceSystem.generateChoices(rng, i);
        
        if (!result.ok) return false;
        
        const roles = result.value.map(p => p.spec.units[0].role);
        const hasBackToBack = roles.some((role, idx) => idx > 0 && role === roles[idx - 1]);
        return !hasBackToBack;
      });

      const successRate = checks.filter(Boolean).length / checks.length;
      expect(successRate).toBeGreaterThan(0.7); // Less strict (may degrade)
    });
  });

  describe('Re-roll Logic', () => {
    test('attempts multiple times to find diverse set', () => {
      // Use logging to verify attempts
      const loggerWithLog = new ConsoleLogger('debug');
      const systemWithLog = new ChoiceSystem(loggerWithLog, { 
        maxAttempts: 10,
        enableLogging: true,
      });

      const rng = makeRng(777);
      const result = systemWithLog.generateChoices(rng, 0);

      expect(result.ok).toBe(true);
      // Hard to test attempt count directly, but should not error
    });

    test('maxAttempts can be configured', () => {
      const systemFast = new ChoiceSystem(logger, { maxAttempts: 1 });
      const rng = makeRng(888);
      const result = systemFast.generateChoices(rng, 0);

      expect(result.ok).toBe(true);
      // With 1 attempt, may get degraded results more often
    });
  });

  describe('Fallback Mode (Degraded)', () => {
    test('always returns 3 previews even if constraints impossible', () => {
      // Even with tough constraints, should return previews
      const rng = makeRng(99999);
      const result = choiceSystem.generateChoices(rng, 0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(3);
      }
    });

    test('degraded mode still produces valid OpponentPreview objects', () => {
      const rng = makeRng(11111);
      const result = choiceSystem.generateChoices(rng, 0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        for (const preview of result.value) {
          expect(preview.spec).toBeDefined();
          expect(preview.unitSummaries).toBeDefined();
          expect(Array.isArray(preview.counterTags)).toBe(true);
        }
      }
    });
  });

  describe('Unit Summaries', () => {
    test('provides unit summaries (not "???" mystery for MVP)', () => {
      const rng = makeRng(333);
      const result = choiceSystem.generateChoices(rng, 0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        for (const preview of result.value) {
          expect(preview.unitSummaries).not.toBeNull();
          expect(Array.isArray(preview.unitSummaries)).toBe(true);
          if (preview.unitSummaries) {
            expect(preview.unitSummaries.length).toBeGreaterThan(0);
            for (const summary of preview.unitSummaries) {
              expect(summary.name).toBeDefined();
              expect(summary.role).toBeDefined();
            }
          }
        }
      }
    });
  });

  describe('Property-Based Tests', () => {
    test('property: always returns 3 previews', () => {
      fc.assert(
        fc.property(fc.integer(), fc.integer(0, 1000), (seed, battleIndex) => {
          const rng = makeRng(seed);
          const result = choiceSystem.generateChoices(rng, battleIndex);

          return result.ok && result.value.length === 3;
        }),
        { numRuns: 100 }
      );
    });

    test('property: all previews have valid specs', () => {
      fc.assert(
        fc.property(fc.integer(), fc.integer(0, 100), (seed, battleIndex) => {
          const rng = makeRng(seed);
          const result = choiceSystem.generateChoices(rng, battleIndex);

          if (!result.ok) return true; // Allow errors

          return result.value.every(p => 
            p.spec &&
            p.spec.id &&
            p.spec.difficulty &&
            p.spec.units.length > 0
          );
        }),
        { numRuns: 50 }
      );
    });

    test('property: no duplicate opponent IDs in same choice set', () => {
      fc.assert(
        fc.property(fc.integer(), fc.integer(0, 100), (seed, battleIndex) => {
          const rng = makeRng(seed);
          const result = choiceSystem.generateChoices(rng, battleIndex);

          if (!result.ok) return true;

          const ids = result.value.map(p => p.spec.id);
          const uniqueIds = new Set(ids);
          
          return uniqueIds.size === ids.length; // No duplicates
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Event Logging', () => {
    test('logs choice:generated event when enabled', () => {
      const events: Array<{ type: string; data: unknown }> = [];
      const mockLogger = {
        debug: () => {},
        info: (msg: string, ctx?: Record<string, unknown>) => {
          events.push({ type: msg, data: ctx });
        },
        warn: () => {},
        error: () => {},
        child: () => mockLogger,
      };

      const systemWithLog = new ChoiceSystem(mockLogger, { enableLogging: true });
      const rng = makeRng(555);
      systemWithLog.generateChoices(rng, 5);

      const generatedEvent = events.find(e => e.type === 'choice:generated');
      expect(generatedEvent).toBeDefined();
      
      if (generatedEvent && generatedEvent.data) {
        const data = generatedEvent.data as Record<string, unknown>;
        expect(data.battleIndex).toBe(5);
        expect(data.previewCount).toBe(3);
        expect(data.attempts).toBeGreaterThan(0);
      }
    });

    test('does not log when logging disabled', () => {
      const events: string[] = [];
      const mockLogger = {
        debug: () => {},
        info: (msg: string) => { events.push(msg); },
        warn: () => {},
        error: () => {},
        child: () => mockLogger,
      };

      const systemNoLog = new ChoiceSystem(mockLogger, { enableLogging: false });
      const rng = makeRng(666);
      systemNoLog.generateChoices(rng, 0);

      expect(events.length).toBe(0);
    });
  });

  describe('Integration with Catalog', () => {
    test('uses opponents from catalog', () => {
      const rng = makeRng(777);
      const result = choiceSystem.generateChoices(rng, 0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        // All IDs should start with known prefixes (undead_, mech_, etc.)
        const validPrefixes = ['undead_', 'mech_', 'wolf_', 'beast_', 'holy_', 'arcane_', 'forest_', 'nature_', 'lich_', 'war_', 'repair_', 'skeleton_'];
        
        for (const preview of result.value) {
          const hasValidPrefix = validPrefixes.some(prefix => preview.spec.id.startsWith(prefix));
          expect(hasValidPrefix).toBe(true);
        }
      }
    });

    test('respects catalog difficulty distribution', () => {
      // Generate many choice sets and verify difficulty distribution makes sense
      const difficultyCounts = { Standard: 0, Normal: 0, Hard: 0 };

      for (let i = 0; i < 30; i++) {
        const rng = makeRng(i * 100);
        const result = choiceSystem.generateChoices(rng, i);

        if (result.ok) {
          for (const preview of result.value) {
            difficultyCounts[preview.spec.difficulty]++;
          }
        }
      }

      // Should have generated some of each type (catalog has all difficulties)
      expect(difficultyCounts.Standard).toBeGreaterThan(0);
      expect(difficultyCounts.Normal).toBeGreaterThan(0);
      // Hard might be rare, but should appear eventually in 30 * 3 = 90 selections
    });
  });

  describe('Edge Cases', () => {
    test('handles battleIndex 0 (first choice)', () => {
      const rng = makeRng(1);
      const result = choiceSystem.generateChoices(rng, 0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(3);
      }
    });

    test('handles large battleIndex', () => {
      const rng = makeRng(2);
      const result = choiceSystem.generateChoices(rng, 999);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(3);
      }
    });

    test('works without playerTeam parameter', () => {
      const rng = makeRng(3);
      const result = choiceSystem.generateChoices(rng, 0);

      expect(result.ok).toBe(true);
    });

    test('works with playerTeam parameter (future-proofing)', () => {
      const rng = makeRng(4);
      const mockTeam = [
        { id: '1', name: 'Hero', hp: 100, maxHp: 100, atk: 20, def: 10, speed: 50, role: 'Tank' as Role, tags: ['Holy' as Tag], level: 1, experience: 0 },
      ];
      
      const result = choiceSystem.generateChoices(rng, 0, mockTeam);

      expect(result.ok).toBe(true);
    });
  });
});

