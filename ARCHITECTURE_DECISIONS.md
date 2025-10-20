# Architecture Decisions - NextEra MVP

**Date:** October 20, 2025  
**Status:** Approved - Ready for Implementation  
**Version:** 1.0

---

## Executive Summary

All 5 critical architecture blockers have been resolved. The decisions prioritize **pragmatism, determinism, and MVP scope** while leveraging proven legacy infrastructure.

---

## 1. RNG Library Choice

### Decision: **`pure-rand` (xoroshiro128plus) from legacy codebase**

**Rationale:**
- Legacy `Rng.ts` is production-ready with comprehensive tests (10 passing)
- `pure-rand` performs better than `seedrandom` (alea variant)
- xoroshiro128plus algorithm is superior to alea in quality and period length
- Already implements required `fork()` method for deterministic streams
- Maintained by fast-check team (property-based testing library)
- **Time saved:** 8 hours vs. rewriting with seedrandom

**Implementation:**
```typescript
import { makeRng } from './utils/rng';

// Root RNG from save/load seed
const rootRng = makeRng(gameSeed);

// Fork for subsystems
const choiceRng = rootRng.fork('choice');
const battleRng = rootRng.fork('battle');
const lootRng = rootRng.fork('loot');

// Generate opponent choices deterministically
const choice = choiceRng.choose(opponentPool);
```

**File:** `src/utils/rng.ts` (copied from `legacy-analysis/NextRealDeal-main/src/util/Rng.ts`)

**Dependency:** `pure-rand@^6.1.0`

**References:**
- Legacy tests: `tests/util/rng.test.ts` (all passing)
- xoroshiro128plus: https://prng.di.unimi.it/ (Sebastiano Vigna)
- pure-rand: https://github.com/dubzzz/pure-rand

---

## 2. Threat Score Formula

### Decision: **Omit threat scores from MVP**

**Rationale:**
- User confirmed threat-level mechanic is unnecessary for MVP
- Calculating threat requires complex formulas (RimWorld-style raid points)
- Adds implementation and balancing overhead
- Difficulty already communicated via colored difficulty dots (Standard/Normal/Hard)
- Can be added post-MVP if playtesting reveals need

**Implementation:**
```typescript
export interface OpponentPreview {
  readonly spec: OpponentSpec;
  readonly threatScore?: number; // Optional, undefined for MVP
  readonly counterTags: readonly Tag[];
  readonly unitSummaries: readonly { name: string; role: Role }[] | null;
}
```

**UI Treatment:**
- Remove `ThreatBadge` component from Phase 4
- Display difficulty dots instead (1-3 dots for Standard/Normal/Hard)
- Optional: Add descriptive text ("Balanced encounter", "Dangerous foes", etc.)

**Data Contract Change:**
- `threatScore` field made optional in `OpponentPreview`
- `ThreatBadge.tsx` component removed from implementation plan
- Difficulty visualization uses dots + color coding only

---

## 3. Archetype Definition

### Decision: **Archetype = `Role` (Tank, DPS, Support, Specialist)**

**Rationale:**
- Roles already exist in data contracts
- Avoids introducing new taxonomy (separate archetype field)
- Allows diversity enforcement: "avoid back-to-back archetypes" = avoid consecutive Tanks
- Simpler to balance and implement
- Can add separate archetype field (Swarm, Boss, Elite) post-MVP if needed

**Implementation:**
```typescript
export type Role = 'Tank' | 'DPS' | 'Support' | 'Specialist';

// Diversity check in ChoiceSystem
function hasDiverseRoles(previews: OpponentPreview[]): boolean {
  const roles = previews.map(p => p.spec.units[0].role);
  // Avoid back-to-back same roles (e.g., [Tank, Tank, DPS] = fail)
  return !roles.some((role, i) => i > 0 && role === roles[i - 1]);
}
```

**Diversity Rules (Updated):**
1. At least one "Standard" difficulty
2. At most one "Hard" difficulty
3. No duplicate primary tags (e.g., [Undead, Undead, Mech] = fail)
4. **No back-to-back roles** (e.g., [Tank, Tank, DPS] = fail, [Tank, DPS, Tank] = pass)

