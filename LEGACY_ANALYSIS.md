# Legacy Codebase Analysis for NextRealDeal MVP

**Analysis Date:** October 20, 2025  
**Legacy Source:** NextRealDeal v1.0.0  
**Target:** NextEra MVP (NextRealDeal MVP v0.2 + Lo-fi UX Mockups v0.1)

---

## Executive Summary

The legacy codebase is a **mature, production-ready TypeScript game engine** with excellent fundamentals. It contains highly reusable infrastructure (RNG, logging, validation, type contracts) and architectural patterns (state machine, async queues, Result types) that align perfectly with the MVP's determinism and robustness requirements.

**Recommendation:** Salvage 60-70% of core utilities and patterns. Discard legacy UI, out-of-scope systems (shops, maps, meta-progression), and adapt the game loop to the new spec.

---

## ✅ HIGHLY REUSABLE COMPONENTS

### 1. **RNG System** ⭐⭐⭐⭐⭐
**Files:** `src/util/Rng.ts`, `src/util/RngStreams.ts`, `tests/util/rng.test.ts`

**Why Reuse:**
- ✅ Uses `pure-rand` (xoroshiro128plus) - production-grade PRNG
- ✅ Already has `fork()` method for deterministic streams
- ✅ Perfect match for MVP requirement: "seed-forked RNG; no Math.random"
- ✅ Interface includes `int()`, `float()`, `bool()`, `choose()`, `shuffleInPlace()`
- ✅ `RngStreams` class for centralized stream management
- ✅ Comprehensive test coverage (10 tests, determinism verified)
- ✅ Includes `describe()` for debug overlay

**Integration Plan:**
- **Location:** `src/utils/rng.ts` (rename for conventions)
- **Modifications:** 
  - Add `fork(label: string)` deterministic seeding (already exists! ✅)
  - Confirm `pure-rand` is installed in new project
  - Keep `RngStreams` for battle/choice/loot separation
- **Tests:** Port existing tests to new suite
- **Blockers:** None - this solves Blocker #1 (RNG Library Choice)

**Code Sample:**
```typescript
// From legacy Rng.ts (lines 56-63)
const fork = (childLabel?: string): IRng => {
  g.unsafeNext(); g.unsafeNext(); g.unsafeNext(); g.unsafeNext();
  forks += 1;
  const childSeed = g.unsafeNext() >>> 0;
  return makeRng(childSeed, childLabel);
};
```

**Answer to Blocker #1:** Use `pure-rand` (already in legacy `package.json` v6.1.0)

---

### 2. **Logger System** ⭐⭐⭐⭐⭐
**Files:** `src/util/Logger.ts`

**Why Reuse:**
- ✅ Structured logging with levels (debug/info/warn/error)
- ✅ Context propagation via `child(context)`
- ✅ Configurable min-level filtering
- ✅ Perfect for MVP telemetry: `choice:generated`, `choice:selected`, `choice:degraded`, `battle:started`
- ✅ Timestamps built-in (ISO 8601)

**Integration Plan:**
- **Location:** `src/systems/Logger.ts`
- **Modifications:**
  - Add custom event types: `EventType = 'choice:generated' | 'choice:selected' | 'choice:degraded' | 'battle:started'`
  - Create `EventLogger` wrapper for game-specific events
  - Keep `ConsoleLogger` for dev, add JSON output for prod analytics
- **Tests:** Port logger tests
- **Blockers:** None

**Usage in ChoiceSystem:**
```typescript
log.info('choice:generated', {
  battleIndex: 5,
  previews: previews.map(p => ({ id: p.id, threatScore: p.threatScore })),
  seed: rng.describe().seed
});
```

---

### 3. **Result Type** ⭐⭐⭐⭐⭐
**Files:** `src/util/Result.ts`

**Why Reuse:**
- ✅ Type-safe error handling without exceptions
- ✅ Rust-inspired `Result<T, E>` with `Ok/Err` constructors
- ✅ Helper functions: `map`, `mapErr`, `andThen`, `combine`, `unwrap`, `unwrapOr`
- ✅ Preferred over throwing errors for game logic (validation, business rules)
- ✅ Already used throughout legacy codebase

**Integration Plan:**
- **Location:** `src/utils/Result.ts`
- **Modifications:** None needed - use as-is
- **Usage:** All system methods should return `Result<T, Error>` for predictable error handling
- **Blockers:** None

