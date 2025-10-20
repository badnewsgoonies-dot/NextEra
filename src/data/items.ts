/*
 * Items Catalog
 * 
 * 30 items: Weapons, Armor, Accessories, Consumables
 * Used for battle rewards and equipment
 * 
 * Distribution:
 * - Weapons: 10 (ATK bonus)
 * - Armor: 10 (DEF bonus)
 * - Accessories: 5 (SPD/special bonuses)
 * - Consumables: 5 (HP restore)
 */

import type { Item } from '../types/game.js';

export const ITEM_CATALOG: readonly Item[] = [
  // WEAPONS (10) - Common: 5, Rare: 3, Epic: 2
  {
    id: 'iron_sword',
    name: 'Iron Sword',
    type: 'weapon',
    rarity: 'common',
    description: 'A sturdy iron blade',
    stats: { atkBonus: 5 },
  },
  {
    id: 'steel_sword',
    name: 'Steel Sword',
    type: 'weapon',
    rarity: 'common',
    description: 'A well-crafted steel weapon',
    stats: { atkBonus: 8 },
  },
  {
    id: 'bronze_axe',
    name: 'Bronze Axe',
    type: 'weapon',
    rarity: 'common',
    description: 'A heavy battle axe',
    stats: { atkBonus: 6 },
  },
  {
    id: 'short_bow',
    name: 'Short Bow',
    type: 'weapon',
    rarity: 'common',
    description: 'A lightweight bow',
    stats: { atkBonus: 7 },
  },
  {
    id: 'wooden_staff',
    name: 'Wooden Staff',
    type: 'weapon',
    rarity: 'common',
    description: 'A simple mage staff',
    stats: { atkBonus: 4 },
  },
  {
    id: 'elven_blade',
    name: 'Elven Blade',
    type: 'weapon',
    rarity: 'rare',
    description: 'A blade forged by elves',
    stats: { atkBonus: 12 },
  },
  {
    id: 'war_hammer',
    name: 'War Hammer',
    type: 'weapon',
    rarity: 'rare',
    description: 'A crushing weapon',
    stats: { atkBonus: 14 },
  },
  {
    id: 'arcane_staff',
    name: 'Arcane Staff',
    type: 'weapon',
    rarity: 'rare',
    description: 'Crackling with magic',
    stats: { atkBonus: 11 },
  },
  {
    id: 'dragon_slayer',
    name: 'Dragon Slayer',
    type: 'weapon',
    rarity: 'epic',
    description: 'A legendary greatsword',
    stats: { atkBonus: 20 },
  },
  {
    id: 'soul_reaper',
    name: 'Soul Reaper',
    type: 'weapon',
    rarity: 'epic',
    description: 'Drains life from enemies',
    stats: { atkBonus: 18 },
  },

  // ARMOR (10) - Common: 5, Rare: 3, Epic: 2
  {
    id: 'leather_armor',
    name: 'Leather Armor',
    type: 'armor',
    rarity: 'common',
    description: 'Basic leather protection',
    stats: { defBonus: 5 },
  },
  {
    id: 'iron_plate',
    name: 'Iron Plate',
    type: 'armor',
    rarity: 'common',
    description: 'Heavy iron plating',
    stats: { defBonus: 8 },
  },
  {
    id: 'chain_mail',
    name: 'Chain Mail',
    type: 'armor',
    rarity: 'common',
    description: 'Interlocking metal rings',
    stats: { defBonus: 6 },
  },
  {
    id: 'padded_vest',
    name: 'Padded Vest',
    type: 'armor',
    rarity: 'common',
    description: 'Lightweight protection',
    stats: { defBonus: 4 },
  },
  {
    id: 'bronze_shield',
    name: 'Bronze Shield',
    type: 'armor',
    rarity: 'common',
    description: 'A sturdy shield',
    stats: { defBonus: 7 },
  },
  {
    id: 'steel_plate',
    name: 'Steel Plate',
    type: 'armor',
    rarity: 'rare',
    description: 'Full steel armor',
    stats: { defBonus: 12 },
  },
  {
    id: 'elven_cloak',
    name: 'Elven Cloak',
    type: 'armor',
    rarity: 'rare',
    description: 'Magically reinforced',
    stats: { defBonus: 10 },
  },
  {
    id: 'tower_shield',
    name: 'Tower Shield',
    type: 'armor',
    rarity: 'rare',
    description: 'Massive defense',
    stats: { defBonus: 14 },
  },
  {
    id: 'dragon_scale',
    name: 'Dragon Scale Armor',
    type: 'armor',
    rarity: 'epic',
    description: 'Crafted from dragon hide',
    stats: { defBonus: 20 },
  },
  {
    id: 'holy_aegis',
    name: 'Holy Aegis',
    type: 'armor',
    rarity: 'epic',
    description: 'Blessed by divine power',
    stats: { defBonus: 18 },
  },

  // ACCESSORIES (5) - Rare: 3, Epic: 2
  {
    id: 'speed_boots',
    name: 'Speed Boots',
    type: 'accessory',
    rarity: 'rare',
    description: 'Increases movement speed',
    stats: { speedBonus: 10 },
  },
  {
    id: 'power_ring',
    name: 'Power Ring',
    type: 'accessory',
    rarity: 'rare',
    description: 'Boosts attack power',
    stats: { atkBonus: 5, speedBonus: 5 },
  },
  {
    id: 'iron_band',
    name: 'Iron Band',
    type: 'accessory',
    rarity: 'rare',
    description: 'Increases endurance',
    stats: { defBonus: 5, speedBonus: 3 },
  },
  {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    type: 'accessory',
    rarity: 'epic',
    description: 'Legendary artifact',
    stats: { atkBonus: 10, defBonus: 10, speedBonus: 15 },
  },
  {
    id: 'titans_belt',
    name: "Titan's Belt",
    type: 'accessory',
    rarity: 'epic',
    description: 'Grants titanic strength',
    stats: { atkBonus: 15, defBonus: 8 },
  },

  // CONSUMABLES (5) - Common: 3, Rare: 2
  {
    id: 'health_potion',
    name: 'Health Potion',
    type: 'consumable',
    rarity: 'common',
    description: 'Restores 50 HP',
    stats: { hpRestore: 50 },
  },
  {
    id: 'mega_potion',
    name: 'Mega Potion',
    type: 'consumable',
    rarity: 'common',
    description: 'Restores 100 HP',
    stats: { hpRestore: 100 },
  },
  {
    id: 'antidote',
    name: 'Antidote',
    type: 'consumable',
    rarity: 'common',
    description: 'Cures poison',
    stats: {},
  },
  {
    id: 'elixir',
    name: 'Elixir',
    type: 'consumable',
    rarity: 'rare',
    description: 'Fully restores HP',
    stats: { hpRestore: 999 },
  },
  {
    id: 'phoenix_down',
    name: 'Phoenix Down',
    type: 'consumable',
    rarity: 'rare',
    description: 'Revives fallen ally',
    stats: { hpRestore: 50 },
  },
];
