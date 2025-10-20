# Legacy Code Migration Checklist

**Target:** NextEra MVP  
**Source:** NextRealDeal v1.0.0 (legacy-analysis/)

---

## Phase 1: Foundation (Day 1 - 2 hours)

### Files to Copy (As-Is or Minor Rename)

- [ ] `legacy-analysis/NextRealDeal-main/src/util/Rng.ts`  
  → `src/utils/rng.ts`  
  ✅ No modifications needed, includes fork() method

- [ ] `legacy-analysis/NextRealDeal-main/src/util/RngStreams.ts`  
  → `src/utils/rngStreams.ts`  
  ✅ No modifications needed

- [ ] `legacy-analysis/NextRealDeal-main/src/util/Logger.ts`  
  → `src/systems/Logger.ts`  
  ✅ No modifications needed

- [ ] `legacy-analysis/NextRealDeal-main/src/util/Result.ts`  
  → `src/utils/Result.ts`  
  ✅ No modifications needed

- [ ] `legacy-analysis/NextRealDeal-main/src/validation/validate.ts`  
  → `src/validation/validate.ts`  
  ✅ No modifications needed

- [ ] `legacy-analysis/NextRealDeal-main/src/util/AsyncQueue.ts`  
  → `src/utils/AsyncQueue.ts`  
  ✅ No modifications needed

### Configuration Files

- [ ] `legacy-analysis/NextRealDeal-main/vitest.config.ts`  
  → `vitest.config.ts`  
  ✅ Copy as-is

- [ ] `legacy-analysis/NextRealDeal-main/vite.config.ts`  
  → `vite.config.ts`  
  ✅ Copy as-is

- [ ] `legacy-analysis/NextRealDeal-main/tsconfig.json`  
  → `tsconfig.json`  
  ⚠️ Remove lib-specific settings (dual build), keep web only

- [ ] `legacy-analysis/NextRealDeal-main/tailwind.config.js`  
  → `tailwind.config.js`  
  ⚠️ Replace theme tokens with MVP colors

- [ ] `legacy-analysis/NextRealDeal-main/package.json`  
  → `package.json` (merge dependencies)  
  ⚠️ Keep: pure-rand, valibot, react, tailwindcss, vitest, fast-check  
  ⚠️ Remove: zod, react-router-dom, plop, madge, dependency-cruiser

### Tests to Port

- [ ] `legacy-analysis/NextRealDeal-main/tests/util/rng.test.ts`  
  → `tests/utils/rng.test.ts`  
  ✅ Copy as-is

- [ ] `legacy-analysis/NextRealDeal-main/tests/util/rngStreams.test.ts`  
  → `tests/utils/rngStreams.test.ts`  
  ✅ Copy as-is

### Verification Steps

- [ ] Run `npm install` (install pure-rand@^6.1.0)
- [ ] Run `npm test` (verify RNG tests pass)
- [ ] Import RNG in a test file: `import { makeRng } from './src/utils/rng'`
- [ ] Verify determinism: `makeRng(42).fork('test').int(0, 100)` returns same value twice

---

## Phase 2: Type System & State Machine (Day 1 - 3 hours)

### Files to Create (Merge/Adapt)

- [ ] `src/types/game.ts`  
  ⚠️ Merge:
  - Legacy: `Unit`, `Position`, `GameEvent`, `Serializable`, `Result` patterns
  - MVP: `Role`, `Tag`, `Difficulty`, `EnemyUnitTemplate`, `OpponentSpec`, `OpponentPreview`, `SaveSliceChoice`
  - Remove: `MapData`, `RouteGraph`, `ShopInventory`, `EnhancedGameUnit`

- [ ] `src/core/GameStateMachine.ts`  
  ⚠️ Copy from `legacy-analysis/NextRealDeal-main/src/core/state/GameStateMachine.ts`  
  ⚠️ Update `GameState` type:
  ```typescript
  export type GameState =
    | 'menu'
    | 'starter_select'
    | 'opponent_select'
    | 'team_prep'
    | 'battle'
    | 'rewards'
    | 'recruit';
  ```
  ⚠️ Update `STATE_TRANSITIONS` map for MVP loop

### Tests to Adapt

- [ ] `tests/core/GameStateMachine.test.ts`  
  ⚠️ Port from legacy, update for new states

### Verification Steps

- [ ] Type-check passes: `npm run type-check` (add script if needed)
- [ ] State machine allows: menu → starter_select → opponent_select → team_prep → battle → rewards → recruit → opponent_select (loop)
- [ ] State machine rejects: menu → battle (invalid)

---

## Phase 3: Systems (Days 2-4)

### Files to Create (New, Using Legacy Patterns)

- [ ] `src/systems/ChoiceSystem.ts` (NEW)  
  ✅ Use legacy RNG patterns  
  ✅ Use legacy Result type  
  ✅ Use legacy Logger  
  ⚠️ Implement MVP logic: generateChoices(), diversity rules, fallback

