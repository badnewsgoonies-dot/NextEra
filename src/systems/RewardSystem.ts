/*
 * RewardSystem: Generate battle rewards deterministically
 * 
 * Features:
 * - Deterministic item drops based on RNG seed
 * - Difficulty affects drop rate and quality
 * - Experience rewards based on battle length
 * - Defeated enemies available for recruitment
 */

import type { IRng } from '../utils/rng.js';
import type { 
  BattleReward, 
  OpponentSpec, 
  BattleResult,
  Item,
  Difficulty 
} from '../types/game.js';
import { ITEM_CATALOG } from '../data/items.js';
import type { ILogger } from './Logger.js';

export class RewardSystem {
  constructor(private readonly logger: ILogger) {}

  /**
   * Generate battle rewards deterministically
   */
  generateRewards(
    opponentSpec: OpponentSpec,
    battleResult: BattleResult,
    rng: IRng
  ): BattleReward {
    // Base experience = 10 * turnsTaken
    const baseExp = battleResult.turnsTaken * 10;
    
    // Difficulty multiplier
    const expMultiplier = opponentSpec.difficulty === 'Hard' ? 2.0
                        : opponentSpec.difficulty === 'Normal' ? 1.5
                        : 1.0;
    
    const experience = Math.floor(baseExp * expMultiplier);

    // Roll for item drops
    const items = this.rollItems(rng, opponentSpec.difficulty);

    // Only return actually defeated enemies (not all opponent units)
    const defeatedEnemies = opponentSpec.units.filter(unit =>
      battleResult.unitsDefeated.includes(unit.id)
    );

    this.logger.info('rewards:generated', {
      opponentId: opponentSpec.id,
      difficulty: opponentSpec.difficulty,
      experience,
      itemCount: items.length,
      defeatedCount: defeatedEnemies.length,
    });

    return {
      items,
      defeatedEnemies,
      experience,
    };
  }

  /**
   * Roll for item drops
   * Difficulty affects both drop rate and rarity
   */
  private rollItems(rng: IRng, difficulty: Difficulty): Item[] {
    const items: Item[] = [];

    // Drop rate by difficulty
    const dropRate = difficulty === 'Hard' ? 0.8 
                   : difficulty === 'Normal' ? 0.5 
                   : 0.3;

    // Number of drop attempts (1-3 based on difficulty)
    const maxDrops = difficulty === 'Hard' ? 3 
                   : difficulty === 'Normal' ? 2 
                   : 1;

    for (let i = 0; i < maxDrops; i++) {
      if (rng.float() < dropRate) {
        const item = this.rollSingleItem(rng, difficulty);
        items.push(item);
      }
    }

    return items;
  }

  /**
   * Roll a single item
   * Difficulty affects rarity distribution
   */
  private rollSingleItem(rng: IRng, difficulty: Difficulty): Item {
    // Rarity roll
    const rarityRoll = rng.float();
    
    let rarity: 'common' | 'rare' | 'epic';
    if (difficulty === 'Hard') {
      // Hard: 20% epic, 40% rare, 40% common
      rarity = rarityRoll > 0.8 ? 'epic'
             : rarityRoll > 0.4 ? 'rare'
             : 'common';
    } else if (difficulty === 'Normal') {
      // Normal: 5% epic, 30% rare, 65% common
      rarity = rarityRoll > 0.95 ? 'epic'
             : rarityRoll > 0.65 ? 'rare'
             : 'common';
    } else {
      // Standard: 1% epic, 15% rare, 84% common
      rarity = rarityRoll > 0.99 ? 'epic'
             : rarityRoll > 0.84 ? 'rare'
             : 'common';
    }

    // Filter items by rarity
    const itemsOfRarity = ITEM_CATALOG.filter(i => i.rarity === rarity);
    
    if (itemsOfRarity.length === 0) {
      // Fallback to common if no items of this rarity
      return rng.choose(ITEM_CATALOG.filter(i => i.rarity === 'common'));
    }

    return rng.choose(itemsOfRarity);
  }

  /**
   * Calculate gold reward (future feature)
   */
  calculateGold(opponentSpec: OpponentSpec): number {
    const baseGold = 50;
    const multiplier = opponentSpec.difficulty === 'Hard' ? 3
                     : opponentSpec.difficulty === 'Normal' ? 2
                     : 1;
    
    return baseGold * multiplier * opponentSpec.units.length;
  }
}
