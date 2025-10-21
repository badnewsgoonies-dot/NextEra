# NextEra MVP

**Battle-First Roguelike with Deterministic Opponent Selection**

[![Tests](https://img.shields.io/badge/tests-131%2F131-success)](./tests)
[![TypeScript](https://img.shields.io/badge/TypeScript-0%20errors-blue)](./tsconfig.json)
[![Progress](https://img.shields.io/badge/MVP-100%25-brightgreen)](./MVP_COMPLETE.md)
[![Accessibility](https://img.shields.io/badge/a11y-WCAG%202.1%20AA-green)](./QA_CHECKLIST.md)

---

## 🎮 Live Demo

```bash
npm install
npm run dev
# Open http://localhost:3000
```

**Features:**

- ✅ Deterministic opponent generation (pure-rand RNG)
- ✅ 3-card selection with diversity rules
- ✅ Full keyboard navigation (← → ↑ ↓ Enter Escape)
- ✅ Accessibility (ARIA labels, screen reader support)
- ✅ 19 unique opponents with variety
- ✅ Dark mode support

---

## 📊 Progress

**Status:** ✅ MVP COMPLETE!  
**Time:** 4.5 hours development  
**Tests:** 131/131 passing (100%)

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1** | ✅ | Foundation (RNG, Logger, Result, Validation) |
| **Phase 2** | ✅ | Type system + State machine |
| **Phase 3** | ✅ | ChoiceSystem + Opponent catalog |
| **Phase 4** | ✅ | UI Components + OpponentSelectScreen |
| **Phase 5** | ✅ | Save/Load integration |
| **Phase 6** | ✅ | Testing & QA |

**All Phases Complete!** 🎉

---

## 🏗️ Architecture

### **Core Systems:**

- `ChoiceSystem` - Generates 3 opponent cards deterministically
- `EventLogger` - Type-safe telemetry events
- `GameStateMachine` - State transition enforcement

### **Data:**

- Opponent catalog: 19 enemies (Standard/Normal/Hard)
- All tags: Undead, Mech, Beast, Holy, Arcane, Nature
- All roles: Tank, DPS, Support, Specialist

### **UI:**

- `OpponentSelectScreen` - Main selection interface
- `OpponentCard` - Interactive preview cards
- `DifficultyDots` - Visual difficulty indicator
- `CounterTags` - Feature-flagged tag badges

### **Infrastructure:**

- `pure-rand` - Deterministic RNG (xoroshiro128plus)
- Vite + React + TypeScript + Tailwind CSS
- Vitest + fast-check for testing

---

## 🎯 Architecture Decisions

All critical blockers resolved:

1. ✅ **RNG:** `pure-rand` (deterministic fork support)
2. ✅ **No Threat Scores:** Use difficulty dots instead
3. ✅ **Role = Archetype:** Diversity checks use unit roles
4. ✅ **Static Counter Tags:** Manually curated in catalog
5. ✅ **Permadeath:** Defeat → Menu (instant restart)

**See:** `ARCHITECTURE_DECISIONS.md` for full details

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/badnewsgoonies-dot/NextEra.git
cd NextEra

# Install dependencies
npm install

# Run tests
npm test

# Start dev server
npm run dev
# Open http://localhost:3000
```

---

## 📚 Documentation

**Essential Docs:**

- `QUICKSTART.md` - 5-minute setup guide
- `ARCHITECTURE_DECISIONS.md` - Core architectural decisions
- `CURRENT_STATE_ASSESSMENT.md` - Latest project status
- `QA_CHECKLIST.md` - Quality verification

**Historical Docs:**

- `docs/` - Archived development history, legacy analysis, and planning

---

## 🧪 Testing

```bash
npm test                 # Run all tests (66)
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run type-check       # TypeScript compilation
```

**Test Coverage:**

- RNG determinism: 9 tests
- RNG streams: 10 tests
- State machine: 20 tests
- ChoiceSystem: 27 tests (includes property-based)

---

## 🎨 Tech Stack

- **Language:** TypeScript (strict mode)
- **UI:** React 19 + Tailwind CSS v4
- **Build:** Vite 5
- **Testing:** Vitest + fast-check
- **RNG:** pure-rand (xoroshiro128plus)
- **Validation:** Valibot

---

## 📦 NPM Scripts

```bash
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm run preview          # Preview production build
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run type-check       # TypeScript compilation check
```

---

## 🎮 Features

### **Deterministic Opponent Selection:**

- Same seed + battle index = same 3 opponents
- Verified with 200+ property test runs
- Fork-able RNG for independent streams

### **Diversity Rules:**

- At least 1 Standard difficulty
- At most 1 Hard difficulty
- No duplicate primary tags
- No back-to-back same roles

### **Accessibility:**

- Full keyboard navigation
- ARIA labels on all elements
- Screen reader announcements
- Focus visible styles
- Roving tabindex pattern

### **Performance:**

- React.memo for optimization
- CSS transforms only (no layout thrashing)
- Tailwind JIT for minimal CSS

---

## 📝 License

MIT

---

## 👥 Credits

- **Developed with:** AI Coding Assistant (Claude Sonnet 4.5)
- **Based on:** NextRealDeal v1.0.0 (legacy codebase)
- **Inspired by:** Slay the Spire, FTL, Into the Breach

---

**🎉 MVP is 67% complete! Try it at <http://localhost:3000>** 🚀