- [ ] `src/systems/EventLogger.ts` (NEW)  
  ✅ Wrapper around legacy Logger  
  ✅ Add MVP event types: `choice:generated`, `choice:selected`, `choice:degraded`, `battle:started`

- [ ] `src/systems/ProgressionSystem.ts` (NEW)  
  ⚠️ Simple counters only (battlesWon, unitsRecruited)  
  ⚠️ Do NOT port legacy skill trees/progression

- [ ] `src/systems/RewardSystem.ts` (ADAPTED)  
  ⚠️ Extract loot rolling logic from `legacy-analysis/NextRealDeal-main/src/economy/EconomyManager.ts`  
  ⚠️ Remove shop logic, keep rollLoot() only

### Files to Adapt (Heavy Refactor)

- [ ] `src/core/GameController.ts` (ADAPTED)  
  ⚠️ Copy structure from `legacy-analysis/NextRealDeal-main/src/core/GameController.ts`  
  ⚠️ Keep: constructor DI, async queue, getters, lifecycle  
  ⚠️ Remove: MapSystem, RouteSystem, shop economy  
  ⚠️ Add: ChoiceSystem, MVP loop methods (startRun, generateOpponentChoices, selectOpponent, etc.)

### Tests to Create

- [ ] `tests/systems/ChoiceSystem.test.ts`  
  ✅ Property test: determinism (same seed → same choices)  
  ✅ Unit test: diversity rules (1 Standard min, 1 Hard max)  
  ✅ Unit test: fallback after 10 attempts  
  ✅ Unit test: threat score calculation

- [ ] `tests/core/GameController.test.ts`  
  ⚠️ Adapt from legacy, test MVP loop

### Verification Steps

- [ ] ChoiceSystem generates 3 previews deterministically
- [ ] Diversity rules enforced (1 Standard, ≤1 Hard)
- [ ] Logger emits `choice:generated` event
- [ ] GameController orchestrates: startRun → generateChoices → selectOpponent

---

## Phase 4: UI Components (Days 5-6)

### Files to Copy (Adapt Styling)

- [ ] `legacy-analysis/NextRealDeal-main/src/ui/components/common/Card.tsx`  
  → `src/components/Card.tsx`  
  ⚠️ Remove legacy theme tokens (bg-surface, border-color)  
  ⚠️ Replace with MVP Tailwind classes

- [ ] `legacy-analysis/NextRealDeal-main/src/ui/components/common/Modal.tsx`  
  → `src/components/Modal.tsx`  
  ⚠️ Remove legacy theming

- [ ] `legacy-analysis/NextRealDeal-main/src/ui/hooks/useMenuInput.ts`  
  → `src/hooks/useKeyboard.ts`  
  ⚠️ Expand: add onUp, onDown, onLeft, onRight, onEnter, onSpace, onF1

### Files to Create (Inspired by Legacy)

- [ ] `src/components/OpponentCard.tsx` (NEW)  
  ✅ Based on Card.tsx structure  
  ✅ Add: name, tags, difficulty dots, threat badge, unit summaries, reward hint  
  ✅ Keyboard: expandable on focus, roving tabindex

- [ ] `src/components/ThreatBadge.tsx` (NEW)  
  ✅ Color gradient based on threat score  
  ✅ ARIA label: "Threat level: {score}"

- [ ] `src/components/CounterTags.tsx` (NEW)  
  ✅ Conditional render if `flags.counterTags` true  
  ✅ Hide if `counterTags.length === 0`

- [ ] `src/screens/OpponentSelectScreen.tsx` (NEW)  
  ✅ Render 3 OpponentCards  
  ✅ Roving tabindex (arrow keys)  
  ✅ Live region for focused card details

### Tests to Create

- [ ] `tests/components/OpponentCard.test.tsx`  
  ✅ Keyboard navigation (arrow keys, enter)  
  ✅ ARIA labels present  
  ✅ Focus management

- [ ] `tests/screens/OpponentSelectScreen.test.tsx`  
  ✅ Accessibility audit (axe-core)  
  ✅ Keyboard-only navigation

### Verification Steps

- [ ] Keyboard-only navigation works (tab → arrows → enter)
- [ ] Screen reader announces card details (test with NVDA/JAWS)
- [ ] Initial render <4ms (measure with React DevTools Profiler)
- [ ] No layout thrashing (Chrome DevTools Performance tab)

---

## Phase 5: Save/Load (Day 7)

### Files to Adapt

- [ ] `legacy-analysis/NextRealDeal-main/src/save/SaveManager.ts`  
  → `src/systems/SaveSystem.ts`  
  ⚠️ Simplify: remove registry pattern (single subsystem for MVP)  
  ⚠️ Add: `SaveSliceChoice` to save state  
  ⚠️ Keep: versioned envelopes, store abstraction

