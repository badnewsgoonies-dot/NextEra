# Legacy Codebase Analysis - Executive Summary

**Date:** October 20, 2025  
**Analyst:** AI Coding Assistant  
**Project:** NextEra MVP (NextRealDeal MVP v0.2)

---

## 📊 Quick Stats

| Metric | Value |
|--------|-------|
| **Reusable Code** | ~60% by LOC, ~70% by value |
| **Time Saved** | 34-40 hours |
| **Files to Port** | 13 core files (as-is or minor adapt) |
| **Files to Adapt** | 5 major files (moderate-heavy refactor) |
| **Files to Discard** | 22 files (out of scope) |
| **Critical Dependencies** | pure-rand, valibot, vitest, fast-check |

---

## ✅ TIER 1: Copy As-Is (Production Ready)

These files solve critical MVP requirements with **zero or minimal modification**:

1. **`src/util/Rng.ts`** ⭐⭐⭐⭐⭐
   - Solves Blocker #1 (RNG Library Choice)
   - Uses `pure-rand` xoroshiro128plus
   - Has `fork()` method for deterministic streams
   - Comprehensive tests included

2. **`src/util/Result.ts`** ⭐⭐⭐⭐⭐
   - Type-safe error handling
   - Rust-inspired Ok/Err pattern
   - Used throughout systems

3. **`src/util/Logger.ts`** ⭐⭐⭐⭐⭐
   - Structured logging with levels
   - Context propagation
   - Perfect for MVP telemetry

4. **`src/validation/validate.ts`** ⭐⭐⭐⭐
   - Valibot integration
   - Returns Result types
   - Schema-based validation

5. **`src/util/AsyncQueue.ts`** ⭐⭐⭐⭐
   - Serializes async operations
   - Prevents race conditions
   - AbortSignal support

6. **Test Infrastructure** ⭐⭐⭐⭐
   - vitest.config.ts
   - Property-based testing with fast-check
   - Coverage setup

---

## ⚠️ TIER 2: Adapt with Modifications

These files need refactoring but provide excellent patterns:

7. **`src/core/state/GameStateMachine.ts`** ⭐⭐⭐⭐
   - Enforces valid transitions
   - History tracking
   - **Change:** Update states for MVP loop

8. **`src/save/SaveManager.ts`** ⭐⭐⭐⭐
   - Registry pattern for serialization
   - Versioned envelopes
   - **Change:** Simplify to single subsystem, add SaveSliceChoice

9. **`src/core/GameController.ts`** ⭐⭐⭐
   - Dependency injection
   - System coordination
   - **Change:** Heavy refactor for MVP game loop, remove out-of-scope systems

10. **`src/types/contracts.ts`** ⭐⭐⭐
    - Comprehensive type definitions
    - **Change:** Extract relevant types, add MVP-specific (OpponentPreview, etc.)

11. **`src/ui/hooks/useMenuInput.ts`** ⭐⭐⭐
    - Keyboard event handling
    - **Change:** Expand to full keyboard navigation (arrows, enter, space, F1)

---

## ❌ TIER 3: Discard (Out of Scope)

Do **not** port these systems (MVP spec excludes them):

- ❌ **Map System** (`src/map/`) - "No world map pathfinding"
- ❌ **Route System** (`src/route/`) - "No meta progression"
- ❌ **Shop Economy** (`src/economy/` shop logic) - "No shops"
- ❌ **Skill Trees** (`src/unit/SkillTrees.ts`) - "No meta progression beyond counters"
- ❌ **Legacy UI** (`src/ui/pages/`) - MVP has different mockups

---

## 🔑 Key Answers to MVP Blockers

### Blocker #1: RNG Library
**SOLVED** ✅  
**Answer:** Use `pure-rand` (already in legacy, battle-tested)  
**File:** `src/util/Rng.ts` (copy as-is)

### Blocker #2: Threat Score Formula
**PARTIAL** ⚠️  
**Recommendation:** Use legacy scaling from `CharacterData.ts`:
```typescript
threatScore = hp + (atk * 2) + (def * 1.5) 
            + difficultyBonus + (unitCount * 15);
```
**Status:** Still needs design confirmation

### Blocker #3: Archetype Definition
**PARTIAL** ⚠️  
**Recommendation:** Use `Role` as archetype (Tank, DPS, Support)  
**Status:** Needs design confirmation

### Blocker #4: Counter Tags
**PARTIAL** ⚠️  
**Recommendation:** Static field on `OpponentSpec` (manually curated)  
**Status:** Needs design confirmation

### Blocker #5: Defeat Flow
**PARTIAL** ⚠️  
**Recommendation:** Instant restart to menu (permadeath, based on legacy pattern)  
**Status:** Needs design confirmation

---

## 📦 Dependencies to Install

**Core (from legacy):**
```bash
npm install pure-rand@^6.1.0      # RNG (solves Blocker #1)
npm install valibot@^0.42.1        # Validation
npm install react@^19.2.0          # UI
npm install tailwindcss@^4.1.14    # Styling
```

**Dev Tools (from legacy):**
```bash
npm install -D vitest@^2.1.9       # Testing
npm install -D fast-check@^3.23.2  # Property tests
npm install -D typescript@^5.9.3   # Compiler
```

**New for MVP:**
```bash
npm install -D @testing-library/react      # Accessibility tests
npm install -D @axe-core/react             # A11y audits
```

**Remove from legacy:**
- ❌ `zod` (duplicate of valibot)
- ❌ `react-router-dom` (not needed)
- ❌ `plop`, `madge`, `dependency-cruiser` (overkill)

---

## 🚀 Implementation Priority

