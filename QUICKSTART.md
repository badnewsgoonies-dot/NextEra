# NextEra MVP - Quick Start Guide

**Status:** Phase 1 (75% Complete)  
**Next Step:** Install Node.js

---

## ⚡ 5-Minute Setup

### 1. Install Node.js (Pick One Method)

**Method A: APT (Simple)**
```bash
sudo apt update && sudo apt install -y nodejs npm
```

**Method B: NVM (Recommended)**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node 20 (LTS)
nvm install 20
nvm use 20
```

### 2. Verify Installation
```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 3. Install Dependencies
```bash
cd /home/geni/Documents/NextEraGame/NextEra
npm install
```

**Expected:** ~2 minutes, 500+ packages installed

### 4. Run Tests (Verify Determinism)
```bash
npm test
```

**Expected:** 10/10 RNG tests pass ✅

### 5. Type-Check
```bash
npm run type-check
```

**Expected:** No errors ✅

---

## ✅ What's Already Done

**Phase 1 Completed:**
- ✅ All 5 architecture blockers resolved
- ✅ Directory structure created
- ✅ 6 core files migrated from legacy (RNG, Logger, Result, etc.)
- ✅ Configuration files created (package.json, tsconfig, vite, vitest, tailwind)
- ✅ Test files copied
- ✅ Comprehensive documentation (6 markdown files)

**Files Ready to Use:**
- `src/utils/rng.ts` - Deterministic RNG with fork() ⭐
- `src/utils/Result.ts` - Type-safe error handling ⭐
- `src/systems/Logger.ts` - Structured logging ⭐
- `src/validation/validate.ts` - Schema validation ⭐
- `src/utils/AsyncQueue.ts` - Async state management ⭐
- `src/utils/rngStreams.ts` - RNG stream management ⭐

---

## 🚀 After Setup (What's Next)

### Phase 2: Type System (3 hours)
```bash
# I'll create:
# - src/types/game.ts (Role, Tag, Difficulty, OpponentPreview, etc.)
# - src/core/GameStateMachine.ts (MVP states)
# - tests/core/GameStateMachine.test.ts
```

### Phase 3: ChoiceSystem (1-2 days)
```bash
# I'll implement:
# - src/systems/ChoiceSystem.ts (generates 3 opponent cards)
# - src/data/opponents.ts (opponent catalog)
# - tests/systems/ChoiceSystem.test.ts (determinism, diversity)
```

### Phase 4: UI Components (2 days)
```bash
# I'll build:
# - src/components/OpponentCard.tsx
# - src/components/DifficultyDots.tsx (no ThreatBadge per arch decision)
# - src/components/CounterTags.tsx
# - src/screens/OpponentSelectScreen.tsx
```

### Phase 5-6: Save/Load + Testing (3 days)
```bash
# I'll finalize:
# - src/systems/SaveSystem.ts
# - Full accessibility tests
# - Performance profiling
# - QA checklist
```

**Total Timeline:** 12-13 days to MVP

---

## 📚 Documentation Index

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **QUICKSTART.md** (this file) | Get running in 5 min | 2 min |
| **ARCHITECTURE_DECISIONS.md** | All 5 blockers resolved | 10 min |
| **LEGACY_SUMMARY.md** | Executive summary of reusable code | 5 min |
| **PHASE1_STATUS.md** | Current progress report | 5 min |
| **MIGRATION_MAP.md** | Visual file migration guide | 8 min |
| **MIGRATION_CHECKLIST.md** | Phase-by-phase task list | 15 min |
| **LEGACY_ANALYSIS.md** | Full technical analysis (1500 lines) | 45 min |

**Recommendation:** Read in this order if you're new to the project.

---

## 🎯 Success Metrics

**Phase 1 Complete When:**
- ✅ Directory structure created
- ✅ Core files copied (6 files)
- ✅ Config files ready (5 files)
- ⏸️ `npm install` succeeds (need Node.js)
- ⏸️ `npm test` passes (10 RNG tests)
- ⏸️ `npm run type-check` passes

**2/6 tasks blocked on Node.js installation**

---

## 🛠️ Available NPM Scripts

After `npm install`, you'll have:

```bash
npm run dev          # Start Vite dev server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run all tests (vitest)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run type-check   # TypeScript compilation check
```

---

## 💾 What's in package.json

**Production Dependencies:**
- `pure-rand@^6.1.0` - Deterministic RNG (xoroshiro128plus) ⭐
- `valibot@^0.42.1` - Schema validation
- `react@^19.2.0` - UI framework
- `tailwindcss@^4.1.14` - Styling

**Dev Dependencies:**
- `vitest@^2.1.9` - Testing framework
- `fast-check@^3.23.2` - Property-based testing ⭐
- `@testing-library/react` - Accessibility testing
- `typescript@^5.9.3` - Type safety
- `vite@^5.4.20` - Build tool (fast HMR)

**Total:** 15 dependencies (production + dev)

---

## 🎮 Architecture Decisions Recap

**All 5 blockers resolved:**

1. **RNG Library:** `pure-rand` (from legacy) ✅
2. **Threat Score:** Omitted from MVP ✅
3. **Archetype:** Role (Tank/DPS/Support) ✅
4. **Counter Tags:** Static field on OpponentSpec ✅
5. **Defeat Flow:** Instant restart (permadeath) ✅

**See ARCHITECTURE_DECISIONS.md for full details.**

---

## 🔍 Project Structure

```
NextEra/
├── src/
│   ├── utils/          # RNG, Result, AsyncQueue ✅
│   ├── systems/        # Logger, ChoiceSystem, etc.
│   ├── validation/     # Valibot schemas ✅
│   ├── types/          # TypeScript contracts
│   ├── core/           # GameController, StateMachine
│   ├── components/     # React UI components
│   ├── screens/        # Game screens
│   └── data/           # Opponent catalog
├── tests/
│   ├── utils/          # RNG determinism tests ✅
│   ├── systems/        # ChoiceSystem tests
│   ├── integration/    # Full-flow tests
│   └── properties/     # fast-check property tests
├── legacy-analysis/    # Original legacy code (reference)
├── docs/               # Documentation (this file, etc.)
├── package.json        # Dependencies ✅
├── tsconfig.json       # TypeScript config ✅
├── vite.config.ts      # Build config ✅
├── vitest.config.ts    # Test config ✅
└── tailwind.config.js  # Styling config ✅
```

**✅ = Files already in place**

---

## ⚡ Ready to Continue?

### Step 1: Install Node.js
```bash
# Choose a method above (APT or NVM)
```

### Step 2: Complete Phase 1
```bash
cd /home/geni/Documents/NextEraGame/NextEra
npm install && npm test
```

### Step 3: Tell Me When Ready
Once Node.js is installed and tests pass, I'll immediately proceed to **Phase 2** (type system + state machine).

---

## 🚨 Need Help?

**Node.js installation issues?**
- Check: https://nodejs.org/en/download/package-manager
- Or use NVM: https://github.com/nvm-sh/nvm

**npm install fails?**
- Try: `rm -rf node_modules package-lock.json && npm install`
- Check Node version: `node --version` (need v20.x or higher)

**Tests fail?**
- Check import paths (all use `.js` extension for ESM)
- Verify `vitest.config.ts` exists
- Run: `npm run type-check` to see TypeScript errors

---

**Ready to build? Install Node.js and let's continue!** 🎮🚀