**Fallback:** After 10 attempts, relax in order:
1. Allow back-to-back roles
2. Allow duplicate primary tags
3. Accept any valid difficulty mix

---

## 4. Counter Tags Logic

### Decision: **Static field on `OpponentSpec` (manually curated)**

**Meaning:** `counterTags` lists player tags this opponent is **strong against**

**Rationale:**
- Manually curated = simple, no runtime calculation complexity
- Feature is behind flag (`feature.counterTags`), can iterate post-MVP
- Empty array = omit badge entirely (per spec)
- Avoids analyzing abilities or comparing to current team

**Implementation:**
```typescript
export interface OpponentSpec {
  readonly id: string;
  readonly name: string;
  readonly difficulty: Difficulty;
  readonly units: readonly EnemyUnitTemplate[];
  readonly primaryTag: Tag;
  readonly counterTags: readonly Tag[]; // Static, manually set
  readonly specialRule?: string;
  readonly rewardHint: string;
}

// Example opponent
const necromancer: OpponentSpec = {
  id: 'undead_necromancer_01',
  name: 'Cursed Necromancer',
  difficulty: 'Hard',
  units: [/* ... */],
  primaryTag: 'Undead',
  counterTags: ['Holy', 'Beast'], // Strong against Holy/Beast units
  specialRule: 'Revives one ally per turn',
  rewardHint: 'Dark Artifacts',
};
```

**UI Treatment:**
```typescript
// CounterTags.tsx (conditional render)
{flags.counterTags && counterTags.length > 0 && (
  <div className="counter-tags">
    <span>Counters:</span>
    {counterTags.map(tag => <TagBadge key={tag} tag={tag} />)}
  </div>
)}
```

**Catalog Curation:** When creating opponent specs, assign counter tags based on:
- Unit abilities (e.g., "Smite" ability → counters Undead)
- Type advantages (e.g., Fire units counter Nature)
- Lore/theme (e.g., Paladins counter Undead)

---

## 5. Defeat Flow

### Decision: **Instant restart (permadeath roguelike)**

**Rationale:**
- Permadeath is essential to roguelike design (increases tension, decision weight)
- No meta-progression systems in MVP scope (no persistent currency, unlocks)
- Simplifies save/load (no need for "run history")
- Matches traditional roguelike pattern (Slay the Spire, FTL, Hades)

**Implementation:**
```typescript
// GameController.ts
async handleBattleDefeat(): Promise<void> {
  // Log defeat
  this.logger.info('battle:defeat', {
    battleIndex: this.state.battleIndex,
    teamComp: this.state.playerTeam.map(u => u.name),
  });

  // Update progression counters
  this.progressionSystem.incrementCounter('runsAttempted');
  this.progressionSystem.incrementCounter('battlesLost');

  // Clear current run
  this.state.currentRun = null;
  this.state.playerTeam = [];

  // Return to main menu
  this.stateMachine.transitionTo('menu');
}
```

**Save State:**
- Clear `currentRun` data on defeat
- Keep progression counters (runsAttempted, runsCompleted, battlesWon, unitsRecruited)
- No need for "run history" or "failed runs" tracking

**UI Flow:**
```
Battle → Defeat → [Defeat Screen] → "Return to Menu" → Main Menu
                         ↓
                  Show stats:
                  - Battles won this run: X
                  - Units recruited: Y
                  - Final team composition
```

**Progression Counters (Persistent):**
```typescript
export interface ProgressionCounters {
  readonly runsAttempted: number;
  readonly runsCompleted: number; // Reached final boss?
  readonly battlesWon: number;
  readonly battlesLost: number;
  readonly unitsRecruited: number;
}
```

---

## Implementation Impact Summary

| Decision | Phase Affected | Changes Required |
|----------|---------------|------------------|
| **1. pure-rand** | Phase 1 | Copy `Rng.ts` as-is, install pure-rand@^6.1.0 |
| **2. No threat scores** | Phase 4 | Remove ThreatBadge component, use difficulty dots |
| **3. Role = Archetype** | Phase 3 | Update diversity check in ChoiceSystem |
| **4. Static counter tags** | Phase 2 | Add field to OpponentSpec, curate in catalog |
| **5. Permadeath** | Phase 3 | Implement defeat flow in GameController |

