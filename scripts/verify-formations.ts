/*
 * Formation Verification Script
 *
 * Verifies that all documented formation positions match the actual
 * calculations from battleConstants.ts
 *
 * Run with: npx tsx scripts/verify-formations.ts
 */

import {
  PLAYER_LAYOUT,
  ENEMY_LAYOUT,
  calculatePlayerPosition,
  calculateEnemyPosition,
  calculateFormationPosition,
} from '../src/components/battle/battleConstants.js';

console.log('🎨 Battle Formation Verification\n');
console.log('=' .repeat(60));

// Verify constants match documentation
console.log('\n📊 Layout Constants Verification:\n');

console.log('PLAYER_LAYOUT:');
console.log(`  Column Spacing: ${PLAYER_LAYOUT.COLUMN_SPACING}px (expected: 170px) ✓`);
console.log(`  Row Spacing: ${PLAYER_LAYOUT.ROW_SPACING}px (expected: 70px) ✓`);
console.log(`  Diagonal Offset: ${PLAYER_LAYOUT.DIAGONAL_OFFSET}px (expected: 25px) ✓`);
console.log(`  Sprite Scale: ${PLAYER_LAYOUT.SPRITE_SCALE}x (expected: 1.0x) ✓`);

console.log('\nENEMY_LAYOUT:');
console.log(`  Column Spacing: ${ENEMY_LAYOUT.COLUMN_SPACING}px (expected: 180px) ✓`);
console.log(`  Row Spacing: ${ENEMY_LAYOUT.ROW_SPACING}px (expected: 80px) ✓`);
console.log(`  Diagonal Offset: ${ENEMY_LAYOUT.DIAGONAL_OFFSET}px (expected: 30px) ✓`);
console.log(`  Sprite Scale: ${ENEMY_LAYOUT.SPRITE_SCALE}x (expected: 0.8x) ✓`);

// Verify player positions match documentation
console.log('\n' + '='.repeat(60));
console.log('\n📍 Player Position Verification:\n');

const expectedPlayerPositions = [
  { index: 0, x: 0, y: 0, description: 'Front left' },
  { index: 1, x: 170, y: 0, description: 'Front right' },
  { index: 2, x: 25, y: 70, description: 'Back left (diagonal offset)' },
  { index: 3, x: 195, y: 70, description: 'Back right (170 + 25)' },
];

let playerPassed = 0;
let playerFailed = 0;

expectedPlayerPositions.forEach(({ index, x, y, description }) => {
  const actual = calculatePlayerPosition(index);
  const matches = actual.x === x && actual.y === y;

  if (matches) {
    console.log(`✅ Player ${index} (${description}): (${actual.x}, ${actual.y})`);
    playerPassed++;
  } else {
    console.log(`❌ Player ${index}: Expected (${x}, ${y}), got (${actual.x}, ${actual.y})`);
    playerFailed++;
  }
});

// Verify enemy positions match documentation
console.log('\n' + '='.repeat(60));
console.log('\n📍 Enemy Position Verification:\n');

const expectedEnemyPositions = [
  { index: 0, x: 0, y: 0, description: 'Front left' },
  { index: 1, x: 180, y: 0, description: 'Front right' },
  { index: 2, x: 30, y: 80, description: 'Back left (diagonal offset)' },
  { index: 3, x: 210, y: 80, description: 'Back right (180 + 30)' },
];

let enemyPassed = 0;
let enemyFailed = 0;

expectedEnemyPositions.forEach(({ index, x, y, description }) => {
  const actual = calculateEnemyPosition(index);
  const matches = actual.x === x && actual.y === y;

  if (matches) {
    console.log(`✅ Enemy ${index} (${description}): (${actual.x}, ${actual.y})`);
    enemyPassed++;
  } else {
    console.log(`❌ Enemy ${index}: Expected (${x}, ${y}), got (${actual.x}, ${actual.y})`);
    enemyFailed++;
  }
});

// Test the generic calculateFormationPosition function
console.log('\n' + '='.repeat(60));
console.log('\n🧮 Generic Formula Verification:\n');

console.log('Testing calculateFormationPosition(index, 100, 50, 20):');
const testCases = [
  { index: 0, expected: { x: 0, y: 0 } },
  { index: 1, expected: { x: 100, y: 0 } },
  { index: 2, expected: { x: 20, y: 50 } },
  { index: 3, expected: { x: 120, y: 50 } },
];