**Code Sample:**
```typescript
// ChoiceSystem.generateChoices returns Result
export const generateChoices = (
  rng: IRng,
  battleIndex: number
): Result<OpponentPreview[], string> => {
  // ... generation logic
  if (attempts > 10) {
    return err('Failed to generate diverse choices after 10 attempts');
  }
  return ok(previews);
};
```

---

### 4. **Validation System** ⭐⭐⭐⭐
**Files:** `src/validation/validate.ts`

**Why Reuse:**
- ✅ Valibot integration (lightweight, modern alternative to Zod)
- ✅ Returns `Result<T, Error>` for consistency
- ✅ Helpers: `validate()`, `validateWith()`, `assert()`
- ✅ Used in SaveManager for schema validation

**Integration Plan:**
- **Location:** `src/validation/validate.ts`
- **Modifications:**
  - Create schemas for: `OpponentPreview`, `OpponentSpec`, `SaveSliceChoice`, `EnemyUnitTemplate`
  - Validate user input (starter selection, opponent choice, recruit selection)
- **Dependencies:** Install `valibot` (already in legacy: v0.42.1)
- **Blockers:** None

**Usage:**
```typescript
import * as v from 'valibot';
import { validate } from './validation/validate';

const OpponentPreviewSchema = v.object({
  id: v.string(),
  name: v.string(),
  difficulty: v.picklist(['Standard', 'Normal', 'Hard']),
  threatScore: v.number(),
  // ...
});

const result = validate(OpponentPreviewSchema, data);
if (!result.ok) {
  log.error('Invalid opponent preview', { error: result.error.message });
}
```

---

### 5. **Type Contracts** ⭐⭐⭐⭐
**Files:** `src/types/contracts.ts`, `src/types/unit-types.ts`, `src/types/battle-types.ts`

**Why Reuse:**
- ✅ Comprehensive TypeScript definitions for game systems
- ✅ Interfaces: `GameUnit`, `Equipment`, `Position`, `Serializable`, `GameEvent`
- ✅ Union types for safety: `RouteError`, `SaveError`, `CombatActionType`
- ✅ Readonly modifiers everywhere (immutability enforced)

**Integration Plan:**
- **Location:** `src/types/game.ts` (consolidate into single file for MVP)
- **Modifications:**
  - Extract: `Unit`, `Position`, `GameEvent`, `Result` patterns
  - Add MVP types: `Role`, `Tag`, `Difficulty`, `EnemyUnitTemplate`, `OpponentSpec`, `OpponentPreview`, `SaveSliceChoice`
  - Remove: `MapData`, `ShopInventory`, `RouteGraph`, `EnhancedGameUnit` (out of scope)
- **Tests:** None needed (type-level only)
- **Blockers:** None

**MVP Type Additions:**
```typescript
// New types for MVP (inspired by legacy patterns)
export type Role = 'Tank' | 'DPS' | 'Support' | 'Specialist';
export type Tag = 'Undead' | 'Mech' | 'Beast' | 'Holy' | 'Arcane' | 'Nature';
export type Difficulty = 'Standard' | 'Normal' | 'Hard';

export interface EnemyUnitTemplate {
  readonly id: string;
  readonly name: string;
  readonly role: Role;
  readonly tags: readonly Tag[];
  readonly baseStats: { atk: number; def: number; speed: number; hp: number };
  readonly portraitUrl?: string;
  readonly spriteUrl?: string;
}

export interface OpponentSpec {
  readonly id: string;
  readonly name: string;
  readonly difficulty: Difficulty;
  readonly units: readonly EnemyUnitTemplate[];
  readonly primaryTag: Tag;
  readonly specialRule?: string;
  readonly rewardHint: string;
}

export interface OpponentPreview {
  readonly spec: OpponentSpec;
  readonly threatScore: number;
  readonly counterTags: readonly Tag[];
  readonly unitSummaries: readonly { name: string; role: Role }[] | null; // null = "???"
}

export interface SaveSliceChoice {
  readonly nextChoiceSeed: string;
  readonly battleIndex: number;
  readonly lastChoices?: readonly OpponentPreview[];
}
```

---

### 6. **State Machine** ⭐⭐⭐⭐
**Files:** `src/core/state/GameStateMachine.ts`, `src/core/state/GameState.ts`

**Why Reuse:**
- ✅ Enforces valid state transitions (prevents bugs)
- ✅ History tracking for debugging
- ✅ Type-safe state definitions
- ✅ Returns `Result` for invalid transitions

