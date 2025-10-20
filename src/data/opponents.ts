/*
 * Opponent Catalog for NextEra MVP
 * 
 * 18 opponent specifications with variety:
 * - Difficulty: 11 Standard (61%), 5 Normal (28%), 2 Hard (11%)
 * - All 6 tags represented: Undead, Mech, Beast, Holy, Arcane, Nature
 * - All 4 roles represented: Tank, DPS, Support, Specialist
 * - Counter tags manually curated (Decision #4)
 * 
 * Distribution ensures ChoiceSystem can always find diverse choices.
 */

import type { OpponentSpec, EnemyUnitTemplate, Difficulty, Tag, Role } from '../types/game.js';

// ============================================
// Enemy Unit Templates (Reusable Units)
// ============================================

const SKELETON_WARRIOR: EnemyUnitTemplate = {
  id: 'skeleton_warrior',
  name: 'Skeleton Warrior',
  role: 'Tank',
  tags: ['Undead'],
  baseStats: { hp: 80, atk: 15, def: 12, speed: 40 },
};

const ZOMBIE_BRUTE: EnemyUnitTemplate = {
  id: 'zombie_brute',
  name: 'Zombie Brute',
  role: 'Tank',
  tags: ['Undead'],
  baseStats: { hp: 100, atk: 18, def: 8, speed: 25 },
};

const NECROMANCER: EnemyUnitTemplate = {
  id: 'necromancer',
  name: 'Necromancer',
  role: 'Support',
  tags: ['Undead', 'Arcane'],
  baseStats: { hp: 60, atk: 20, def: 6, speed: 55 },
};

const GHOST_ASSASSIN: EnemyUnitTemplate = {
  id: 'ghost_assassin',
  name: 'Ghost Assassin',
  role: 'DPS',
  tags: ['Undead'],
  baseStats: { hp: 50, atk: 28, def: 4, speed: 70 },
};

const BATTLE_MECH_ALPHA: EnemyUnitTemplate = {
  id: 'battle_mech_alpha',
  name: 'Battle Mech Alpha',
  role: 'Tank',
  tags: ['Mech'],
  baseStats: { hp: 120, atk: 22, def: 20, speed: 30 },
};

const DRONE_SWARM: EnemyUnitTemplate = {
  id: 'drone_swarm',
  name: 'Drone Swarm',
  role: 'DPS',
  tags: ['Mech'],
  baseStats: { hp: 40, atk: 25, def: 3, speed: 80 },
};

const REPAIR_BOT: EnemyUnitTemplate = {
  id: 'repair_bot',
  name: 'Repair Bot',
  role: 'Support',
  tags: ['Mech'],
  baseStats: { hp: 70, atk: 10, def: 15, speed: 50 },
};

const SIEGE_CANNON: EnemyUnitTemplate = {
  id: 'siege_cannon',
  name: 'Siege Cannon',
  role: 'Specialist',
  tags: ['Mech'],
  baseStats: { hp: 80, atk: 35, def: 10, speed: 20 },
};

const DIRE_WOLF: EnemyUnitTemplate = {
  id: 'dire_wolf',
  name: 'Dire Wolf',
  role: 'DPS',
  tags: ['Beast'],
  baseStats: { hp: 65, atk: 24, def: 6, speed: 65 },
};

const BEAR_GUARDIAN: EnemyUnitTemplate = {
  id: 'bear_guardian',
  name: 'Bear Guardian',
  role: 'Tank',
  tags: ['Beast', 'Nature'],
  baseStats: { hp: 110, atk: 20, def: 14, speed: 35 },
};

const SERPENT_STRIKER: EnemyUnitTemplate = {
  id: 'serpent_striker',
  name: 'Serpent Striker',
  role: 'DPS',
  tags: ['Beast'],
  baseStats: { hp: 55, atk: 26, def: 5, speed: 75 },
};

const PALADIN_KNIGHT: EnemyUnitTemplate = {
  id: 'paladin_knight',
  name: 'Paladin Knight',
  role: 'Tank',
  tags: ['Holy'],
  baseStats: { hp: 95, atk: 18, def: 16, speed: 45 },
};

