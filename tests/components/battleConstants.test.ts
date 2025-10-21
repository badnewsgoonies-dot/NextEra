/*
 * Battle Constants Tests
 * Tests for layout calculation helpers and constant values
 */

import { describe, test, expect } from 'vitest';
import {
  ENEMY_LAYOUT,
  PLAYER_LAYOUT,
  ANIMATION_TIMING,
  ACTIVE_UNIT_EFFECTS,
  TARGET_EFFECTS,
  HP_BAR_SIZE,
  calculateFormationPosition,
  calculateEnemyPosition,
  calculatePlayerPosition,
} from '../../src/components/battle/battleConstants.js';

describe('Battle Constants', () => {
  describe('Layout Constants', () => {
    test('ENEMY_LAYOUT has valid values', () => {
      expect(ENEMY_LAYOUT.COLUMN_SPACING).toBe(180);
      expect(ENEMY_LAYOUT.ROW_SPACING).toBe(80);
      expect(ENEMY_LAYOUT.DIAGONAL_OFFSET).toBe(30);
      expect(ENEMY_LAYOUT.SPRITE_SCALE).toBe(0.8);
      expect(ENEMY_LAYOUT.TOP_OFFSET).toBe('top-20 md:top-24');
      expect(ENEMY_LAYOUT.RIGHT_OFFSET).toBe('right-12 md:right-20 lg:right-32');
    });

    test('PLAYER_LAYOUT has valid values', () => {
      expect(PLAYER_LAYOUT.COLUMN_SPACING).toBe(170);
      expect(PLAYER_LAYOUT.ROW_SPACING).toBe(70);
      expect(PLAYER_LAYOUT.DIAGONAL_OFFSET).toBe(25);
      expect(PLAYER_LAYOUT.SPRITE_SCALE).toBe(1.0);
      expect(PLAYER_LAYOUT.BOTTOM_OFFSET).toBe('bottom-20 md:bottom-24');
      expect(PLAYER_LAYOUT.LEFT_OFFSET).toBe('left-8 md:left-16 lg:left-24');
    });

    test('enemy sprites are scaled smaller than player sprites', () => {
      // Enemies should appear smaller (background)
      expect(ENEMY_LAYOUT.SPRITE_SCALE).toBeLessThan(PLAYER_LAYOUT.SPRITE_SCALE);
    });
  });

  describe('Animation Timing Constants', () => {
    test('ANIMATION_TIMING has valid durations', () => {
      expect(ANIMATION_TIMING.ATTACK_START_DELAY).toBe(0);
      expect(ANIMATION_TIMING.DAMAGE_APPLY_DELAY).toBe(400);
      expect(ANIMATION_TIMING.ATTACK_TOTAL_DURATION).toBe(800);
      expect(ANIMATION_TIMING.ATTACK_EFFECT_DURATION).toBe(800);
      expect(ANIMATION_TIMING.ENEMY_TURN_DELAY).toBe(100);
    });

    test('damage applies before animation completes', () => {
      expect(ANIMATION_TIMING.DAMAGE_APPLY_DELAY).toBeLessThan(
        ANIMATION_TIMING.ATTACK_TOTAL_DURATION
      );
    });
  });

  describe('Visual Effect Constants', () => {
    test('HP_BAR_SIZE has valid values', () => {
      expect(HP_BAR_SIZE.WIDTH_SM).toBe(144);
      expect(HP_BAR_SIZE.WIDTH_MD).toBe(160);
      expect(HP_BAR_SIZE.MARGIN_TOP).toBe(12);
    });

    test('ACTIVE_UNIT_EFFECTS has valid values', () => {
      expect(ACTIVE_UNIT_EFFECTS.PLAYER_SCALE).toBe('115');
      expect(ACTIVE_UNIT_EFFECTS.ENEMY_SCALE).toBe('110');
      expect(ACTIVE_UNIT_EFFECTS.BRIGHTNESS).toBe('125');
      expect(ACTIVE_UNIT_EFFECTS.PLAYER_GLOW).toBe('rgba(255,215,0,1)');
      expect(ACTIVE_UNIT_EFFECTS.PLAYER_GLOW_RADIUS).toBe(35);
      expect(ACTIVE_UNIT_EFFECTS.ENEMY_GLOW).toBe('rgba(255,100,100,1)');
      expect(ACTIVE_UNIT_EFFECTS.ENEMY_GLOW_RADIUS).toBe(30);
    });

    test('TARGET_EFFECTS has valid values', () => {
      expect(TARGET_EFFECTS.RING_WIDTH).toBe(4);
      expect(TARGET_EFFECTS.RING_OFFSET).toBe(2);
      expect(TARGET_EFFECTS.PLAYER_RING_COLOR).toBe('ring-yellow-400');
      expect(TARGET_EFFECTS.ENEMY_RING_COLOR).toBe('ring-red-500');
    });
  });

  describe('calculateFormationPosition()', () => {
    test('unit 0 is at origin (0, 0)', () => {
      const pos = calculateFormationPosition(0, 100, 50, 20);
      expect(pos).toEqual({ x: 0, y: 0 });
    });

    test('unit 1 is in same row, next column', () => {
      const pos = calculateFormationPosition(1, 100, 50, 20);
      // col=1, row=0: x = 1*100 + 0*20 = 100, y = 0*50 = 0
      expect(pos).toEqual({ x: 100, y: 0 });
    });

    test('unit 2 is in next row, first column (diagonal offset)', () => {
      const pos = calculateFormationPosition(2, 100, 50, 20);
      // col=0, row=1: x = 0*100 + 1*20 = 20, y = 1*50 = 50
      expect(pos).toEqual({ x: 20, y: 50 });
    });

    test('unit 3 is in next row, second column (diagonal)', () => {
      const pos = calculateFormationPosition(3, 100, 50, 20);
      // col=1, row=1: x = 1*100 + 1*20 = 120, y = 1*50 = 50
      expect(pos).toEqual({ x: 120, y: 50 });
    });

    test('creates 2x2 grid formation', () => {
      const positions = [0, 1, 2, 3].map(i =>
        calculateFormationPosition(i, 100, 50, 20)
      );

      // Row 0: units 0 and 1
      expect(positions[0].y).toBe(positions[1].y);
      expect(positions[0].y).toBe(0);

      // Row 1: units 2 and 3
      expect(positions[2].y).toBe(positions[3].y);
      expect(positions[2].y).toBe(50);

      // Column spacing
      expect(positions[1].x - positions[0].x).toBe(100);
      expect(positions[3].x - positions[2].x).toBe(100);
    });

    test('diagonal offset creates depth effect', () => {
      const pos0 = calculateFormationPosition(0, 100, 50, 20);
      const pos2 = calculateFormationPosition(2, 100, 50, 20);

      // Back row shifted right by diagonal offset
      expect(pos2.x).toBe(20); // diagonal offset
      expect(pos0.x).toBe(0);
    });

    test('handles single unit (index 0)', () => {
      const pos = calculateFormationPosition(0, 200, 100, 30);
      expect(pos).toEqual({ x: 0, y: 0 });
    });

    test('handles two units (indexes 0-1)', () => {
      const pos0 = calculateFormationPosition(0, 200, 100, 30);
      const pos1 = calculateFormationPosition(1, 200, 100, 30);

      expect(pos0).toEqual({ x: 0, y: 0 });
      expect(pos1).toEqual({ x: 200, y: 0 }); // Same row, next column
    });

    test('supports more than 4 units (wraps to additional rows)', () => {
      // Unit 4 should be in row 2, column 0
      const pos = calculateFormationPosition(4, 100, 50, 20);
      // col=0, row=2: x = 0*100 + 2*20 = 40, y = 2*50 = 100
      expect(pos).toEqual({ x: 40, y: 100 });
    });
  });

  describe('calculateEnemyPosition()', () => {
    test('uses enemy layout constants', () => {
      const pos0 = calculateEnemyPosition(0);
      const pos1 = calculateEnemyPosition(1);

      // Should use ENEMY_LAYOUT.COLUMN_SPACING
      expect(pos1.x - pos0.x).toBe(ENEMY_LAYOUT.COLUMN_SPACING);
    });

    test('creates proper formation for 1 enemy', () => {
      const pos = calculateEnemyPosition(0);
      expect(pos).toEqual({ x: 0, y: 0 });
    });

    test('creates proper formation for 2 enemies', () => {
      const pos0 = calculateEnemyPosition(0);
      const pos1 = calculateEnemyPosition(1);

      expect(pos0).toEqual({ x: 0, y: 0 });
      expect(pos1.x).toBe(ENEMY_LAYOUT.COLUMN_SPACING);
      expect(pos1.y).toBe(0);
    });

    test('creates proper formation for 3 enemies', () => {
      const positions = [0, 1, 2].map(i => calculateEnemyPosition(i));

      // Units 0-1 in front row
      expect(positions[0].y).toBe(0);
      expect(positions[1].y).toBe(0);

      // Unit 2 in back row
      expect(positions[2].y).toBe(ENEMY_LAYOUT.ROW_SPACING);
      expect(positions[2].x).toBe(ENEMY_LAYOUT.DIAGONAL_OFFSET);
    });

    test('creates proper formation for 4 enemies', () => {
      const positions = [0, 1, 2, 3].map(i => calculateEnemyPosition(i));

      // Front row: 0, 1
      expect(positions[0]).toEqual({ x: 0, y: 0 });
      expect(positions[1]).toEqual({ x: ENEMY_LAYOUT.COLUMN_SPACING, y: 0 });

      // Back row: 2, 3 (with diagonal offset)
      expect(positions[2]).toEqual({
        x: ENEMY_LAYOUT.DIAGONAL_OFFSET,
        y: ENEMY_LAYOUT.ROW_SPACING,
      });
      expect(positions[3]).toEqual({
        x: ENEMY_LAYOUT.COLUMN_SPACING + ENEMY_LAYOUT.DIAGONAL_OFFSET,
        y: ENEMY_LAYOUT.ROW_SPACING,
      });
    });
  });

  describe('calculatePlayerPosition()', () => {
    test('uses player layout constants', () => {
      const pos0 = calculatePlayerPosition(0);
      const pos1 = calculatePlayerPosition(1);

      // Should use PLAYER_LAYOUT.COLUMN_SPACING
      expect(pos1.x - pos0.x).toBe(PLAYER_LAYOUT.COLUMN_SPACING);
    });

    test('creates proper formation for 1 player', () => {
      const pos = calculatePlayerPosition(0);
      expect(pos).toEqual({ x: 0, y: 0 });
    });

    test('creates proper formation for 4 players', () => {
      const positions = [0, 1, 2, 3].map(i => calculatePlayerPosition(i));

      // Front row: 0, 1
      expect(positions[0]).toEqual({ x: 0, y: 0 });
      expect(positions[1]).toEqual({ x: PLAYER_LAYOUT.COLUMN_SPACING, y: 0 });

      // Back row: 2, 3 (with diagonal offset)
      expect(positions[2]).toEqual({
        x: PLAYER_LAYOUT.DIAGONAL_OFFSET,
        y: PLAYER_LAYOUT.ROW_SPACING,
      });
      expect(positions[3]).toEqual({
        x: PLAYER_LAYOUT.COLUMN_SPACING + PLAYER_LAYOUT.DIAGONAL_OFFSET,
        y: PLAYER_LAYOUT.ROW_SPACING,
      });
    });
  });

  describe('Formation Consistency', () => {
    test('player and enemy formations have similar structure', () => {
      const playerPos = [0, 1, 2, 3].map(i => calculatePlayerPosition(i));
      const enemyPos = [0, 1, 2, 3].map(i => calculateEnemyPosition(i));

      // Both should be 2x2 grids with diagonal offset
      // Check row structure is consistent
      expect(playerPos[0].y).toBe(playerPos[1].y); // Row 0
      expect(playerPos[2].y).toBe(playerPos[3].y); // Row 1
      expect(enemyPos[0].y).toBe(enemyPos[1].y); // Row 0
      expect(enemyPos[2].y).toBe(enemyPos[3].y); // Row 1
    });

    test('formations are deterministic', () => {
      // Same index should always produce same position
      const pos1a = calculatePlayerPosition(2);
      const pos1b = calculatePlayerPosition(2);
      expect(pos1a).toEqual(pos1b);

      const pos2a = calculateEnemyPosition(3);
      const pos2b = calculateEnemyPosition(3);
      expect(pos2a).toEqual(pos2b);
    });
  });

  describe('Edge Cases', () => {
    test('handles index 0 correctly', () => {
      expect(calculateFormationPosition(0, 100, 50, 20)).toEqual({ x: 0, y: 0 });
      expect(calculatePlayerPosition(0)).toEqual({ x: 0, y: 0 });
      expect(calculateEnemyPosition(0)).toEqual({ x: 0, y: 0 });
    });

    test('handles large indexes (5+ units)', () => {
      // Should continue pattern without errors
      const pos5 = calculateFormationPosition(5, 100, 50, 20);
      expect(pos5.x).toBeGreaterThanOrEqual(0);
      expect(pos5.y).toBeGreaterThanOrEqual(0);

      const pos7 = calculatePlayerPosition(7);
      expect(pos7.x).toBeGreaterThanOrEqual(0);
      expect(pos7.y).toBeGreaterThanOrEqual(0);
    });

    test('all positions are non-negative', () => {
      for (let i = 0; i < 8; i++) {
        const playerPos = calculatePlayerPosition(i);
        const enemyPos = calculateEnemyPosition(i);

        expect(playerPos.x).toBeGreaterThanOrEqual(0);
        expect(playerPos.y).toBeGreaterThanOrEqual(0);
        expect(enemyPos.x).toBeGreaterThanOrEqual(0);
        expect(enemyPos.y).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