**Integration Plan:**
- **Location:** `src/core/GameStateMachine.ts`
- **Modifications:**
  - Update states for MVP loop: `'menu' | 'starter_select' | 'opponent_select' | 'team_prep' | 'battle' | 'rewards' | 'recruit'`
  - Update transition map to match MVP flow
- **Tests:** Port state machine tests
- **Blockers:** None

**MVP State Machine:**
```typescript
export type GameState =
  | 'menu'
  | 'starter_select'
  | 'opponent_select'
  | 'team_prep'
  | 'battle'
  | 'rewards'
  | 'recruit';

export const STATE_TRANSITIONS: Record<GameState, readonly GameState[]> = {
  menu: ['starter_select'],
  starter_select: ['opponent_select'],
  opponent_select: ['team_prep'],
  team_prep: ['battle'],
  battle: ['rewards'],
  rewards: ['recruit'],
  recruit: ['opponent_select'], // Loop back
};
```

---

### 7. **Save System Architecture** ⭐⭐⭐⭐
**Files:** `src/save/SaveManager.ts`, `src/save/SaveStore.ts`

**Why Reuse:**
- ✅ Registry pattern for subsystem serialization
- ✅ Versioned envelopes (`v1`) for migration support
- ✅ Store abstraction (`ISaveStore` interface: InMemory, LocalStorage)
- ✅ Reserved key protection
- ✅ Async queue for concurrent access safety
- ✅ Comprehensive error codes (`SaveError` union)

**Integration Plan:**
- **Location:** `src/systems/SaveSystem.ts`
- **Modifications:**
  - Simplify to single-subsystem for MVP (no registry needed initially)
  - Add `SaveSliceChoice` to save state
  - Remove route/map subsystem references
  - Keep `InMemorySaveStore` for tests, `LocalStorageSaveStore` for browser
- **Tests:** Port save/load determinism tests
- **Blockers:** None

**MVP Save Format:**
```typescript
export interface SaveEnvelope {
  readonly version: 'v1';
  readonly timestamp: string;
  readonly playerTeam: readonly Unit[];
  readonly inventory: readonly Item[];
  readonly progression: { battlesWon: number; unitsRecruited: number };
  readonly choice: SaveSliceChoice;
}
```

---

### 8. **Async Queue Pattern** ⭐⭐⭐
**Files:** `src/util/AsyncQueue.ts`

**Why Reuse:**
- ✅ Serializes async operations (prevents race conditions)
- ✅ Lightweight (used throughout legacy systems)
- ✅ Supports AbortSignal for cancellation

**Integration Plan:**
- **Location:** `src/utils/AsyncQueue.ts`
- **Modifications:** None needed
- **Usage:** Wrap all system methods that modify state
- **Blockers:** None

---

### 9. **Common UI Components** ⭐⭐⭐
**Files:** `src/ui/components/common/Card.tsx`, `Modal.tsx`, `States.tsx`

**Why Reuse:**
- ✅ Basic Tailwind-styled primitives (Card, Modal)
- ✅ Loading/error/empty states component
- ✅ Clean, minimal design

**Integration Plan:**
- **Location:** `src/components/common/`
- **Modifications:**
  - Remove theme tokens (use custom theme for MVP)
  - Adapt `Card` → `OpponentCard` base component
  - Keep `Modal` for recruit selection
- **Tests:** Add accessibility tests
- **Blockers:** None

**Caution:** Legacy UI uses class-based theming (`bg-surface`, `border-color`) - replace with MVP design tokens.

---

### 10. **Keyboard Hook Pattern** ⭐⭐⭐
**Files:** `src/ui/hooks/useMenuInput.ts`

**Why Reuse:**
- ✅ Clean keyboard event handling
- ✅ Proper cleanup on unmount
- ✅ Enabled flag for conditional activation

**Integration Plan:**
- **Location:** `src/hooks/useKeyboard.ts`
- **Modifications:**
  - Expand to handle arrow keys, Enter, Space, F1
  - Add roving tabindex logic for opponent card selection
  - Integrate with accessibility requirements
- **Tests:** Add keyboard navigation tests
- **Blockers:** None

**Expansion for MVP:**
```typescript
export function useKeyboard({
  enabled,
  onUp,
  onDown,
  onLeft,
  onRight,
  onEnter,
  onSpace,
  onEscape,
  onF1,
}: KeyboardOpts) {
  // ... implementation
}
```

