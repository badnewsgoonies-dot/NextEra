/*
 * Golden Sun Sprite Registry
 * 
 * Complete mapping of game units to authentic Golden Sun sprites
 * Supports multiple weapons, animation states, and fallback system
 */

import type { Role } from '../types/game.js';

// ============================================
// Sprite Animation States
// ============================================

export type SpriteAnimState = 
  | 'idle'      // Standing/waiting
  | 'attack1'   // First attack frame
  | 'attack2'   // Second attack frame
  | 'hit'       // Taking damage
  | 'downed'    // Defeated/KO
  | 'cast1'     // Spell casting frame 1
  | 'cast2';    // Spell casting frame 2

export type WeaponType = 
  | 'lSword'    // Long sword
  | 'Axe'       // Axe
  | 'lBlade'    // Long blade
  | 'Mace';     // Mace

// ============================================
// Sprite Set Definition
// ============================================

export interface SpriteSet {
  readonly idle: string;
  readonly attack1: string;
  readonly attack2: string;
  readonly hit: string;
  readonly downed: string;
  readonly cast1?: string;
  readonly cast2?: string;
}

export interface CharacterSpriteMapping {
  readonly gsCharacter: string; // Golden Sun character name
  readonly defaultWeapon: WeaponType;
  readonly availableWeapons: readonly WeaponType[];
}

// ============================================
// Character Mappings (12 Starter Units → GS Characters)
// ============================================

export const UNIT_TO_GS_CHARACTER: Record<string, CharacterSpriteMapping> = {
  // === TANKS ===
  'Warrior': { 
    gsCharacter: 'isaac', 
    defaultWeapon: 'lSword', 
    availableWeapons: ['lSword', 'Axe', 'lBlade'] 
  },
  'Guardian': { 
    gsCharacter: 'garet', 
    defaultWeapon: 'Axe', 
    availableWeapons: ['Axe', 'Mace'] 
  },
  'Paladin': { 
    gsCharacter: 'felix', 
    defaultWeapon: 'lSword', 
    availableWeapons: ['lSword', 'lBlade'] 
  },

  // === DPS ===
  'Rogue': { 
    gsCharacter: 'ivan', 
    defaultWeapon: 'lBlade', 
    availableWeapons: ['lBlade'] 
  },
  'Mage': { 
    gsCharacter: 'ivan', 
    defaultWeapon: 'lBlade', 
    availableWeapons: ['lBlade'] 
  },
  'Ranger': { 
    gsCharacter: 'piers', 
    defaultWeapon: 'lSword', 
    availableWeapons: ['lSword', 'Mace'] 
  },

  // === SUPPORT ===
  'Cleric': { 
    gsCharacter: 'mia', 
    defaultWeapon: 'Mace', 
    availableWeapons: ['Mace'] 
  },
  'Shaman': { 
    gsCharacter: 'jenna_gs2', 
    defaultWeapon: 'lBlade', 
    availableWeapons: ['lBlade'] 
  },
  'Bard': { 
    gsCharacter: 'sheba', 
    defaultWeapon: 'Mace', 
    availableWeapons: ['Mace'] 
  },

  // === SPECIALISTS ===
  'Necromancer': { 
    gsCharacter: 'felix', 
    defaultWeapon: 'lBlade', 
    availableWeapons: ['lBlade', 'lSword'] 
  },
  'Engineer': { 
    gsCharacter: 'piers', 
    defaultWeapon: 'Mace', 
    availableWeapons: ['Mace', 'lSword'] 
  },
  'Summoner': { 
    gsCharacter: 'sheba', 
    defaultWeapon: 'Mace', 
    availableWeapons: ['Mace'] 
  },
};

// ============================================
// Enemy Sprite Mappings (19 Enemies → GS Sprites)
// ============================================

export const ENEMY_SPRITE_MAP: Record<string, string> = {
  // UNDEAD FACTION (4 enemies)
  'Skeleton Warrior': 'Undead',
  'Zombie Brute': 'Ghoul',
  'Necromancer': 'Ghost_Mage',
  'Ghost Assassin': 'Vile_Dirge',

  // MECH FACTION (4 enemies) - Using construct/golem sprites
  'Battle Mech Alpha': 'Golem',
  'Drone Swarm': 'Flash_Ant',
  'Repair Bot': 'Mimic',
  'Siege Cannon': 'Cerebus',

  // BEAST FACTION (3 enemies)
  'Dire Wolf': 'Wild_Wolf',
  'Bear Guardian': 'Wolfkin',
  'Serpent Striker': 'Creeper',

  // HOLY FACTION (3 enemies) - Using divine/knight sprites
  'Paladin Knight': 'Minotaurus',
  'Cleric Healer': 'Faery',
  'Holy Avenger': 'Gargoyle',

  // ARCANE FACTION (3 enemies) - Using magical creatures
  'Arcane Evoker': 'Gnome_Wizard',
  'Void Walker': 'Ghost_Mage',
  'Crystal Guardian': 'Grand_Chimera',

  // NATURE FACTION (3 enemies)
  'Treant Ancient': 'Mad_Plant',
  'Thorn Archer': 'Hobgoblin',
  'Druid Shaman': 'Amaze',
};

// Role-based fallbacks for unmapped enemies
const ROLE_FALLBACK_SPRITES: Record<Role, string> = {
  Tank: 'Brigand',
  DPS: 'Goblin',
  Support: 'Gnome_Wizard',
  Specialist: 'Mimic',
};

