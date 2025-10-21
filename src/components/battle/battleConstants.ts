/*
 * Battle Layout Constants
 *
 * Centralized configuration for battlefield positioning, scaling, and timing.
 * Based on Golden Sun's classic JRPG battle layout with diagonal 2x2 formations.
 *
 * These constants replace magic numbers scattered throughout the codebase,
 * making it easier to adjust the visual layout and maintain consistency.
 */

// ============================================
// Unit Positioning & Formation
// ============================================

/**
 * Enemy formation layout (top-right, background)
 * Golden Sun style: enemies appear smaller and higher up
 */
export const ENEMY_LAYOUT = {
  /** Horizontal spacing between columns (px) */
  COLUMN_SPACING: 180,
  /** Vertical spacing between rows (px) */
  ROW_SPACING: 80,
  /** Diagonal offset for depth effect (px) */
  DIAGONAL_OFFSET: 30,
  /** Scale factor for enemy sprites (smaller = background) */
  SPRITE_SCALE: 0.8,
  /** CSS positioning from top edge */
  TOP_OFFSET: 'top-20 md:top-24',
  /** CSS positioning from right edge */
  RIGHT_OFFSET: 'right-12 md:right-20 lg:right-32',
} as const;

/**
 * Player formation layout (bottom-left, foreground)
 * Golden Sun style: player party appears larger and in front
 */
export const PLAYER_LAYOUT = {
  /** Horizontal spacing between columns (px) */
  COLUMN_SPACING: 170,
  /** Vertical spacing between rows (px) */
  ROW_SPACING: 70,
  /** Diagonal offset for depth effect (px) */
  DIAGONAL_OFFSET: 25,
  /** Scale factor for player sprites (larger = foreground) */
  SPRITE_SCALE: 1.0,
  /** CSS positioning from bottom edge */
  BOTTOM_OFFSET: 'bottom-20 md:bottom-24',
  /** CSS positioning from left edge */
  LEFT_OFFSET: 'left-8 md:left-16 lg:left-24',
} as const;

// ============================================
// Animation Timing
// ============================================

/**
 * Animation durations in milliseconds
 */
export const ANIMATION_TIMING = {
  /** Time for attack animation to appear */
  ATTACK_START_DELAY: 0,
  /** Time before damage is applied (mid-animation) */
  DAMAGE_APPLY_DELAY: 400,
  /** Total duration of attack sequence */
  ATTACK_TOTAL_DURATION: 800,
  /** Duration of attack visual effect */
  ATTACK_EFFECT_DURATION: 800,
  /** Delay between enemy turns for readability */
  ENEMY_TURN_DELAY: 100,
} as const;

// ============================================
// Visual Effects
// ============================================

/**
 * HP bar sizing
 */
export const HP_BAR_SIZE = {
  /** Width of HP bar in pixels */
  WIDTH_SM: 144, // w-36 = 144px
  WIDTH_MD: 160, // w-40 = 160px
  /** Spacing above HP bar */
  MARGIN_TOP: 12, // mt-3 = 12px
} as const;

/**
 * Active unit highlight effects
 */
export const ACTIVE_UNIT_EFFECTS = {
  /** Scale multiplier for active player */
  PLAYER_SCALE: '115',
  /** Scale multiplier for active enemy */
  ENEMY_SCALE: '110',
  /** Brightness multiplier for active units */
  BRIGHTNESS: '125',
  /** Glow color for active player (gold) */
  PLAYER_GLOW: 'rgba(255,215,0,1)',
  /** Glow radius for active player (px) */
  PLAYER_GLOW_RADIUS: 35,
  /** Glow color for active enemy (red) */
  ENEMY_GLOW: 'rgba(255,100,100,1)',
  /** Glow radius for active enemy (px) */
  ENEMY_GLOW_RADIUS: 30,
} as const;

/**
 * Target selection ring effects
 */
export const TARGET_EFFECTS = {
  /** Ring width (Tailwind: ring-4) */
  RING_WIDTH: 4,
  /** Ring offset from sprite (Tailwind: ring-offset-2) */
  RING_OFFSET: 2,
  /** Ring color for player targets (yellow) */
  PLAYER_RING_COLOR: 'ring-yellow-400',
  /** Ring color for enemy targets (red) */
  ENEMY_RING_COLOR: 'ring-red-500',
} as const;

// ============================================
// Layout Calculation Helpers
// ============================================

/**
 * Calculate position for a unit in a 2x2 diagonal formation
 *
 * Layout pattern for 4 units:
 * ```
 *   0     2
 *     1     3
 * ```
 * Units 0-1 are in the front row, 2-3 in the back row
 * Each row is offset diagonally for a sense of depth
 *
 * @param index - Unit index (0-3)
 * @param columnSpacing - Horizontal pixels between columns
 * @param rowSpacing - Vertical pixels between rows
 * @param diagonalOffset - Diagonal shift for depth effect
 * @returns {x, y} offset in pixels
 */
export function calculateFormationPosition(
  index: number,
  columnSpacing: number,
  rowSpacing: number,
  diagonalOffset: number
): { x: number; y: number } {
  // 2x2 grid: row 0 has units 0-1, row 1 has units 2-3
  const row = Math.floor(index / 2);
  const col = index % 2;

  return {
    x: col * columnSpacing + row * diagonalOffset,
    y: row * rowSpacing,
  };
}

/**
 * Calculate position for enemy unit (uses ENEMY_LAYOUT constants)
 */
export function calculateEnemyPosition(index: number): { x: number; y: number } {
  return calculateFormationPosition(
    index,
    ENEMY_LAYOUT.COLUMN_SPACING,
    ENEMY_LAYOUT.ROW_SPACING,
    ENEMY_LAYOUT.DIAGONAL_OFFSET
  );
}

/**
 * Calculate position for player unit (uses PLAYER_LAYOUT constants)
 */
export function calculatePlayerPosition(index: number): { x: number; y: number } {
  return calculateFormationPosition(
    index,
    PLAYER_LAYOUT.COLUMN_SPACING,
    PLAYER_LAYOUT.ROW_SPACING,
    PLAYER_LAYOUT.DIAGONAL_OFFSET
  );
}