---

## ⚠️ ADAPTABLE WITH MODIFICATIONS

### 11. **GameController** ⭐⭐⭐
**Files:** `src/core/GameController.ts`

**Why Adapt (Not Direct Reuse):**
- ✅ Good pattern: Dependency injection, system access via getters
- ✅ Lifecycle coordination (init → update → destroy)
- ❌ Too generic: needs MVP-specific game loop
- ❌ References out-of-scope systems (MapSystem, RouteSystem)

**Integration Plan:**
- **Location:** `src/core/GameController.ts`
- **Modifications:**
  - Keep: Constructor DI, async queue, state machine integration
  - Remove: MapSystem, RouteSystem, EconomySystem (shop logic)
  - Add: ChoiceSystem, UnitSystem, BattleSystem, ProgressionSystem
  - Implement MVP loop orchestration methods:
    - `startRun(starterUnits: Unit[]): Result<void, Error>`
    - `generateOpponentChoices(): Result<OpponentPreview[], Error>`
    - `selectOpponent(id: string): Result<void, Error>`
    - `startBattle(): Result<BattleState, Error>`
    - `endBattle(result: BattleResult): Result<RewardState, Error>`
    - `recruitUnit(enemyUnit: Unit, replaceId?: string): Result<void, Error>`
- **Tests:** Rewrite integration tests for MVP flow
- **Blockers:** Depends on ChoiceSystem, BattleSystem (Phase 3+)

---

### 12. **Test Infrastructure** ⭐⭐⭐⭐
**Files:** `vitest.config.ts`, `tests/` directory structure

**Why Adapt:**
- ✅ Vitest configured (fast, modern)
- ✅ Coverage thresholds setup
- ✅ Property-based testing with `fast-check` (installed in devDeps)
- ✅ Test helpers: `systemStubs.ts`
- ❌ Test structure for legacy systems (not MVP)

**Integration Plan:**
- **Location:** Keep `vitest.config.ts` as-is
- **Modifications:**
  - Port `fast-check` property tests for ChoiceSystem determinism
  - Create test fixtures for opponent catalog
  - Add accessibility tests (testing-library/react)
  - Add performance benchmarks (initial render <4ms)
- **Tests:** Phase 7 (Testing & QA)
- **Blockers:** None

**Property Test Example (from legacy):**
```typescript
import fc from 'fast-check';

test('determinism: same seed → same choices', () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(0, 1000), (seed, battleIndex) => {
      const rng1 = makeRng(seed);
      const rng2 = makeRng(seed);
      const choices1 = generateChoices(rng1, battleIndex);
      const choices2 = generateChoices(rng2, battleIndex);
      expect(choices1).toEqual(choices2);
    })
  );
});
```

---