---

## Updated Implementation Plan

### Phase 1: Foundation (Day 1 - 2 hours) ✅ Ready

**Files to Copy:**
- ✅ `src/util/Rng.ts` → `src/utils/rng.ts` (pure-rand, as-is)
- ✅ `src/util/RngStreams.ts` → `src/utils/rngStreams.ts`
- ✅ `src/util/Logger.ts` → `src/systems/Logger.ts`
- ✅ `src/util/Result.ts` → `src/utils/Result.ts`
- ✅ `src/validation/validate.ts` → `src/validation/validate.ts`
- ✅ `src/util/AsyncQueue.ts` → `src/utils/AsyncQueue.ts`
- ✅ `vitest.config.ts`, `vite.config.ts`, `tsconfig.json`
- ✅ `tests/util/rng.test.ts` → `tests/utils/rng.test.ts`

**Dependencies:**
```bash
npm install pure-rand@^6.1.0 valibot@^0.42.1
npm install -D vitest@^2.1.9 fast-check@^3.23.2
```

**Verification:**
```bash
npm test  # RNG determinism tests pass
```

---

### Phase 2: Type System (Day 1-2 - 3 hours)

**Type Definitions (`src/types/game.ts`):**
```typescript
export type Role = 'Tank' | 'DPS' | 'Support' | 'Specialist';
export type Tag = 'Undead' | 'Mech' | 'Beast' | 'Holy' | 'Arcane' | 'Nature';
export type Difficulty = 'Standard' | 'Normal' | 'Hard';

export interface EnemyUnitTemplate {
  readonly id: string;
  readonly name: string;
  readonly role: Role;
  readonly tags: readonly Tag[];
  readonly baseStats: { hp: number; atk: number; def: number; speed: number };
  readonly portraitUrl?: string;
  readonly spriteUrl?: string;
}

export interface OpponentSpec {
  readonly id: string;
  readonly name: string;
  readonly difficulty: Difficulty;
  readonly units: readonly EnemyUnitTemplate[];
  readonly primaryTag: Tag;
  readonly counterTags: readonly Tag[]; // Decision #4
  readonly specialRule?: string;
  readonly rewardHint: string;
}

export interface OpponentPreview {
  readonly spec: OpponentSpec;
  readonly threatScore?: number; // Decision #2: omitted (undefined)
  readonly counterTags: readonly Tag[];
  readonly unitSummaries: readonly { name: string; role: Role }[] | null;
}

export interface SaveSliceChoice {
  readonly nextChoiceSeed: string;
  readonly battleIndex: number;
  readonly lastChoices?: readonly OpponentPreview[];
}

export interface ProgressionCounters {
  readonly runsAttempted: number;
  readonly runsCompleted: number;
  readonly battlesWon: number;
  readonly battlesLost: number;
  readonly unitsRecruited: number;
}
```

**State Machine (`src/core/GameStateMachine.ts`):**
```typescript
export type GameState =
  | 'menu'
  | 'starter_select'
  | 'opponent_select'
  | 'team_prep'
  | 'battle'
  | 'rewards'
  | 'recruit'
  | 'defeat'; // Decision #5

export const STATE_TRANSITIONS: Record<GameState, readonly GameState[]> = {
  menu: ['starter_select'],
  starter_select: ['opponent_select'],
  opponent_select: ['team_prep'],
  team_prep: ['battle'],
  battle: ['rewards', 'defeat'], // Can transition to defeat
  rewards: ['recruit'],
  recruit: ['opponent_select'], // Loop
  defeat: ['menu'], // Decision #5: instant restart
};
```

---

### Phase 3: ChoiceSystem (Day 3-4)

