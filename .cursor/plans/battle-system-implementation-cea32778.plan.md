<!-- cea32778-23f3-4c88-a81f-4795bca9b525 77021821-2c38-419b-a09d-22f0c5be9f51 -->
# Battle System Implementation Plan

## Phase 1: Type System Updates

### Update `src/types/game.ts`

Add BattleUnit type for mutable combat state and support draw condition:

```typescript
// Add after PlayerUnit definition
export interface BattleUnit {
  readonly id: string;
  readonly name: string;
  readonly role: Role;
  readonly tags: readonly Tag[];
  currentHp: number; // MUTABLE during battle
  readonly maxHp: number;
  readonly atk: number;
  readonly def: number;
  readonly speed: number;
  readonly isPlayer: boolean;
  readonly originalIndex: number; // For deterministic tie-breaking
}
```

Update BattleResult to support draw:

```typescript
// Change winner type
export interface BattleResult {
  readonly winner: 'player' | 'enemy' | 'draw'; // Add 'draw'
  readonly actions: readonly CombatAction[];
  readonly unitsDefeated: readonly string[];
  readonly turnsTaken: number;
}
```

Update state machine for draw transition:

```typescript
// In STATE_TRANSITIONS
battle: ['rewards', 'defeat', 'menu'], // Add 'menu' for draw = instant restart
```

## Phase 2: Battle System Core

### Create `src/systems/BattleSystem.ts`

Implement headless battle engine with:

1. **Constructor**: Take logger and eventLogger
2. **executeBattle()**: Main method

   - Clone playerTeam and convert enemyTeam templates to BattleUnits (mutable)
   - Calculate turn order (speed DESC, player wins ties, then originalIndex)
   - Execute turns up to MAX_TURNS (500)
   - Log all actions with seq numbers
   - Return BattleResult

3. **Helper methods**:

   - `initializeBattleUnits()`: Convert to mutable BattleUnit[]
   - `calculateTurnOrder()`: Sort by speed, break ties deterministically
   - `selectTarget()`: Find lowest HP enemy (deterministic)
   - `calculateDamage()`: `Math.floor(atk - def/2) + rng.int(-2, 2)`, min 1
   - `executeAttack()`: Apply damage, check defeat, return CombatAction
   - `checkVictory()`: Return 'player', 'enemy', 'draw', or null

4. **Constants**:
```typescript
const MAX_BATTLE_TURNS = 500;
```

5. **Turn loop**:
```typescript
let turn = 0;
let seq = 0;
while (turn < MAX_TURNS && !winner) {
  for (const actorId of turnOrder) {
    // Skip if dead
    // Select target (lowest HP enemy)
    // Calculate damage with RNG
    // Apply damage
    // Log action with seq++
    // Check victory
  }
  turn++;
}
if (!winner) winner = 'draw'; // Stalemate
```


## Phase 3: Test Fixtures

### Create `tests/fixtures/battleFixtures.ts`

Mock teams for testing:

```typescript
export const mockPlayerTeam: PlayerUnit[] = [
  { id: 'p1', name: 'Warrior', role: 'Tank', hp: 100, maxHp: 100, atk: 20, def: 15, speed: 40, ... },
  { id: 'p2', name: 'Rogue', role: 'DPS', hp: 60, maxHp: 60, atk: 35, def: 5, speed: 75, ... },
];

export const mockEnemyTemplates: EnemyUnitTemplate[] = [
  { id: 'e1', name: 'Skeleton', role: 'Tank', baseStats: { hp: 80, atk: 15, def: 10, speed: 35 }, ... },
];
```

## Phase 4: Comprehensive Tests

### Create `tests/systems/BattleSystem.test.ts`

Test suites (25+ tests):

1. **Basic Execution** (5 tests)

   - Player wins when all enemies defeated
   - Enemy wins when all players defeated  
   - Draw when MAX_TURNS exceeded
   - Handles empty teams (instant defeat)
   - Handles 1v1, 2v2, 4v4 scenarios

2. **Determinism** (5 tests)

   - Same seed → same outcome
   - Different seeds → different outcomes (likely)
   - Property test: 100 random seeds produce consistent results
   - Turn order deterministic across runs
   - Damage rolls deterministic

3. **Turn Order** (4 tests)

   - Units sorted by speed (highest first)
   - Player wins speed ties
   - originalIndex breaks secondary ties
   - Dead units skipped in turn order

4. **Targeting** (3 tests)

   - Attacks lowest HP enemy
   - Skips dead targets
   - Deterministic selection when HP tied

5. **Damage Calculation** (4 tests)

   - Formula: floor(atk - def/2) + rng(-2, 2)
   - Minimum 1 damage
   - RNG variance tested
   - High def doesn't cause negative damage

6. **Action Logging** (4 tests)

   - All attacks logged with seq numbers
   - Defeats logged
   - Sequence numbers increment correctly
   - No gaps in sequence

## Phase 5: Integration

### Update `src/systems/EventLogger.ts`

Verify these methods exist (they already do per code review):

- `logBattleStarted()`
- `logBattleEnded()`  
- `logBattleDefeat()`

### Update `tests/integration/fullFlow.test.ts`

Add battle integration test:

```typescript
test('full flow: choose opponent → execute battle → verify determinism', async () => {
  // 1. Generate opponents
  // 2. Select one
  // 3. Execute battle
  // 4. Verify same seed = same battle outcome
});
```

## Phase 6: Verification

1. Run all tests: `npm test`
2. Verify 150+ tests passing (25+ new battle tests)
3. Run type-check: `npm run type-check`
4. Property test: 100 seeds × battles = deterministic
5. Commit and push

## Implementation Order

1. Update types (BattleUnit, draw support) - 15 min
2. Create test fixtures - 10 min  
3. Implement BattleSystem.ts - 90 min
4. Write tests (TDD approach) - 60 min
5. Integration test - 20 min
6. Fix any issues - 30 min
7. Documentation - 15 min

**Total: ~3.5 hours**

## Success Criteria

- [ ] BattleSystem.executeBattle() works
- [ ] Same seed + same teams = identical outcome (verified 100+ times)
- [ ] Turn order respects speed, player wins ties
- [ ] Damage formula produces values in expected range
- [ ] Battles terminate within 500 turns
- [ ] Draw condition handled (both sides defeated or stalemate)
- [ ] All actions logged with sequence numbers
- [ ] 25+ new tests passing
- [ ] 0 TypeScript errors
- [ ] Integration test proves end-to-end flow

### To-dos

- [ ] Add BattleUnit type and draw support to src/types/game.ts
- [ ] Create tests/fixtures/battleFixtures.ts with mock teams
- [ ] Implement src/systems/BattleSystem.ts with deterministic combat
- [ ] Write comprehensive tests in tests/systems/BattleSystem.test.ts (25+ tests)
- [ ] Add battle integration test to tests/integration/fullFlow.test.ts
- [ ] Run all tests, verify 150+ passing, property tests confirm determinism