- [ ] `legacy-analysis/NextRealDeal-main/src/save/SaveStore.ts`  
  → `src/systems/SaveStore.ts`  
  ✅ Copy as-is (InMemory, LocalStorage)

### Tests to Port

- [ ] `tests/systems/SaveSystem.test.ts`  
  ⚠️ Adapt from `legacy-analysis/NextRealDeal-main/tests/unit/save/SaveManager.test.ts`  
  ✅ Test: save → load → verify same state  
  ✅ Test: save before choice → load → verify same 3 previews (determinism)

### Verification Steps

- [ ] Save game before opponent select
- [ ] Reload page
- [ ] Load saved game
- [ ] Verify exact same 3 opponent cards appear (determinism!)

---

## Phase 6: Testing & QA (Days 8-9)

### Tests to Create (Using Legacy Patterns)

- [ ] `tests/integration/fullRun.test.ts`  
  ✅ Full flow: startRun → opponent select → battle → recruit → loop  
  ✅ Determinism: same seed → same run

- [ ] `tests/properties/choiceSystem.test.ts`  
  ✅ Port property tests from legacy using fast-check  
  ✅ Test: determinism, diversity, difficulty window, threat monotonicity

- [ ] `tests/accessibility/keyboard.test.ts`  
  ✅ Full keyboard path through game  
  ✅ Test with @testing-library/react

- [ ] `tests/performance/render.test.ts`  
  ✅ Measure initial render time (<4ms target)

### QA Checklist (Manual)

- [ ] Full keyboard navigation (no mouse)
- [ ] Screen reader testing (NVDA on Windows, VoiceOver on Mac)
- [ ] Performance profiling (Chrome DevTools)
- [ ] Determinism: run same seed 10 times, verify identical opponents
- [ ] Save/load: verify state persistence across sessions
- [ ] Feature flags: toggle counterTags flag, verify UI updates

---

## Dependency Installation

```bash
# Install legacy dependencies
npm install pure-rand@^6.1.0
npm install valibot@^0.42.1
npm install react@^19.2.0 react-dom@^19.2.0
npm install tailwindcss@^4.1.14

# Install dev dependencies
npm install -D vitest@^2.1.9
npm install -D fast-check@^3.23.2
npm install -D @vitest/coverage-v8@^2.1.9
npm install -D typescript@^5.9.3
npm install -D vite@^5.4.20
npm install -D @vitejs/plugin-react@^5.0.4

# Install MVP-specific (not in legacy)
npm install -D @testing-library/react
npm install -D @testing-library/jest-dom
npm install -D @axe-core/react  # accessibility testing
```

---

## Files NOT to Copy (Out of Scope)

- ❌ `src/map/` (entire directory)
- ❌ `src/route/` (entire directory)
- ❌ `src/economy/EconomyManager.ts` (shop logic)
- ❌ `src/unit/SkillTrees.ts`
- ❌ `src/unit/CharacterGeneration.ts`
- ❌ `src/unit/ProgressionHelpers.ts`
- ❌ `src/ui/pages/` (all legacy screens)
- ❌ `src/ui/canvas/` (isometric battle view)
- ❌ `plopfile.cjs`, `templates/`
- ❌ `.dependency-cruiser.cjs`
- ❌ `*.bat` files (Windows scripts)

---

## Final Verification Checklist

- [ ] All tests pass (`npm test`)
- [ ] Type-checking passes (`npm run type-check` or `tsc --noEmit`)
- [ ] Linting passes (`npm run lint`)
- [ ] Accessibility audit passes (axe-core, no violations)
- [ ] Performance target met (initial render <4ms)
- [ ] Determinism verified (same seed → same choices, 100 runs)
- [ ] Save/load works (state persists across sessions)
- [ ] Keyboard navigation works (full game playable without mouse)
- [ ] Screen reader announces correctly (test with NVDA/VoiceOver)
- [ ] Feature flags work (counterTags toggle)

---

## Estimated Time Savings

**By Reusing Legacy Code:**
- RNG infrastructure: 8 hours saved
- Logger & Result types: 4 hours saved
- Validation system: 3 hours saved
- State machine: 3 hours saved
- Test infrastructure: 6 hours saved
- Build configuration: 4 hours saved
- UI component patterns: 6 hours saved

**Total Time Saved:** ~34 hours (vs. writing from scratch)

---

## Next Steps After Migration

1. **Run legacy tests in new codebase** to verify ports worked
2. **Create opponent catalog** (15-20 OpponentSpec entries)
3. **Implement ChoiceSystem** using ported RNG
4. **Build UI components** using ported patterns
5. **Integrate save/load** using adapted SaveSystem
6. **QA & polish** using legacy test patterns

**Ready to start? Begin with Phase 1!** ✅