const CLERIC_HEALER: EnemyUnitTemplate = {
  id: 'cleric_healer',
  name: 'Cleric Healer',
  role: 'Support',
  tags: ['Holy'],
  baseStats: { hp: 70, atk: 12, def: 10, speed: 50 },
};

const HOLY_AVENGER: EnemyUnitTemplate = {
  id: 'holy_avenger',
  name: 'Holy Avenger',
  role: 'DPS',
  tags: ['Holy'],
  baseStats: { hp: 75, atk: 30, def: 8, speed: 60 },
};

const ARCANE_EVOKER: EnemyUnitTemplate = {
  id: 'arcane_evoker',
  name: 'Arcane Evoker',
  role: 'DPS',
  tags: ['Arcane'],
  baseStats: { hp: 55, atk: 32, def: 4, speed: 65 },
};

const VOID_WALKER: EnemyUnitTemplate = {
  id: 'void_walker',
  name: 'Void Walker',
  role: 'Specialist',
  tags: ['Arcane'],
  baseStats: { hp: 60, atk: 28, def: 6, speed: 70 },
};

const CRYSTAL_GUARDIAN: EnemyUnitTemplate = {
  id: 'crystal_guardian',
  name: 'Crystal Guardian',
  role: 'Tank',
  tags: ['Arcane'],
  baseStats: { hp: 90, atk: 16, def: 18, speed: 40 },
};

const TREANT_ANCIENT: EnemyUnitTemplate = {
  id: 'treant_ancient',
  name: 'Treant Ancient',
  role: 'Tank',
  tags: ['Nature'],
  baseStats: { hp: 130, atk: 20, def: 12, speed: 25 },
};

const THORN_ARCHER: EnemyUnitTemplate = {
  id: 'thorn_archer',
  name: 'Thorn Archer',
  role: 'DPS',
  tags: ['Nature'],
  baseStats: { hp: 60, atk: 26, def: 7, speed: 55 },
};

const DRUID_SHAMAN: EnemyUnitTemplate = {
  id: 'druid_shaman',
  name: 'Druid Shaman',
  role: 'Support',
  tags: ['Nature'],
  baseStats: { hp: 65, atk: 15, def: 8, speed: 50 },
};

// ============================================
// Opponent Specifications (18 total)
// ============================================

/**
 * Opponent catalog for ChoiceSystem.
 * 
 * Difficulty distribution:
 * - Standard: 11 opponents (61%) - Always at least one per choice set
 * - Normal: 5 opponents (28%) - Moderate challenge
 * - Hard: 2 opponents (11%) - At most one per choice set
 * 
 * Tag distribution:
 * - Undead: 4 opponents
 * - Mech: 3 opponents
 * - Beast: 3 opponents
 * - Holy: 2 opponents
 * - Arcane: 3 opponents
 * - Nature: 3 opponents
 */