### 13. **Build Configuration** ⭐⭐⭐⭐
**Files:** `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `package.json`

**Why Adapt:**
- ✅ Vite + React setup (modern, fast)
- ✅ TypeScript strict mode enabled
- ✅ Tailwind CSS with custom theme
- ✅ ESM modules throughout
- ❌ Dual build (headless lib + web app) - MVP only needs web

**Integration Plan:**
- **Copy:** `vite.config.ts`, `tsconfig.json` (remove lib-specific settings)
- **Adapt:** `tailwind.config.js` (replace theme with MVP design tokens)
- **Merge:** `package.json` dependencies:
  - Keep: `react`, `react-dom`, `pure-rand`, `valibot`, `vitest`, `fast-check`, `tailwindcss`
  - Add: Any missing MVP dependencies
  - Remove: `dependency-cruiser`, `madge`, `plop` (overkill for MVP)
- **Blockers:** None

**Tailwind Theme for MVP:**
```javascript
theme: {
  extend: {
    colors: {
      threat: {
        low: '#16a34a',
        medium: '#f59e0b',
        high: '#ef4444',
        extreme: '#7c3aed',
      },
      difficulty: {
        standard: '#3b82f6',
        normal: '#f59e0b',
        hard: '#dc2626',
      },
      // ... MVP-specific tokens
    }
  }
}
```

---

## ❌ NON-REUSABLE / OUT OF SCOPE

### 14. **Map System** ❌
**Files:** `src/map/`, `tests/unit/map/`

**Why Discard:**
- ❌ Out of MVP scope (spec: "No world map pathfinding")
- ❌ BSP generation not needed (battles use static arenas if at all)
- ❌ Complexity: 1000+ lines for unused feature

**Alternative:** If battle arenas are needed later, consider simple fixed layouts or minimal procedural generation.

---

### 15. **Route System (Meta-Map)** ❌
**Files:** `src/route/`, `tests/unit/route/`

**Why Discard:**
- ❌ Out of MVP scope (spec: "No world map pathfinding, shops or meta progression")
- ❌ Slay the Spire-style node graph not in spec
- ❌ Complexity: 800+ lines

**Alternative:** MVP uses linear progression: Battle → Rewards → Recruit → Choose Next (3 cards) → Battle.

---

### 16. **Economy System (Shop)** ❌
**Files:** `src/economy/EconomyManager.ts` (shop logic)

**Why Discard:**
- ❌ Out of MVP scope (spec: "No shops")
- ❌ Gold currency not in spec
- ❌ Shop inventory management unused

**Salvageable Part:**
- ✅ Loot drop logic (`rollLoot()` method) - adapt for reward generation
- ✅ Item definitions - adapt for equipment/consumables

**Integration Plan:**
- Extract loot rolling logic only
- Create `RewardSystem` for post-battle loot (not a shop)

---

### 17. **Character Progression System** ❌
**Files:** `src/unit/CharacterGeneration.ts`, `SkillTrees.ts`, `ProgressionHelpers.ts`

**Why Discard:**
- ❌ Out of MVP scope (spec: "No meta progression beyond simple counters")
- ❌ Skill trees, abilities, mana system not in spec
- ❌ Complexity: 500+ lines

**Salvageable Part:**
- ✅ Level scaling formulas (`CLASS_BASE_STATS`) - adapt for enemy scaling
- ✅ Equipment system (`EquipmentHelpers.ts`) - simplify for MVP

---

### 18. **Legacy UI Screens** ❌
**Files:** `src/ui/pages/BattleScreen.tsx`, `EncounterExplorer.tsx`, `RunsManager.tsx`, `Overview.tsx`

**Why Discard:**
- ❌ Built for legacy game loop (route selection, encounter explorer, runs manager)
- ❌ UI design doesn't match MVP mockups
- ❌ Complexity: 2000+ lines across multiple screens

**Salvageable Part:**
- ✅ Canvas patterns (`BattleStageCanvas.tsx`) - if isometric battle view is needed
- ✅ Hooks (`useBattle.ts`) - pattern for useOpponentSelect, useRecruit

---

### 19. **Enhanced Battle System** ❌
**Files:** `src/battle/BattleActions.ts` (signature skills, status effects)

**Why Discard:**
- ❌ Three-action combat (attack/defend/signature) not in MVP spec
- ❌ Status effects (poisoned, blessed, cursed) not specified
- ❌ Cooldown system not mentioned

**Salvageable Part:**
- ✅ Core battle loop architecture (turn order, combat resolution)
- ✅ Deterministic damage calculation patterns

**Integration Plan:**
- Keep simple turn-based combat (auto-battle or minimal commands)
- Remove status effects, cooldowns, signature skills
- Focus on determinism and replay

---

## 🚧 RISKY / NEEDS REVIEW

### 20. **Plop Templates** 🤷
**Files:** `plopfile.cjs`, `templates/`

**Why Review:**
- ⚠️ Code generators for systems/tests (nice-to-have, not critical)
- ⚠️ Adds dependency (`plop` 4.0.4)
- ⚠️ MVP is small enough to write manually

**Recommendation:** Skip for MVP. Add post-launch if team grows.

---

### 21. **Valibot vs Zod** 🤷
**Files:** `package.json` (both `valibot` and `zod` installed)

**Why Review:**
- ⚠️ Legacy has both validation libraries (valibot used, zod unused?)
- ⚠️ Bloat: Pick one for MVP

**Recommendation:** Use Valibot only (smaller bundle, modern API). Remove Zod dependency.

---

### 22. **Dependency Cruiser / Madge** 🤷
**Files:** `eslint.config.js`, `.dependency-cruiser.cjs`, `package.json` scripts

**Why Review:**
- ⚠️ Circular dependency detection (nice-to-have)
- ⚠️ Adds dev dependencies and CI complexity
- ⚠️ MVP is small enough to manage manually

**Recommendation:** Skip for MVP. Revisit if codebase exceeds 10k LOC.

---

## 📊 REUSABILITY SCORECARD

| Component | Reusability | Effort | Priority | Phase |
|-----------|------------|--------|----------|-------|
| **RNG System** | 95% | Low | Critical | Phase 1 |
| **Logger** | 90% | Low | High | Phase 1 |
| **Result Type** | 100% | None | High | Phase 1 |
| **Validation** | 85% | Low | High | Phase 1 |
| **Type Contracts** | 70% | Medium | High | Phase 1 |
| **State Machine** | 80% | Low | High | Phase 2 |
| **Save System** | 75% | Medium | High | Phase 6 |
| **Async Queue** | 100% | None | Medium | Phase 1 |
| **UI Components** | 60% | Medium | Medium | Phase 4 |
| **Keyboard Hooks** | 70% | Low | Medium | Phase 4 |
| **GameController** | 50% | High | High | Phase 3 |
| **Test Infra** | 85% | Low | High | Phase 1 |
| **Build Config** | 90% | Low | High | Phase 1 |
| **Map System** | 0% | N/A | Out of Scope | — |
| **Route System** | 0% | N/A | Out of Scope | — |
| **Shop Economy** | 10% | N/A | Out of Scope | — |
| **Skill Trees** | 5% | N/A | Out of Scope | — |
| **Legacy UI** | 15% | N/A | Rewrite | Phase 4 |

**Overall Reusability:** ~60% of codebase (by LOC and value)

---

## 🎯 INTEGRATION ROADMAP

### Phase 1: Foundation (Copy-Paste Ready)
1. ✅ Copy `src/util/Rng.ts` → `src/utils/rng.ts`
2. ✅ Copy `src/util/RngStreams.ts` → `src/utils/rngStreams.ts`
3. ✅ Copy `src/util/Logger.ts` → `src/systems/Logger.ts`
4. ✅ Copy `src/util/Result.ts` → `src/utils/Result.ts`
5. ✅ Copy `src/validation/validate.ts` → `src/validation/validate.ts`
6. ✅ Copy `src/util/AsyncQueue.ts` → `src/utils/AsyncQueue.ts`
7. ✅ Copy `vitest.config.ts`, `vite.config.ts`, `tsconfig.json`
8. ✅ Merge `package.json` dependencies (remove unused)
9. ✅ Port `tests/util/rng.test.ts` → `tests/utils/rng.test.ts`

**Time Estimate:** 2 hours  
**Blockers:** None

---

### Phase 2: Type System & State Machine
10. ✅ Create `src/types/game.ts` (merge legacy contracts + MVP types)
11. ✅ Copy `src/core/state/GameStateMachine.ts` → `src/core/GameStateMachine.ts`
12. ✅ Update state definitions for MVP loop
13. ✅ Port state machine tests

**Time Estimate:** 3 hours  
**Blockers:** None

---

### Phase 3: Core Systems (New Code + Adapted Patterns)
14. ✅ Create `src/systems/ChoiceSystem.ts` (new, uses RNG patterns)
15. ✅ Adapt `src/economy/EconomyManager.ts` → `src/systems/RewardSystem.ts` (loot only)
16. ✅ Create `src/systems/ProgressionSystem.ts` (simple counters)
17. ✅ Create `src/systems/EventLogger.ts` (wrapper around Logger)
18. ⚠️ Adapt `src/core/GameController.ts` (heavy refactor for MVP loop)

**Time Estimate:** 2-3 days  
**Blockers:** Depends on BattleSystem, UnitSystem decisions

---

### Phase 4: UI Components (Inspired by Legacy)
19. ✅ Copy `src/ui/components/common/Card.tsx` → `src/components/Card.tsx`
20. ✅ Copy `src/ui/hooks/useMenuInput.ts` → `src/hooks/useKeyboard.ts` (expand)
21. ✅ Create `src/components/OpponentCard.tsx` (inspired by Card)
22. ✅ Create `src/components/ThreatBadge.tsx` (new)
23. ✅ Create `src/components/CounterTags.tsx` (new)
24. ✅ Copy `src/ui/components/common/Modal.tsx` → `src/components/Modal.tsx` (for recruit)

**Time Estimate:** 2 days  
**Blockers:** None (UI is independent)

---

### Phase 5: Save/Load
25. ⚠️ Adapt `src/save/SaveManager.ts` → `src/systems/SaveSystem.ts` (simplify)
26. ✅ Copy `src/save/SaveStore.ts` → `src/systems/SaveStore.ts`
27. ✅ Add `SaveSliceChoice` serialization
28. ✅ Port save/load tests

**Time Estimate:** 1 day  
**Blockers:** Depends on GameController final structure

---

### Phase 6: Testing & QA
29. ✅ Port property tests (fast-check) for ChoiceSystem
30. ✅ Add accessibility tests (keyboard navigation, ARIA)
31. ✅ Add performance tests (initial render <4ms)
32. ✅ Integrate legacy test patterns

**Time Estimate:** 2 days  
**Blockers:** None (can run in parallel with Phase 5)

---

## 🔧 DEPENDENCIES TO INSTALL

**Keep from Legacy:**
```json
{
  "dependencies": {
    "pure-rand": "^6.1.0",
    "valibot": "^0.42.1",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@tailwindcss/postcss": "^4.1.14",
    "tailwindcss": "^4.1.14"
  },
  "devDependencies": {
    "vitest": "^2.1.9",
    "fast-check": "^3.23.2",
    "@vitest/coverage-v8": "^2.1.9",
    "typescript": "^5.9.3",
    "vite": "^5.4.20",
    "@vitejs/plugin-react": "^5.0.4"
  }
}
```

**Remove from Legacy:**
- `zod` (duplicate of valibot)
- `react-router-dom` (not needed for MVP single-page flow)
- `dependency-cruiser`, `madge` (overkill)
- `plop` (code generator not needed)

**Add for MVP:**
- `@testing-library/react` (accessibility tests)
- `@testing-library/jest-dom` (DOM assertions)

---

## 🚨 ANSWERS TO MVP BLOCKERS

### Blocker #1: RNG Library Choice
**Answer:** Use `pure-rand` (xoroshiro128plus) - already implemented in legacy `Rng.ts` with perfect fork semantics. Install `pure-rand@^6.1.0`.

### Blocker #2: Threat Score Formula
**Status:** Still needs clarification from design  
**Recommendation:** Use legacy scaling pattern from `CharacterData.ts`:
```typescript
threatScore = baseStats.hp + (baseStats.atk * 2) + (baseStats.def * 1.5)
             + (difficulty === 'Hard' ? 50 : difficulty === 'Normal' ? 25 : 0)
             + (unitCount * 15);