// ============================================
// Battle Backgrounds (72 total)
// ============================================

export const BATTLE_BACKGROUNDS = [
  // GS1 Backgrounds (3 for now as requested)
  '/sprites/golden-sun/backgrounds/gs1/Cave.gif',
  '/sprites/golden-sun/backgrounds/gs1/Desert.gif',
  '/sprites/golden-sun/backgrounds/gs1/Sol_Sanctum.gif',
  // More can be added later
];

// Tag-based background mapping for thematic battles
const BG_BY_TAG: Record<string, string[]> = {
  Undead: ['/sprites/golden-sun/backgrounds/gs1/Sol_Sanctum.gif'], // Dark temple
  Beast: ['/sprites/golden-sun/backgrounds/gs1/Cave.gif'], // Natural cave
  Mech: ['/sprites/golden-sun/backgrounds/gs1/Desert.gif'], // Barren mechanical
  Holy: ['/sprites/golden-sun/backgrounds/gs1/Sol_Sanctum.gif'], // Sacred temple
  Arcane: ['/sprites/golden-sun/backgrounds/gs1/Sol_Sanctum.gif'], // Mystical temple
  Nature: ['/sprites/golden-sun/backgrounds/gs1/Cave.gif'], // Natural environment
};

// ============================================
// Sprite Path Builders
// ============================================

/**
 * Get sprite path for party member
 */
export function getPartySpriteSet(
  unitName: string,
  weapon: WeaponType
): SpriteSet | null {
  const mapping = UNIT_TO_GS_CHARACTER[unitName];
  if (!mapping) return null;

  const char = mapping.gsCharacter; // e.g., 'jenna_gs2', 'isaac', 'mia'
  const basePath = `/sprites/golden-sun/battle/party/${char}`;

  // Extract display name (part before underscore for files like jenna_gs2 -> Jenna)
  // Filenames use just 'Jenna_*' not 'Jenna_gs2_*'
  const displayStem = char.includes('_') ? char.split('_')[0] : char;
  const charName = displayStem.charAt(0).toUpperCase() + displayStem.slice(1);

  return {
    idle: `${basePath}/${charName}_${weapon}_Front.gif`,
    attack1: `${basePath}/${charName}_${weapon}_Attack1.gif`,
    attack2: `${basePath}/${charName}_${weapon}_Attack2.gif`,
    hit: `${basePath}/${charName}_${weapon}_HitFront.gif`,
    downed: `${basePath}/${charName}_${weapon}_DownedFront.gif`,
    cast1: `${basePath}/${charName}_${weapon}_CastFront1.gif`,
    cast2: `${basePath}/${charName}_${weapon}_CastFront2.gif`,
  };
}

/**
 * Get sprite path for enemy
 */
export function getEnemySprite(unitName: string, role: Role): string {
  // Try direct mapping first
  const mappedSprite = ENEMY_SPRITE_MAP[unitName];
  if (mappedSprite) {
    return `/sprites/golden-sun/battle/enemies/${mappedSprite}.gif`;
  }

  // Fall back to role-based sprite
  const fallbackSprite = ROLE_FALLBACK_SPRITES[role];
  return `/sprites/golden-sun/battle/enemies/${fallbackSprite}.gif`;
}

/**
 * Get battle background (deterministic based on battle index)
 */
export function getBattleBackground(battleIndex: number): string {
  if (BATTLE_BACKGROUNDS.length === 0) {
    return '/sprites/golden-sun/backgrounds/gs1/Cave.gif'; // Safe default
  }

  const index = battleIndex % BATTLE_BACKGROUNDS.length;
  return BATTLE_BACKGROUNDS[index];
}

/**
 * Get weapon for unit (can be extended with equipment system)
 */
export function getUnitWeapon(unitName: string): WeaponType {
  const mapping = UNIT_TO_GS_CHARACTER[unitName];
  return mapping?.defaultWeapon || 'lSword';
}

/**
 * Get battle background based on enemy tags (thematic matching)
 * Falls back to deterministic selection if no tag match
 */
export function getBattleBackgroundForTags(tags: readonly string[], fallbackIndex: number): string {
  // Try to find a background that matches one of the enemy's tags
  for (const tag of tags) {
    const options = BG_BY_TAG[tag];
    if (options && options.length > 0) {
      // Use first tag match (could be randomized if desired)
      return options[0];
    }
  }
  
  // Fall back to deterministic rotation
  return getBattleBackground(fallbackIndex);
}

// ============================================
// Sprite Preloading
// ============================================

export async function preloadSprite(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export async function preloadCommonSprites(): Promise<void> {
  const common: string[] = [];

  // Preload all default party sprites (idle + attack)
  Object.entries(UNIT_TO_GS_CHARACTER).forEach(([unitName, mapping]) => {
    const spriteSet = getPartySpriteSet(unitName, mapping.defaultWeapon);
    if (spriteSet) {
      common.push(spriteSet.idle, spriteSet.attack1, spriteSet.attack2);
    }
  });

  // Preload common enemy sprites
  const commonEnemies = ['Goblin', 'Undead', 'Wild_Wolf', 'Brigand', 'Ooze'];
  commonEnemies.forEach(sprite => {
    common.push(`/sprites/golden-sun/battle/enemies/${sprite}.gif`);
  });

  // Preload first 5 backgrounds
  common.push(...BATTLE_BACKGROUNDS.slice(0, 5));

  // Load all in parallel
  await Promise.allSettled(common.map(preloadSprite));
}