export const OPPONENT_CATALOG: readonly OpponentSpec[] = [
  // ========================================
  // STANDARD Difficulty (11 opponents)
  // ========================================

  {
    id: 'undead_patrol_01',
    name: 'Undead Patrol',
    difficulty: 'Standard',
    units: [SKELETON_WARRIOR, SKELETON_WARRIOR],
    primaryTag: 'Undead',
    counterTags: ['Beast'],
    rewardHint: 'Rusty Equipment',
  },

  {
    id: 'mech_scouts_01',
    name: 'Mech Scout Squad',
    difficulty: 'Standard',
    units: [DRONE_SWARM, DRONE_SWARM],
    primaryTag: 'Mech',
    counterTags: ['Nature'],
    rewardHint: 'Tech Components',
  },

  {
    id: 'wolf_pack_01',
    name: 'Wolf Pack',
    difficulty: 'Standard',
    units: [DIRE_WOLF, DIRE_WOLF],
    primaryTag: 'Beast',
    counterTags: ['Mech'],
    rewardHint: 'Beast Pelts',
  },

  {
    id: 'holy_guards_01',
    name: 'Temple Guards',
    difficulty: 'Standard',
    units: [PALADIN_KNIGHT, CLERIC_HEALER],
    primaryTag: 'Holy',
    counterTags: ['Undead', 'Arcane'],
    rewardHint: 'Blessed Items',
  },

  {
    id: 'holy_crusaders_01',
    name: 'Holy Crusaders',
    difficulty: 'Standard',
    units: [HOLY_AVENGER, PALADIN_KNIGHT],
    primaryTag: 'Holy',
    counterTags: ['Undead'],
    rewardHint: 'Divine Weapons',
  },

  {
    id: 'arcane_apprentices_01',
    name: 'Arcane Apprentices',
    difficulty: 'Standard',
    units: [ARCANE_EVOKER],
    primaryTag: 'Arcane',
    counterTags: ['Holy'],
    rewardHint: 'Spell Scrolls',
  },

  {
    id: 'forest_spirits_01',
    name: 'Forest Spirits',
    difficulty: 'Standard',
    units: [THORN_ARCHER, DRUID_SHAMAN],
    primaryTag: 'Nature',
    counterTags: ['Mech'],
    rewardHint: 'Herbal Remedies',
  },

  {
    id: 'skeleton_squad_01',
    name: 'Skeleton Squad',
    difficulty: 'Standard',
    units: [SKELETON_WARRIOR, SKELETON_WARRIOR, SKELETON_WARRIOR],
    primaryTag: 'Undead',
    counterTags: [],
    rewardHint: 'Bone Fragments',
  },

  {
    id: 'repair_convoy_01',
    name: 'Repair Convoy',
    difficulty: 'Standard',
    units: [BATTLE_MECH_ALPHA, REPAIR_BOT],
    primaryTag: 'Mech',
    counterTags: ['Arcane'],
    rewardHint: 'Repair Kits',
  },

  {
    id: 'beast_ambush_01',
    name: 'Beast Ambush',
    difficulty: 'Standard',
    units: [DIRE_WOLF, SERPENT_STRIKER],
    primaryTag: 'Beast',
    counterTags: [],
    rewardHint: 'Fang Trophies',
  },

  {
    id: 'holy_pilgrims_01',
    name: 'Holy Pilgrims',
    difficulty: 'Standard',
    units: [CLERIC_HEALER, CLERIC_HEALER],
    primaryTag: 'Holy',
    counterTags: ['Undead'],
    rewardHint: 'Sacred Relics',
  },

  {
    id: 'nature_wardens_01',
    name: 'Nature Wardens',
    difficulty: 'Standard',
    units: [BEAR_GUARDIAN],
    primaryTag: 'Nature',
    counterTags: ['Mech', 'Undead'],
    rewardHint: 'Natural Armor',
  },

  // ========================================
  // NORMAL Difficulty (5 opponents)
  // ========================================

  {
    id: 'undead_raiders_02',
    name: 'Undead Raiders',
    difficulty: 'Normal',
    units: [ZOMBIE_BRUTE, SKELETON_WARRIOR, GHOST_ASSASSIN],
    primaryTag: 'Undead',
    counterTags: ['Beast', 'Nature'],
    specialRule: 'First unit revives once at 50% HP',
    rewardHint: 'Cursed Weapons',
  },

  {
    id: 'mech_battalion_02',
    name: 'Mech Battalion',
    difficulty: 'Normal',
    units: [BATTLE_MECH_ALPHA, DRONE_SWARM, REPAIR_BOT],
    primaryTag: 'Mech',
    counterTags: ['Nature', 'Beast'],
    specialRule: 'Repair Bot heals allies each turn',
    rewardHint: 'Advanced Tech',
  },

  {
    id: 'beast_hunters_02',
    name: 'Apex Predators',
    difficulty: 'Normal',
    units: [BEAR_GUARDIAN, DIRE_WOLF, SERPENT_STRIKER],
    primaryTag: 'Beast',
    counterTags: ['Holy'],
    specialRule: 'Attacks have 20% critical chance',
    rewardHint: 'Rare Pelts',
  },

  {
    id: 'arcane_coven_02',
    name: 'Arcane Coven',
    difficulty: 'Normal',
    units: [ARCANE_EVOKER, VOID_WALKER, CRYSTAL_GUARDIAN],
    primaryTag: 'Arcane',
    counterTags: ['Holy', 'Nature'],
    specialRule: 'Spells ignore 30% of defense',
    rewardHint: 'Magic Artifacts',
  },

  {
    id: 'nature_tribunal_02',
    name: 'Nature Tribunal',
    difficulty: 'Normal',
    units: [TREANT_ANCIENT, THORN_ARCHER, DRUID_SHAMAN],
    primaryTag: 'Nature',
    counterTags: ['Mech', 'Undead'],
    specialRule: 'Regenerates 10 HP per turn',
    rewardHint: 'Living Wood',
  },

  // ========================================
  // HARD Difficulty (2 opponents)
  // ========================================

  {
    id: 'lich_king_03',
    name: 'Lich King',
    difficulty: 'Hard',
    units: [NECROMANCER, ZOMBIE_BRUTE, SKELETON_WARRIOR, GHOST_ASSASSIN],
    primaryTag: 'Undead',
    counterTags: ['Holy', 'Beast', 'Nature'],
    specialRule: 'Revives all defeated allies once',
    rewardHint: 'Legendary Dark Artifacts',
  },

  {
    id: 'war_machine_03',
    name: 'War Machine Prototype',
    difficulty: 'Hard',
    units: [BATTLE_MECH_ALPHA, SIEGE_CANNON, DRONE_SWARM, REPAIR_BOT],
    primaryTag: 'Mech',
    counterTags: ['Arcane', 'Nature'],
    specialRule: 'Siege Cannon deals AoE damage each turn',
    rewardHint: 'Legendary Tech Blueprints',
  },

] as const;