### Week 1: Foundation (Phase 1-2)
**Day 1-2:** Copy Tier 1 files (RNG, Logger, Result, Validation, AsyncQueue, configs)  
**Day 2:** Port tests, verify determinism  
**Day 3:** Create MVP types, adapt state machine

**Deliverable:** RNG determinism proven, build pipeline working, type system complete

### Week 2: Systems (Phase 3-5)
**Day 4-5:** Create ChoiceSystem (using ported RNG patterns)  
**Day 6:** Adapt GameController for MVP loop  
**Day 7:** Adapt SaveSystem, add SaveSliceChoice

**Deliverable:** Core game loop functional (choose → battle → recruit)

### Week 3: UI & Testing (Phase 6-7)
**Day 8-9:** Build UI components (OpponentCard, etc.)  
**Day 10-11:** Property tests, accessibility tests  
**Day 12-13:** QA, performance profiling, polish

**Deliverable:** MVP complete, all acceptance criteria met

---

## ⚡ Quick Start Commands

### Extract Legacy Code
```bash
cd /home/geni/Documents/NextEraGame/NextEra
# Already extracted to: legacy-analysis/NextRealDeal-main/
```

### Phase 1: Copy Core Utilities
```bash
# Create directories
mkdir -p src/utils src/systems src/validation tests/utils

# Copy files (as-is)
cp legacy-analysis/NextRealDeal-main/src/util/Rng.ts src/utils/rng.ts
cp legacy-analysis/NextRealDeal-main/src/util/RngStreams.ts src/utils/rngStreams.ts
cp legacy-analysis/NextRealDeal-main/src/util/Logger.ts src/systems/Logger.ts
cp legacy-analysis/NextRealDeal-main/src/util/Result.ts src/utils/Result.ts
cp legacy-analysis/NextRealDeal-main/src/validation/validate.ts src/validation/validate.ts
cp legacy-analysis/NextRealDeal-main/src/util/AsyncQueue.ts src/utils/AsyncQueue.ts

# Copy tests
cp legacy-analysis/NextRealDeal-main/tests/util/rng.test.ts tests/utils/rng.test.ts

# Copy configs
cp legacy-analysis/NextRealDeal-main/vitest.config.ts .
cp legacy-analysis/NextRealDeal-main/vite.config.ts .
cp legacy-analysis/NextRealDeal-main/tsconfig.json .
```

### Install Dependencies
```bash
npm install pure-rand@^6.1.0 valibot@^0.42.1
npm install -D vitest@^2.1.9 fast-check@^3.23.2
```

### Verify
```bash
npm test  # Should pass RNG determinism tests
```

---

## 📋 Acceptance Criteria Mapping

| MVP Requirement | Legacy Component | Status |
|----------------|------------------|--------|
| Deterministic RNG (seed-forked) | ✅ Rng.ts + RngStreams.ts | Ready |
| Save/load with seeds | ✅ SaveManager.ts (adapt) | Adapt |
| Logging events | ✅ Logger.ts | Ready |
| Type-safe contracts | ✅ contracts.ts (merge) | Adapt |
| State machine | ✅ GameStateMachine.ts (adapt) | Adapt |
| Validation | ✅ validate.ts | Ready |
| Property tests | ✅ fast-check setup | Ready |
| Accessibility | ⚠️ Legacy partial, MVP extend | Create |
| Performance (<4ms) | ⚠️ Not in legacy | Create |

---

## 🎯 Success Metrics

**Phase 1 Complete When:**
- [ ] RNG determinism test passes (same seed → same output)
- [ ] Build pipeline works (vite dev, build, test)
- [ ] Type system compiles (no TypeScript errors)

**Phase 2 Complete When:**
- [ ] ChoiceSystem generates 3 previews deterministically
- [ ] Diversity rules enforced (1 Standard, ≤1 Hard)
- [ ] Logger emits all MVP events

**MVP Complete When:**
- [ ] All 5 acceptance criteria met (see spec)
- [ ] Determinism verified (100 runs with same seed)
- [ ] Accessibility audit passes (axe-core, 0 violations)
- [ ] Performance <4ms (React DevTools Profiler)
- [ ] Save/load reproduces exact previews

---

## 🚨 Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Legacy RNG not deterministic enough | High | **LOW RISK** - Already has 10 passing tests, fork() proven |
| Type system conflicts with MVP spec | Medium | **MITIGATED** - Merge carefully, validate with design |
| UI components don't match mockups | Low | **ACCEPT** - Use as inspiration only, rewrite for MVP |
| Performance target missed (<4ms) | Medium | **MITIGATED** - Use React.memo, CSS transforms, no reflows |
| Accessibility gaps | Medium | **MITIGATED** - Add @testing-library/react + axe-core |

---

## 📚 Reference Documents

1. **Full Analysis:** `LEGACY_ANALYSIS.md` (24 sections, 1500 lines)
2. **Checklist:** `MIGRATION_CHECKLIST.md` (phase-by-phase tasks)
3. **Legacy Codebase:** `legacy-analysis/NextRealDeal-main/`
4. **MVP Spec:** (Original user-provided summary)

---

## 🎉 Conclusion

The legacy codebase is a **goldmine**. Its RNG system alone saves 8+ hours and solves Blocker #1. Combined with Logger, Result types, validation, and test infrastructure, we're looking at **34-40 hours of saved development time**.

**Recommendation:** Proceed with migration immediately. Start with Phase 1 (2 hours, zero risk).

**Next Action:** Clarify remaining 4 blockers (threat score, archetype, counter tags, defeat flow), then execute Phase 1.

---

**End of Executive Summary**