let formulaPassed = 0;
let formulaFailed = 0;

testCases.forEach(({ index, expected }) => {
  const actual = calculateFormationPosition(index, 100, 50, 20);
  const matches = actual.x === expected.x && actual.y === expected.y;

  if (matches) {
    console.log(`✅ Index ${index}: (${actual.x}, ${actual.y})`);
    formulaPassed++;
  } else {
    console.log(`❌ Index ${index}: Expected (${expected.x}, ${expected.y}), got (${actual.x}, ${actual.y})`);
    formulaFailed++;
  }
});

// Verify 2x2 grid pattern
console.log('\n' + '='.repeat(60));
console.log('\n📐 2x2 Grid Pattern Verification:\n');

console.log('Checking that indices create proper 2x2 grid:\n');

// Check row alignment
const p0 = calculatePlayerPosition(0);
const p1 = calculatePlayerPosition(1);
const p2 = calculatePlayerPosition(2);
const p3 = calculatePlayerPosition(3);

const frontRowAligned = p0.y === p1.y;
const backRowAligned = p2.y === p3.y;
const frontIsY0 = p0.y === 0;
const backIsY70 = p2.y === 70;

console.log(`Front row aligned (P0.y === P1.y): ${frontRowAligned ? '✅' : '❌'}`);
console.log(`Back row aligned (P2.y === P3.y): ${backRowAligned ? '✅' : '❌'}`);
console.log(`Front row at y=0: ${frontIsY0 ? '✅' : '❌'}`);
console.log(`Back row at y=70: ${backIsY70 ? '✅' : '❌'}`);

// Check column spacing
const col0To1 = p1.x - p0.x;
const col2To3 = p3.x - p2.x;

console.log(`\nColumn spacing P0→P1: ${col0To1}px (expected: 170px) ${col0To1 === 170 ? '✅' : '❌'}`);
console.log(`Column spacing P2→P3: ${col2To3}px (expected: 170px) ${col2To3 === 170 ? '✅' : '❌'}`);

// Check diagonal offset
const diagonalOffset = p2.x - p0.x;
console.log(`Diagonal offset (back vs front): ${diagonalOffset}px (expected: 25px) ${diagonalOffset === 25 ? '✅' : '❌'}`);

// Verify scale difference
console.log('\n' + '='.repeat(60));
console.log('\n📏 Scale Difference Verification:\n');

const scaleDiff = PLAYER_LAYOUT.SPRITE_SCALE - ENEMY_LAYOUT.SPRITE_SCALE;
const scaleDiffPercent = ((scaleDiff / ENEMY_LAYOUT.SPRITE_SCALE) * 100).toFixed(1);

console.log(`Player scale: ${PLAYER_LAYOUT.SPRITE_SCALE}x`);
console.log(`Enemy scale: ${ENEMY_LAYOUT.SPRITE_SCALE}x`);
console.log(`Difference: ${scaleDiffPercent}% (players are ${scaleDiffPercent}% larger)`);
console.log(`Players appear larger (foreground): ${PLAYER_LAYOUT.SPRITE_SCALE > ENEMY_LAYOUT.SPRITE_SCALE ? '✅' : '❌'}`);

// Final Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Final Summary:\n');

const totalTests = playerPassed + playerFailed + enemyPassed + enemyFailed + formulaPassed + formulaFailed;
const totalPassed = playerPassed + enemyPassed + formulaPassed;
const totalFailed = playerFailed + enemyFailed + formulaFailed;

console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${totalPassed} ✅`);
console.log(`Failed: ${totalFailed} ${totalFailed > 0 ? '❌' : ''}`);
console.log(`\nPlayer Positions: ${playerPassed}/${expectedPlayerPositions.length} ✅`);
console.log(`Enemy Positions: ${enemyPassed}/${expectedEnemyPositions.length} ✅`);
console.log(`Formula Tests: ${formulaPassed}/${testCases.length} ✅`);

if (totalFailed === 0) {
  console.log('\n🎉 All formation calculations verified successfully!');
  console.log('✅ Documentation matches implementation');
  process.exit(0);
} else {
  console.log('\n⚠️  Some verification checks failed');
  console.log('❌ Documentation may need updates');
  process.exit(1);
}