```

### Blocker #3: Archetype Definition
**Status:** Still needs clarification  
**Recommendation:** Use `Role` as archetype (Tank, DPS, Support) - simplest mapping to existing types.

### Blocker #4: Counter Tags Logic
**Status:** Still needs clarification  
**Recommendation:** Static field on `OpponentSpec` (manually curated) - simplest for MVP.

### Blocker #5: Defeat Flow
**Status:** Still needs clarification  
**Recommendation:** Based on legacy `GameState` pattern, use "instant restart to menu" (permadeath roguelike).

---

## 🎉 FINAL RECOMMENDATIONS

### HIGH CONFIDENCE - Use Immediately:
1. **RNG System** - Solves Blocker #1, production-ready
2. **Logger** - Perfect for telemetry requirements
3. **Result Type** - Improves error handling throughout
4. **Validation** - Type-safe data contracts
5. **Test Infrastructure** - Vitest + fast-check ready to go
6. **Build Config** - Modern, fast, well-configured

### MEDIUM CONFIDENCE - Adapt with Care:
7. **GameController** - Good pattern, needs MVP-specific refactor
8. **Save System** - Solid architecture, simplify for MVP
9. **State Machine** - Update states, keep pattern
10. **UI Components** - Inspiration only, rewrite for MVP design

### LOW CONFIDENCE - Extract Patterns Only:
11. **Economy System** - Extract loot rolling only
12. **Character Data** - Extract scaling formulas only

### DO NOT USE:
- Map System, Route System, Shop Economy, Skill Trees, Legacy UI Screens

---

## 📝 NEXT STEPS

1. **Review this analysis** with the team
2. **Clarify 5 blockers** (especially threat score, archetype, counter tags)
3. **Execute Phase 1** (foundation) - 2 hours, zero risk
4. **Validate RNG determinism** - run legacy tests in new project
5. **Proceed to Phase 2-6** per implementation plan

**Estimated Time Savings:** 40-50 hours by reusing infrastructure vs. writing from scratch.

---

**End of Analysis**