**Diversity Check (Decision #3):**
```typescript
function checkDiversity(previews: OpponentPreview[]): boolean {
  // Rule 1: At least one Standard
  const hasStandard = previews.some(p => p.spec.difficulty === 'Standard');
  
  // Rule 2: At most one Hard
  const hardCount = previews.filter(p => p.spec.difficulty === 'Hard').length;
  
  // Rule 3: No duplicate primary tags
  const tags = previews.map(p => p.spec.primaryTag);
  const uniqueTags = new Set(tags);
  
  // Rule 4: No back-to-back roles (Decision #3)
  const roles = previews.map(p => p.spec.units[0].role);
  const noBackToBackRoles = !roles.some((role, i) => i > 0 && role === roles[i - 1]);
  
  return hasStandard && hardCount <= 1 && uniqueTags.size === tags.length && noBackToBackRoles;
}
```

---

### Phase 4: UI Components (Day 5-6)

**Component Changes (Decision #2):**
- ❌ **Remove:** `ThreatBadge.tsx` (threat scores omitted)
- ✅ **Keep:** `OpponentCard.tsx`, `CounterTags.tsx`, `DifficultyDots.tsx`
- ✅ **Add:** `DefeatScreen.tsx` (Decision #5)

**DifficultyDots.tsx:**
```typescript
export function DifficultyDots({ difficulty }: { difficulty: Difficulty }) {
  const dots = difficulty === 'Standard' ? 1 : difficulty === 'Normal' ? 2 : 3;
  const color = difficulty === 'Standard' ? 'blue' : difficulty === 'Normal' ? 'yellow' : 'red';
  
  return (
    <div className="difficulty-dots" aria-label={`${difficulty} difficulty`}>
      {Array.from({ length: dots }, (_, i) => (
        <span key={i} className={`dot ${color}`} />
      ))}
    </div>
  );
}
```

**DefeatScreen.tsx (Decision #5):**
```typescript
export function DefeatScreen({ stats, onReturnToMenu }: DefeatScreenProps) {
  return (
    <div className="defeat-screen">
      <h1>Defeat</h1>
      <div className="stats">
        <p>Battles Won: {stats.battlesWon}</p>
        <p>Units Recruited: {stats.unitsRecruited}</p>
        <p>Final Team: {stats.team.map(u => u.name).join(', ')}</p>
      </div>
      <button onClick={onReturnToMenu}>Return to Menu</button>
    </div>
  );
}
```

---

## Feature Flags

```typescript
export const flags = {
  opponentChoice: __DEV__, // On in dev, off in prod until QA
  counterTags: __DEV__,    // Decision #4: behind flag
};
```

---

## Dependencies Final List

**Production:**
```json
{
  "pure-rand": "^6.1.0",
  "valibot": "^0.42.1",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "tailwindcss": "^4.1.14"
}
```

**Development:**
```json
{
  "vitest": "^2.1.9",
  "fast-check": "^3.23.2",
  "@vitest/coverage-v8": "^2.1.9",
  "typescript": "^5.9.3",
  "vite": "^5.4.20",
  "@vitejs/plugin-react": "^5.0.4",
  "@testing-library/react": "latest",
  "@axe-core/react": "latest"
}
```

---

## Acceptance Criteria Updates

**Original:**
- ✅ Opponent select shows three deterministic cards (Decision #1: pure-rand)
- ✅ Recruit phase functions correctly
- ✅ Selecting a card leads to team prep and then battle with exact spec
- ✅ Determinism guaranteed (Decision #1: fork-able RNG)
- ✅ Accessibility and performance targets met

**Added:**
- ✅ Defeat flow returns to menu, clears run (Decision #5)
- ✅ Difficulty communicated via dots (Decision #2: no threat scores)
- ✅ Diversity enforced including role check (Decision #3)
- ✅ Counter tags curated in catalog (Decision #4)

---

## Next Steps

**Immediate Actions (Phase 1):**
1. ✅ Create directory structure
2. ✅ Copy 6 core files from legacy
3. ✅ Install dependencies (pure-rand, valibot, vitest)
4. ✅ Run tests (verify RNG determinism)
5. ✅ Commit Phase 1 ("chore: add core utilities from legacy")

**Then:**
- Phase 2: Type system + state machine (3 hours)
- Phase 3: ChoiceSystem with role diversity (1-2 days)
- Phase 4: UI components (no ThreatBadge, add DefeatScreen) (2 days)
- Phase 5: Save/load integration (1 day)
- Phase 6: Testing & QA (2 days)

**Total Timeline:** 12-13 days to MVP

---

**Status:** ✅ **All blockers resolved - Ready to implement**

**Approved by:** User (October 20, 2025)

---

**End of Architecture Decisions**