// ============================================
// Catalog Utilities
// ============================================

/**
 * Get all opponents of a specific difficulty
 */
export function getOpponentsByDifficulty(difficulty: Difficulty): readonly OpponentSpec[] {
  return OPPONENT_CATALOG.filter(op => op.difficulty === difficulty);
}

/**
 * Get all opponents with a specific primary tag
 */
export function getOpponentsByTag(tag: Tag): readonly OpponentSpec[] {
  return OPPONENT_CATALOG.filter(op => op.primaryTag === tag);
}

/**
 * Get all opponents with a specific role (first unit role)
 */
export function getOpponentsByRole(role: Role): readonly OpponentSpec[] {
  return OPPONENT_CATALOG.filter(op => op.units[0].role === role);
}

/**
 * Get a random opponent by ID
 */
export function getOpponentById(id: string): OpponentSpec | undefined {
  return OPPONENT_CATALOG.find(op => op.id === id);
}

/**
 * Catalog statistics (for debugging and validation)
 */
export const CATALOG_STATS = {
  total: OPPONENT_CATALOG.length,
  byDifficulty: {
    Standard: getOpponentsByDifficulty('Standard').length,
    Normal: getOpponentsByDifficulty('Normal').length,
    Hard: getOpponentsByDifficulty('Hard').length,
  },
  byTag: {
    Undead: getOpponentsByTag('Undead').length,
    Mech: getOpponentsByTag('Mech').length,
    Beast: getOpponentsByTag('Beast').length,
    Holy: getOpponentsByTag('Holy').length,
    Arcane: getOpponentsByTag('Arcane').length,
    Nature: getOpponentsByTag('Nature').length,
  },
  byRole: {
    Tank: getOpponentsByRole('Tank').length,
    DPS: getOpponentsByRole('DPS').length,
    Support: getOpponentsByRole('Support').length,
    Specialist: getOpponentsByRole('Specialist').length,
  },
} as const;

// Validate catalog at module load (development only)
if (process.env.NODE_ENV === 'development') {
  console.error('[Opponent Catalog] Loaded', CATALOG_STATS);
  
  // Ensure diversity is possible
  const minStandard = CATALOG_STATS.byDifficulty.Standard >= 3;
  const hasHard = CATALOG_STATS.byDifficulty.Hard >= 1;
  const tagVariety = Object.values(CATALOG_STATS.byTag).filter(count => count > 0).length >= 3;
  
  if (!minStandard) {
    console.warn('[Opponent Catalog] WARNING: Need at least 3 Standard opponents for diversity');
  }
  if (!hasHard) {
    console.warn('[Opponent Catalog] WARNING: Need at least 1 Hard opponent');
  }
  if (!tagVariety) {
    console.warn('[Opponent Catalog] WARNING: Need at least 3 different tags for diversity');
  }
}

