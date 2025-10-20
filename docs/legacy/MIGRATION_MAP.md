# Legacy Code Migration Map

**Visual Guide to File Migration**

---

## 🟢 TIER 1: Copy As-Is (6 files, 2 hours)

```
legacy-analysis/NextRealDeal-main/
├── src/util/
│   ├── Rng.ts                    → src/utils/rng.ts ✅
│   ├── RngStreams.ts             → src/utils/rngStreams.ts ✅
│   ├── Logger.ts                 → src/systems/Logger.ts ✅
│   ├── Result.ts                 → src/utils/Result.ts ✅
│   └── AsyncQueue.ts             → src/utils/AsyncQueue.ts ✅
├── src/validation/
│   └── validate.ts               → src/validation/validate.ts ✅
└── tests/util/
    └── rng.test.ts               → tests/utils/rng.test.ts ✅
```

**Time:** 2 hours (copy + verify tests)  
**Risk:** None  
**Blockers:** None

---

## 🟡 TIER 2: Adapt with Changes (5 files, 2-3 days)

```
legacy-analysis/NextRealDeal-main/
├── src/core/state/
│   └── GameStateMachine.ts       → src/core/GameStateMachine.ts ⚠️
│       • Change states: menu, starter_select, opponent_select, team_prep, battle, rewards, recruit
│       • Update STATE_TRANSITIONS map
│
├── src/types/
│   └── contracts.ts              → src/types/game.ts ⚠️
│       • Keep: Unit, Position, GameEvent, Result patterns
│       • Add: Role, Tag, Difficulty, OpponentPreview, SaveSliceChoice
│       • Remove: MapData, RouteGraph, ShopInventory
│
├── src/save/
│   ├── SaveManager.ts            → src/systems/SaveSystem.ts ⚠️
│   └── SaveStore.ts              → src/systems/SaveStore.ts ✅
│       • Simplify: single subsystem (no registry)
│       • Add: SaveSliceChoice to envelope
│
├── src/core/
│   └── GameController.ts         → src/core/GameController.ts ⚠️⚠️
│       • Keep: DI pattern, async queue, getters
│       • Remove: MapSystem, RouteSystem
│       • Add: ChoiceSystem, MVP loop methods
│       • Heavy refactor required
│
└── src/ui/hooks/
    └── useMenuInput.ts           → src/hooks/useKeyboard.ts ⚠️
        • Add: onUp, onDown, onLeft, onRight, onEnter, onSpace, onF1
```

**Time:** 2-3 days  
**Risk:** Medium (refactoring complexity)  
**Blockers:** Depends on ChoiceSystem, BattleSystem design

---

## 🔵 TIER 3: Use as Inspiration (3 files, 2 days)

```
legacy-analysis/NextRealDeal-main/
├── src/ui/components/common/
│   ├── Card.tsx                  → src/components/Card.tsx 💡
│   └── Modal.tsx                 → src/components/Modal.tsx 💡
│       • Pattern only, rewrite styling for MVP
│       • Remove legacy theme tokens
│
└── src/economy/
    └── EconomyManager.ts         → src/systems/RewardSystem.ts 💡
        • Extract: rollLoot() method only
        • Remove: shop, currency, purchaseItem
```

**Time:** 2 days  
**Risk:** Low (creating new code)  
**Blockers:** None

---

## 🔴 TIER 4: Do Not Port (Out of Scope)

```
legacy-analysis/NextRealDeal-main/
├── src/map/                      ❌ "No world map pathfinding"
│   ├── MapManager.ts
│   ├── MapValidator.ts
│   └── (entire directory)
│
├── src/route/                    ❌ "No meta progression"
│   ├── RouteManager.ts
│   ├── RouteGraphGenerator.ts
│   └── (entire directory)
│
├── src/economy/                  ❌ "No shops"
│   └── EconomyManager.ts (shop logic)
│
├── src/unit/                     ❌ "No meta progression beyond counters"
│   ├── SkillTrees.ts
│   ├── CharacterGeneration.ts
│   └── ProgressionHelpers.ts
│
└── src/ui/pages/                 ❌ MVP has different mockups
    ├── BattleScreen.tsx
    ├── EncounterExplorer.tsx
    ├── RunsManager.tsx
    └── Overview.tsx
```

**Total Discarded:** ~22 files, 5000+ LOC  
**Reason:** Out of MVP scope per spec

---

## 📦 Configuration Files

```
legacy-analysis/NextRealDeal-main/
├── vitest.config.ts              → vitest.config.ts ✅
├── vite.config.ts                → vite.config.ts ✅
├── tsconfig.json                 → tsconfig.json ⚠️ (remove lib settings)
├── tailwind.config.js            → tailwind.config.js ⚠️ (replace theme)
└── package.json                  → package.json ⚠️ (merge deps)
    • Keep: pure-rand, valibot, react, tailwindcss, vitest, fast-check
    • Remove: zod, react-router-dom, plop, madge
    • Add: @testing-library/react, @axe-core/react
```

---

## 🎯 Migration Phases

### Phase 1: Foundation (Day 1, 2 hours)
```
✅ Copy 6 TIER 1 files
✅ Copy 5 config files (adapt 3)
✅ Install dependencies (pure-rand, valibot, vitest, fast-check)
✅ Run tests (verify RNG determinism)
```

### Phase 2: Type System (Day 1-2, 3 hours)
```
⚠️ Merge contracts.ts → game.ts
⚠️ Adapt GameStateMachine.ts
✅ Port state machine tests
```

