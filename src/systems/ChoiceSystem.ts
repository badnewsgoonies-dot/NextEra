/*
 * ChoiceSystem: Generates three opponent preview cards after each battle.
 * 
 * Features:
 * - Deterministic generation using seed-forked RNG
 * - Diversity rules enforcement (1 Standard min, ≤1 Hard, no duplicate tags, no back-to-back roles)
 * - Re-roll up to 10 times to meet constraints
 * - Fallback with degraded event if constraints impossible
 * - Logging via EventLogger
 * 
 * Usage:
 *   const choices = choiceSystem.generateChoices(rng, battleIndex, playerTeam);
 *   if (choices.ok) {
 *     // Display choices.value (3 OpponentPreview cards)
 *   }
 */

import type { IRng } from '../utils/rng.js';
import type { OpponentPreview, OpponentSpec, PlayerUnit } from '../types/game.js';
import { ok, type Result } from '../utils/Result.js';
import { OPPONENT_CATALOG } from '../data/opponents.js';
import { EventLogger } from './EventLogger.js';
import type { ILogger } from './Logger.js';

/**
 * Diversity constraint violations
 */
interface DiversityViolation {
  readonly hasStandard: boolean; // At least one Standard difficulty
  readonly hardCount: number; // At most one Hard difficulty
  readonly uniqueTags: boolean; // No duplicate primary tags
  readonly noBackToBackRoles: boolean; // No consecutive same roles (Decision #3)
}

/**
 * ChoiceSystem configuration
 */
export interface ChoiceSystemConfig {
  readonly maxAttempts?: number; // Default: 10
  readonly enableLogging?: boolean; // Default: true
}

/**
 * ChoiceSystem implementation
 */
export class ChoiceSystem {
  private readonly maxAttempts: number;
  private readonly eventLogger: EventLogger;
  private readonly enableLogging: boolean;

  constructor(
    logger: ILogger,
    config: ChoiceSystemConfig = {}
  ) {
    this.maxAttempts = config.maxAttempts ?? 10;
    this.enableLogging = config.enableLogging ?? true;
    this.eventLogger = new EventLogger(logger);
  }

  /**
   * Generate three opponent preview cards deterministically.
   * 
   * @param rng - Seeded RNG (will be forked per battleIndex)
   * @param battleIndex - How many battles completed (for deterministic fork)
   * @param playerTeam - Current player team (optional, for future counter-tag logic)
   * @returns Result with 3 OpponentPreview cards or error
   */
  generateChoices(
    rng: IRng,
    battleIndex: number,
    playerTeam?: readonly PlayerUnit[]
  ): Result<readonly OpponentPreview[], string> {
    // Fork RNG deterministically based on battleIndex
    const choiceRng = rng.fork('choice').fork(String(battleIndex));

    let attempts = 0;
    let degraded = false;
    let previews: OpponentPreview[] | null = null;

    // Try up to maxAttempts to find diverse opponents
    while (attempts < this.maxAttempts && !previews) {
      attempts++;
      
      const candidates = this.selectThreeCandidates(choiceRng);
      const violation = this.checkDiversity(candidates);

      if (this.isDiverse(violation)) {
        // Success! Convert to previews
        previews = candidates.map(spec => this.createPreview(spec, playerTeam));
      }
    }

    // If still no valid set, use fallback (relax constraints)
    if (!previews) {
      degraded = true;
      const fallback = this.selectThreeCandidates(choiceRng);
      previews = fallback.map(spec => this.createPreview(spec, playerTeam));

      if (this.enableLogging) {
        this.eventLogger.logChoiceDegraded({
          battleIndex,
          reason: 'Failed to meet diversity constraints after max attempts',
          attempts,
        });
      }
    }

    // Log successful generation
    if (this.enableLogging) {
      this.eventLogger.logChoiceGenerated({
        battleIndex,
        previews: previews.map(p => ({
          id: p.spec.id,
          difficulty: p.spec.difficulty,
          primaryTag: p.spec.primaryTag,
        })),
        seed: choiceRng.describe().seed,
        attempts,
        degraded,
      });
    }

    return ok(previews);
  }

  /**
   * Select three random opponents from catalog
   */
  private selectThreeCandidates(rng: IRng): readonly OpponentSpec[] {
    // Shuffle catalog and take first 3 (deterministic)
    const shuffled = [...OPPONENT_CATALOG];
    rng.shuffleInPlace(shuffled);
    return shuffled.slice(0, 3);
  }

  /**
   * Check if three opponents meet diversity rules
   */
  private checkDiversity(specs: readonly OpponentSpec[]): DiversityViolation {
    // Rule 1: At least one Standard difficulty
    const hasStandard = specs.some(s => s.difficulty === 'Standard');

    // Rule 2: At most one Hard difficulty
    const hardCount = specs.filter(s => s.difficulty === 'Hard').length;

    // Rule 3: No duplicate primary tags
    const tags = specs.map(s => s.primaryTag);
    const uniqueTags = new Set(tags).size === tags.length;

    // Rule 4: No back-to-back roles (Decision #3: Role = Archetype)
    const roles = specs.map(s => s.units[0].role);
    const noBackToBackRoles = !roles.some((role, i) => i > 0 && role === roles[i - 1]);

    return {
      hasStandard,
      hardCount,
      uniqueTags,
      noBackToBackRoles,
    };
  }

  /**
   * Check if diversity violation is acceptable
   */
  private isDiverse(v: DiversityViolation): boolean {
    return v.hasStandard && v.hardCount <= 1 && v.uniqueTags && v.noBackToBackRoles;
  }

  /**
   * Create opponent preview from spec
   */
  private createPreview(
    spec: OpponentSpec,
    _playerTeam?: readonly PlayerUnit[] // Prefix with _ to indicate intentionally unused
  ): OpponentPreview {
    // For MVP: show unit summaries (not "???" mystery)
    // playerTeam parameter reserved for future counter-tag logic
    const unitSummaries = spec.units.map(u => ({
      name: u.name,
      role: u.role,
    }));

    return {
      spec,
      threatScore: undefined, // Decision #2: Omitted from MVP
      counterTags: spec.counterTags, // Decision #4: Static from spec
      unitSummaries,
    };
  }
}