### Phase 3: Core Systems (Days 2-4, 2-3 days)
```
NEW: ChoiceSystem.ts (uses RNG patterns)
NEW: EventLogger.ts (wraps Logger)
NEW: ProgressionSystem.ts (simple counters)
💡 RewardSystem.ts (extract from EconomyManager)
⚠️⚠️ Adapt GameController.ts (heavy refactor)
```

### Phase 4: UI Components (Days 5-6, 2 days)
```
💡 Adapt Card.tsx, Modal.tsx (patterns only)
⚠️ Expand useMenuInput.ts → useKeyboard.ts
NEW: OpponentCard.tsx
NEW: ThreatBadge.tsx
NEW: CounterTags.tsx
NEW: OpponentSelectScreen.tsx
```

### Phase 5: Save/Load (Day 7, 1 day)
```
⚠️ Adapt SaveManager.ts → SaveSystem.ts
✅ Copy SaveStore.ts
✅ Port save tests
```

### Phase 6: Testing (Days 8-9, 2 days)
```
✅ Property tests (fast-check)
NEW: Accessibility tests (@testing-library/react)
NEW: Performance tests (<4ms target)
✅ Integration tests (full run)
```

---

## 📊 Effort Distribution

```
Legend:
✅ = Copy as-is (0-1 hour per file)
⚠️ = Adapt with changes (2-4 hours per file)
⚠️⚠️ = Heavy refactor (1-2 days per file)
💡 = Use as inspiration (4-8 hours per file)
NEW = Write from scratch (varies)
❌ = Do not port (0 hours)
```

**Total Effort:**
- Copy as-is: 2 hours (6 files)
- Adapt: 2-3 days (5 files)
- Inspiration: 2 days (3 files)
- New code: 2-3 days (MVP-specific)
- **Total: 7-9 days** (vs. 14-16 days from scratch)

**Time Saved: 40-50%**

---

## 🚀 Quick Start

```bash
# 1. Extract legacy code (already done)
cd /home/geni/Documents/NextEraGame/NextEra
ls legacy-analysis/NextRealDeal-main/  # ✅ Extracted

# 2. Create directory structure
mkdir -p src/{utils,systems,validation,types,core,hooks,components,screens}
mkdir -p tests/{utils,systems,core,integration,properties,accessibility}

# 3. Copy TIER 1 files (2 hours)
cp legacy-analysis/NextRealDeal-main/src/util/Rng.ts src/utils/rng.ts
cp legacy-analysis/NextRealDeal-main/src/util/RngStreams.ts src/utils/rngStreams.ts
cp legacy-analysis/NextRealDeal-main/src/util/Logger.ts src/systems/Logger.ts
cp legacy-analysis/NextRealDeal-main/src/util/Result.ts src/utils/Result.ts
cp legacy-analysis/NextRealDeal-main/src/validation/validate.ts src/validation/validate.ts
cp legacy-analysis/NextRealDeal-main/src/util/AsyncQueue.ts src/utils/AsyncQueue.ts

# 4. Copy configs
cp legacy-analysis/NextRealDeal-main/vitest.config.ts .
cp legacy-analysis/NextRealDeal-main/vite.config.ts .
cp legacy-analysis/NextRealDeal-main/tsconfig.json .  # ⚠️ Edit: remove lib settings
cp legacy-analysis/NextRealDeal-main/tailwind.config.js .  # ⚠️ Edit: replace theme

# 5. Install dependencies
npm init -y  # If package.json doesn't exist
npm install pure-rand@^6.1.0 valibot@^0.42.1 react@^19.2.0 react-dom@^19.2.0 tailwindcss@^4.1.14
npm install -D vitest@^2.1.9 fast-check@^3.23.2 typescript@^5.9.3 vite@^5.4.20 @vitejs/plugin-react@^5.0.4

# 6. Copy tests
cp legacy-analysis/NextRealDeal-main/tests/util/rng.test.ts tests/utils/rng.test.ts

# 7. Verify
npm test  # Should pass (RNG determinism)
```

---

## 🎉 Success Indicators

**Phase 1 Success:**
- [ ] `npm test` passes (RNG tests)
- [ ] `npm run type-check` passes (no TypeScript errors)
- [ ] RNG fork produces different sequences: `makeRng(42).fork('a') !== makeRng(42).fork('b')`
- [ ] RNG determinism verified: `makeRng(42).fork('a') === makeRng(42).fork('a')` (same values)

**Phase 2 Success:**
- [ ] State machine compiles
- [ ] State machine allows: menu → starter_select → opponent_select → team_prep → battle → rewards → recruit → opponent_select
- [ ] State machine rejects: menu → battle (invalid transition)

**MVP Success:**
- [ ] All 5 blockers resolved
- [ ] All acceptance criteria met (determinism, accessibility, performance, save/load)
- [ ] 100 runs with same seed produce identical opponents
- [ ] Keyboard-only navigation works (no mouse)
- [ ] Screen reader announces correctly
- [ ] Initial render <4ms

---

## 📚 Documentation Cross-Reference

| Document | Purpose | Detail Level |
|----------|---------|--------------|
| **LEGACY_SUMMARY.md** | Executive summary | High-level overview |
| **LEGACY_ANALYSIS.md** | Full analysis | Comprehensive (1500 lines) |
| **MIGRATION_CHECKLIST.md** | Task checklist | Phase-by-phase tasks |
| **MIGRATION_MAP.md** (this file) | Visual guide | File-by-file mapping |

**Recommendation:** 
1. Read **LEGACY_SUMMARY.md** first (5 min)
2. Reference **MIGRATION_MAP.md** during Phase 1 (this file)
3. Use **MIGRATION_CHECKLIST.md** as daily TODO list
4. Consult **LEGACY_ANALYSIS.md** for deep dives

---

**Ready to migrate? Start with Phase 1!** ✅

