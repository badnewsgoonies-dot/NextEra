# Phase 7: Full Game Loop - Extended Roadmap

**Status:** 🚀 Ready to Start  
**Current Progress:** MVP Complete (Phases 1-6) - Opponent Selection System  
**Phase 7 Goal:** Complete playable game with all screens and full loop  
**Estimated Time:** 12-15 hours  
**Target:** Ship-ready full game experience

---

## Overview: Phases 1-6 Recap (Complete ✅)

### **Phase 1: Foundation** ✅ (1 hour)
- RNG system (pure-rand, deterministic fork)
- Logger + EventLogger
- Result types (type-safe errors)
- Validation (Valibot)
- Build pipeline (Vite, TypeScript, Tailwind, Vitest)
- **Tests:** 19/19

### **Phase 2: Type System** ✅ (1 hour)
- Complete MVP types (400+ lines)
- State machine (8 states, enforced transitions)
- All architecture decisions encoded
- **Tests:** 20/20

### **Phase 3: Core Systems** ✅ (1 hour)
- Opponent catalog (19 balanced enemies)
- ChoiceSystem (deterministic 3-card generation)
- BattleSystem (headless combat engine)
- Diversity rules (verified with property tests)
- **Tests:** 27/27

### **Phase 4: UI Components** ✅ (1 hour)
- OpponentSelectScreen (full keyboard nav)
- OpponentCard (interactive, accessible)
- DifficultyDots, CounterTags, Card
- useKeyboard hook
- Demo app with live preview
- **Tests:** 35/35

### **Phase 5: Save/Load** ✅ (0.5 hours)
- SaveSystem (deterministic persistence)
- SaveStore (InMemory + LocalStorage)
- SaveSliceChoice integration
- **Tests:** 15/15

### **Phase 6: QA & Polish** ✅ (0.5 hours)
- Integration tests (full flow)
- Accessibility audit (axe-core)
- Performance profiling
- Production build verification
- **Tests:** 15/15

**Phases 1-6 Total:** 131/131 tests, 4.5 hours, MVP COMPLETE ✅

---

## 🎯 Phase 7: Full Game Loop

**Objective:** Complete all remaining screens to create a fully playable roguelike game loop

**Time Estimate:** 12-15 hours  
**Test Target:** 200+ tests total (69 new tests)  
**Deliverables:** 7 new screens + full game integration

---

## Phase 7 Breakdown

### **7.1: Main Menu Screen** (1.5 hours)

#### Components to Build:
```
src/screens/MainMenuScreen.tsx
src/components/MenuButton.tsx
tests/ui/MainMenuScreen.test.tsx
```

#### Features:
- **New Game** button → StarterSelectScreen
- **Continue** button → Load last save → OpponentSelectScreen
- **Load Game** button → SaveSlotSelectScreen (show 3 save slots)
- **Settings** button → SettingsScreen (volume, accessibility)
- **Exit** button → Close app (electron) or return to landing

#### UI Requirements:
- Full keyboard navigation (↑↓ + Enter)
- Animated menu items (hover/focus effects)
- Game title with subtitle
- Background: Gradient or static image
- Continue button disabled if no saves exist
- ARIA labels for accessibility

#### Tests (5):
1. Navigation with keyboard works
2. New Game transitions to starter select
3. Continue button disabled when no saves
4. Load Game shows save slots
5. Accessibility check (axe-core)

#### Code Structure:
```typescript
// MainMenuScreen.tsx
interface MainMenuScreenProps {
  onNewGame: () => void;
  onContinue: () => void;
  onLoadGame: () => void;
  onSettings: () => void;
  onExit: () => void;
  hasSaves: boolean;
}

export function MainMenuScreen({ ... }: MainMenuScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const menuItems = [
    { label: 'New Game', action: onNewGame, disabled: false },
    { label: 'Continue', action: onContinue, disabled: !hasSaves },
    { label: 'Load Game', action: onLoadGame, disabled: false },
    { label: 'Settings', action: onSettings, disabled: false },
    { label: 'Exit', action: onExit, disabled: false },
  ];
  
  useKeyboard({
    onArrowUp: () => setSelectedIndex(prev => Math.max(0, prev - 1)),
    onArrowDown: () => setSelectedIndex(prev => Math.min(menuItems.length - 1, prev + 1)),
    onEnter: () => menuItems[selectedIndex].action(),
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900">
      <h1>NextEra</h1>
      <ul role="menu">
        {menuItems.map((item, idx) => (
          <MenuButton
            key={item.label}
            label={item.label}
            selected={selectedIndex === idx}
            disabled={item.disabled}
            onClick={item.action}
          />
        ))}
      </ul>
    </div>
  );
}
```

---

### **7.2: Starter Selection Screen** (2 hours)

#### Components to Build:
```
src/screens/StarterSelectScreen.tsx
src/components/UnitCard.tsx
src/data/starterUnits.ts
tests/ui/StarterSelectScreen.test.tsx
```

#### Features:
- Display 8-12 starter units to choose from
- Player selects exactly 4 units
- Each unit shows: name, role, tags, base stats
- Confirmable selection (Start Game button)
- Unit details on hover/focus (expandable like OpponentCard)
- Clear visual feedback for selected units
- Cancel button → Main Menu

#### UI Requirements:
- Grid layout (2x4 or 3x4)
- Keyboard navigation (arrow keys + Space to select)
- Selected units highlighted
- Start button disabled until 4 units selected
- Counter: "Selected: 3/4"
- ARIA labels and live regions

#### Data:
```typescript
// src/data/starterUnits.ts
export const STARTER_CATALOG: PlayerUnit[] = [
  {
    id: 'starter_warrior',
    name: 'Warrior',
    role: 'Tank',
    tags: ['Holy'],
    hp: 100,
    maxHp: 100,
    atk: 20,
    def: 15,
    speed: 40,
    level: 1,
    experience: 0,
  },
  // ... 7-11 more starters
];
```

#### Tests (8):
1. Displays all starter units
2. Can select up to 4 units
3. Cannot select more than 4
4. Can deselect units
5. Start button disabled until 4 selected
6. Keyboard navigation works
7. Cancel returns to menu
8. Accessibility check

---

### **7.3: Battle Screen (Visualization)** (4 hours)

#### Components to Build:
```
src/screens/BattleScreen.tsx (already exists, enhance)
src/components/battle/BattleField.tsx
src/components/battle/UnitBattleCard.tsx (already exists)
src/components/battle/DamageNumber.tsx (already exists)
src/components/battle/HPBar.tsx (already exists)
src/components/battle/AttackAnimation.tsx
src/hooks/useBattleAnimation.ts
tests/ui/BattleScreen.test.tsx
```

#### Features:
- **Left side:** Player team (4 units max)
- **Right side:** Enemy team (1-4 units)
- **Auto-battle:** Play through BattleResult.actions sequentially
- **Animations:**
  - Attack: Psynergy GIF overlay on target
  - Damage: Number popup (red for damage, green for heal)
  - HP bar: Smooth decrease
  - Defeat: Unit fades out
- **Speed control:** Play/Pause, 1x/2x/4x speed
- **Turn indicator:** Highlight active unit
- **Action log:** Scrolling combat log (optional)
- **Victory/Defeat:** Modal overlay with stats

#### Animation Sequence:
```typescript
// useBattleAnimation.ts
export function useBattleAnimation(result: BattleResult) {
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 4x
  
  useEffect(() => {
    if (!isPlaying) return;
    
    const action = result.actions[currentActionIndex];
    const delay = 1000 / speed; // 1 second per action at 1x
    
    const timer = setTimeout(() => {
      // Trigger animation for this action
      if (action.type === 'attack') {
        playAttackAnimation(action.actorId, action.targetId, action.damage);
      } else if (action.type === 'defeat') {
        playDefeatAnimation(action.actorId);
      }
      
      setCurrentActionIndex(prev => prev + 1);
      
      // Battle complete
      if (currentActionIndex >= result.actions.length - 1) {
        onBattleComplete(result.winner);
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [currentActionIndex, isPlaying, speed]);
  
  return { isPlaying, setIsPlaying, speed, setSpeed };
}
```

#### Psynergy GIF Integration:
```typescript
// AttackAnimation.tsx
const PSYNERGY_ANIMATIONS: Record<Role, string> = {
  Tank: '/sprites/psynergy/Grand_Gaia.gif',
  DPS: '/sprites/psynergy/Dragon_Fire.gif',
  Support: '/sprites/psynergy/Deluge.gif',
  Specialist: '/sprites/psynergy/Spark_Plasma.gif',
};

export function AttackAnimation({ 
  attackerId, 
  targetId, 
  role 
}: AttackAnimationProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <img
        src={PSYNERGY_ANIMATIONS[role]}
        alt="Attack effect"
        className="w-32 h-32 absolute"
        style={{
          left: getUnitPosition(targetId).x,
          top: getUnitPosition(targetId).y,
        }}
      />
    </div>
  );
}
```

#### Tests (12):
1. Renders player and enemy teams
2. Plays actions sequentially
3. HP bars update correctly
4. Damage numbers appear
5. Units fade out on defeat
6. Victory modal shows on win
7. Defeat modal shows on loss
8. Play/Pause works
9. Speed control (1x/2x/4x)
10. Psynergy GIFs load
11. Keyboard controls (Space = pause)
12. Accessibility check

---

### **7.4: Rewards Screen** (2 hours)

#### Components to Build:
```
src/screens/RewardsScreen.tsx (already exists, enhance)
src/components/rewards/ItemCard.tsx
src/components/rewards/ExperienceBar.tsx
src/systems/RewardSystem.ts
src/data/items.ts
tests/systems/RewardSystem.test.ts
tests/ui/RewardsScreen.test.tsx
```

#### Features:
- **Display:**
  - Gold earned (if economy system added)
  - Items dropped (0-3 items)
  - Experience gained per unit
  - Level ups (if any)
- **Item types:** Weapon, Armor, Accessory, Consumable
- **Rarity:** Common, Rare, Epic
- **Continue button** → RecruitScreen
- **Auto-advance:** 5 seconds (skippable)

#### RewardSystem:
```typescript
// src/systems/RewardSystem.ts
export class RewardSystem {
  /**
   * Generate battle rewards deterministically
   */
  generateRewards(
    opponentSpec: OpponentSpec,
    battleResult: BattleResult,
    rng: IRng
  ): BattleReward {
    // Base experience = 10 * turnsTaken
    const baseExp = battleResult.turnsTaken * 10;
    
    // Roll for item drops (difficulty affects drop rate)
    const dropRate = opponentSpec.difficulty === 'Hard' ? 0.8 
                   : opponentSpec.difficulty === 'Normal' ? 0.5 
                   : 0.3;
    
    const items: Item[] = [];
    if (rng.float() < dropRate) {
      items.push(this.rollItem(rng, opponentSpec.difficulty));
    }
    
    return {
      items,
      defeatedEnemies: opponentSpec.units,
      experience: baseExp,
    };
  }
  
  private rollItem(rng: IRng, difficulty: Difficulty): Item {
    const rarityRoll = rng.float();
    const rarity = difficulty === 'Hard' && rarityRoll > 0.7 ? 'epic'
                 : rarityRoll > 0.5 ? 'rare'
                 : 'common';
    
    // Choose random item of this rarity from catalog
    const itemsOfRarity = ITEM_CATALOG.filter(i => i.rarity === rarity);
    return rng.choose(itemsOfRarity);
  }
}
```

#### Tests (8):
1. Displays items correctly
2. Shows experience gained
3. RewardSystem generates deterministic rewards
4. Same seed = same rewards
5. Difficulty affects drop rate
6. Continue button works
7. Auto-advance after 5 seconds
8. Accessibility check

---

### **7.5: Recruit Screen** (2.5 hours)

#### Components to Build:
```
src/screens/RecruitScreen.tsx (already exists, enhance)
src/components/recruit/EnemyRecruitCard.tsx
src/components/recruit/TeamSlotSelector.tsx
src/systems/TeamManager.ts
tests/systems/TeamManager.test.ts
tests/ui/RecruitScreen.test.tsx
```

#### Features:
- **Display defeated enemies** (from BattleResult.unitsDefeated)
- **Recruit button** per enemy
- **Team size limit:** Max 4 units
- **Replacement flow:**
  - If team full, show modal: "Replace which unit?"
  - Display current team with stats
  - Select unit to replace
  - Confirm replacement
- **Skip button** → Next battle (OpponentSelectScreen)
- **Unit conversion:** EnemyUnitTemplate → PlayerUnit
  - Keep base stats
  - Set level = 1
  - Set experience = 0
  - Change id to player-compatible format

#### TeamManager System:
```typescript
// src/systems/TeamManager.ts
export class TeamManager {
  private readonly maxTeamSize = 4;
  
  /**
   * Add unit to team or prompt for replacement
   */
  recruitUnit(
    currentTeam: PlayerUnit[],
    enemyTemplate: EnemyUnitTemplate,
    replaceUnitId?: string
  ): Result<PlayerUnit[], string> {
    // Convert enemy to player unit
    const newUnit: PlayerUnit = {
      id: `recruited_${enemyTemplate.id}`,
      name: enemyTemplate.name,
      role: enemyTemplate.role,
      tags: enemyTemplate.tags,
      hp: enemyTemplate.baseStats.hp,
      maxHp: enemyTemplate.baseStats.hp,
      atk: enemyTemplate.baseStats.atk,
      def: enemyTemplate.baseStats.def,
      speed: enemyTemplate.baseStats.speed,
      level: 1,
      experience: 0,
      portraitUrl: enemyTemplate.portraitUrl,
      spriteUrl: enemyTemplate.spriteUrl,
    };
    
    // Team not full - just add
    if (currentTeam.length < this.maxTeamSize) {
      return ok([...currentTeam, newUnit]);
    }
    
    // Team full - replace specified unit
    if (!replaceUnitId) {
      return err('Team full - must specify unit to replace');
    }
    
    const replaceIndex = currentTeam.findIndex(u => u.id === replaceUnitId);
    if (replaceIndex === -1) {
      return err(`Unit ${replaceUnitId} not found in team`);
    }
    
    const newTeam = [...currentTeam];
    newTeam[replaceIndex] = newUnit;
    return ok(newTeam);
  }
  
  /**
   * Check if team is valid (1-4 units)
   */
  validateTeam(team: PlayerUnit[]): Result<void, string> {
    if (team.length === 0) {
      return err('Team cannot be empty');
    }
    if (team.length > this.maxTeamSize) {
      return err(`Team cannot exceed ${this.maxTeamSize} units`);
    }
    return ok(undefined);
  }
}
```

#### Tests (10):
1. Displays defeated enemies
2. Can recruit when team not full
3. Shows replacement modal when team full
4. Can select unit to replace
5. Replacement updates team correctly
6. Skip button works
7. TeamManager.recruitUnit validates correctly
8. Enemy → Player conversion preserves stats
9. Cannot exceed 4-unit limit
10. Accessibility check

---

### **7.6: Settings Screen** (1.5 hours)

#### Components to Build:
```
src/screens/SettingsScreen.tsx
src/components/settings/ToggleSwitch.tsx
src/components/settings/Slider.tsx
src/systems/SettingsManager.ts
tests/ui/SettingsScreen.test.tsx
```

#### Features:
- **Audio:**
  - Master volume (0-100%)
  - Music volume (0-100%)
  - SFX volume (0-100%)
  - Mute toggle
- **Accessibility:**
  - High contrast mode
  - Reduce motion
  - Screen reader verbosity
  - Text size (small/medium/large)
- **Gameplay:**
  - Battle speed (1x/2x/4x default)
  - Auto-save (on/off)
  - Show damage numbers (on/off)
  - Show counter tags (on/off)
- **Back button** → Main Menu

#### Persistence:
```typescript
// Settings saved to localStorage
interface Settings {
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reduceMotion: boolean;
    textSize: 'small' | 'medium' | 'large';
  };
  gameplay: {
    battleSpeed: 1 | 2 | 4;
    autoSave: boolean;
    showDamageNumbers: boolean;
    showCounterTags: boolean;
  };
}
```

#### Tests (6):
1. All settings render correctly
2. Volume sliders work
3. Toggles work
4. Settings persist to localStorage
5. Back button returns to menu
6. Accessibility check

---

### **7.7: Game Controller Integration** (2 hours)

#### Updates to Existing:
```
src/core/GameController.ts (enhance)
src/App.tsx (wire all screens)
tests/integration/fullGameLoop.test.ts
```

#### Full Game Loop:
```
Menu
  ↓ (New Game)
StarterSelect
  ↓ (Select 4 units)
OpponentSelect ✅ (already done)
  ↓ (Select opponent)
TeamPrep (optional, can skip for MVP)
  ↓ (Confirm team)
Battle
  ↓ (Win)
Rewards
  ↓ (Continue)
Recruit
  ↓ (Recruit or Skip)
OpponentSelect (loop)
  
  OR
  
Battle
  ↓ (Lose)
Defeat
  ↓ (Try Again)
Menu
```

#### App.tsx Enhancement:
```typescript
// src/App.tsx
type AppScreen = 
  | 'menu'
  | 'starter_select'
  | 'opponent_select'
  | 'team_prep'
  | 'battle'
  | 'rewards'
  | 'recruit'
  | 'defeat'
  | 'settings'
  | 'load_game';

export function App(): React.ReactElement {
  const [controller] = useState(() => new GameController(new ConsoleLogger('info')));
  const [screen, setScreen] = useState<AppScreen>('menu');
  const [playerTeam, setPlayerTeam] = useState<PlayerUnit[]>([]);
  // ... other state
  
  const handleNewGame = () => {
    setScreen('starter_select');
  };
  
  const handleStarterSelected = (starters: PlayerUnit[]) => {
    const initResult = controller.startRun(starters, Date.now());
    if (initResult.ok) {
      setPlayerTeam(starters);
      setScreen('opponent_select');
    }
  };
  
  const handleOpponentSelected = (opponentId: string) => {
    // Execute battle
    const battleResult = controller.executeBattle();
    if (battleResult.ok) {
      setScreen('battle');
    }
  };
  
  const handleBattleComplete = (result: BattleResult) => {
    if (result.winner === 'player') {
      setScreen('rewards');
    } else {
      setScreen('defeat');
    }
  };
  
  const handleRewardsContinue = () => {
    setScreen('recruit');
  };
  
  const handleRecruitComplete = (newTeam: PlayerUnit[]) => {
    setPlayerTeam(newTeam);
    controller.advanceToNextBattle();
    setScreen('opponent_select');
  };
  
  const handleDefeatRestart = () => {
    setScreen('menu');
  };
  
  // Render appropriate screen
  switch (screen) {
    case 'menu':
      return <MainMenuScreen onNewGame={handleNewGame} ... />;
    case 'starter_select':
      return <StarterSelectScreen onSelect={handleStarterSelected} ... />;
    case 'opponent_select':
      return <OpponentSelectScreen onSelect={handleOpponentSelected} ... />;
    // ... all other screens
  }
}
```

#### GameController Updates:
```typescript
// Add to GameController
export class GameController {
  // ... existing methods
  
  /**
   * Initialize game with selected starters
   */
  startRun(starterTeam: PlayerUnit[], seed?: number): Result<void, string> {
    // Already implemented ✅
  }
  
  /**
   * Generate rewards after battle
   */
  generateRewards(
    opponentSpec: OpponentSpec,
    battleResult: BattleResult
  ): BattleReward {
    const rewardRng = this.rootRng.fork('reward').fork(String(this.state.battleIndex));
    return this.rewardSystem.generateRewards(opponentSpec, battleResult, rewardRng);
  }
  
  /**
   * Recruit enemy unit to team
   */
  recruitUnit(
    enemyTemplate: EnemyUnitTemplate,
    replaceUnitId?: string
  ): Result<void, string> {
    const recruitResult = this.teamManager.recruitUnit(
      this.state.playerTeam,
      enemyTemplate,
      replaceUnitId
    );
    
    if (!recruitResult.ok) {
      return err(recruitResult.error);
    }
    
    this.state.playerTeam = recruitResult.value;
    this.state.progression = {
      ...this.state.progression,
      unitsRecruited: this.state.progression.unitsRecruited + 1,
    };
    
    return ok(undefined);
  }
}
```

#### Integration Tests (8):
1. Full loop: Menu → Starter → Opponent → Battle → Rewards → Recruit → Loop
2. Defeat flow: Battle → Defeat → Menu
3. Save/Load preserves all state
4. Team persists across battles
5. Progression counters update correctly
6. Settings persist across sessions
7. Can load game mid-run
8. Determinism: Same seed = same full run

---

### **7.8: Content & Balance** (1.5 hours)

#### Expand Data:
```
src/data/starterUnits.ts (8-12 starters)
src/data/items.ts (20-30 items)
src/data/opponents.ts (expand to 30 opponents)
```

#### Starter Catalog (12 units):
```typescript
// Mix of roles and tags for diversity
export const STARTER_CATALOG: PlayerUnit[] = [
  // Tanks
  { id: 's_warrior', name: 'Warrior', role: 'Tank', tags: ['Holy'], ... },
  { id: 's_guardian', name: 'Guardian', role: 'Tank', tags: ['Nature'], ... },
  { id: 's_paladin', name: 'Paladin', role: 'Tank', tags: ['Holy'], ... },
  
  // DPS
  { id: 's_rogue', name: 'Rogue', role: 'DPS', tags: ['Beast'], ... },
  { id: 's_mage', name: 'Mage', role: 'DPS', tags: ['Arcane'], ... },
  { id: 's_ranger', name: 'Ranger', role: 'DPS', tags: ['Nature'], ... },
  
  // Support
  { id: 's_cleric', name: 'Cleric', role: 'Support', tags: ['Holy'], ... },
  { id: 's_shaman', name: 'Shaman', role: 'Support', tags: ['Nature'], ... },
  { id: 's_bard', name: 'Bard', role: 'Support', tags: ['Arcane'], ... },
  
  // Specialist
  { id: 's_necromancer', name: 'Necromancer', role: 'Specialist', tags: ['Undead'], ... },
  { id: 's_engineer', name: 'Engineer', role: 'Specialist', tags: ['Mech'], ... },
  { id: 's_summoner', name: 'Summoner', role: 'Specialist', tags: ['Beast'], ... },
];
```

#### Item Catalog (30 items):
```typescript
// Weapons (10)
{ id: 'iron_sword', name: 'Iron Sword', type: 'weapon', rarity: 'common', stats: { atkBonus: 5 } },
{ id: 'steel_blade', name: 'Steel Blade', type: 'weapon', rarity: 'rare', stats: { atkBonus: 10 } },
{ id: 'dragon_slayer', name: 'Dragon Slayer', type: 'weapon', rarity: 'epic', stats: { atkBonus: 20 } },
// ... 7 more

// Armor (10)
{ id: 'leather_armor', name: 'Leather Armor', type: 'armor', rarity: 'common', stats: { defBonus: 5 } },
// ... 9 more

// Accessories (5)
{ id: 'speed_boots', name: 'Speed Boots', type: 'accessory', rarity: 'rare', stats: { speedBonus: 10 } },
// ... 4 more

// Consumables (5)
{ id: 'health_potion', name: 'Health Potion', type: 'consumable', rarity: 'common', stats: { hpRestore: 50 } },
// ... 4 more
```

#### Opponent Expansion (30 total, currently 19):
- Add 11 more opponents with diverse stats/tags/roles
- Balance difficulty curve (60% Standard, 30% Normal, 10% Hard)
- Ensure all tag combinations represented

---

## Phase 7 Testing Strategy

### Unit Tests (40 new tests):
- RewardSystem: 8 tests
- TeamManager: 10 tests
- SettingsManager: 6 tests
- MainMenuScreen: 5 tests
- StarterSelectScreen: 8 tests
- RecruitScreen: 10 tests
- BattleScreen (enhanced): 12 tests
- SettingsScreen: 6 tests

### Integration Tests (8 new tests):
- Full game loop (menu → defeat)
- Save/Load mid-game
- Settings persistence
- Team recruitment flow
- Reward generation
- Multi-battle run determinism
- Defeat restart flow
- Victory progression

### E2E Tests (3 new tests):
- Complete game run (10+ battles)
- Save/Load/Resume flow
- Settings affect gameplay

**Total New Tests:** 51  
**Grand Total:** 182 tests (131 existing + 51 new)

---

## Implementation Timeline

### Week 1: Core Screens (8 hours)
- **Day 1 (3h):** Main Menu + Starter Select
- **Day 2 (4h):** Battle Screen visualization
- **Day 3 (1h):** Settings Screen

### Week 2: Game Loop (7 hours)
- **Day 4 (2.5h):** Rewards + Recruit screens
- **Day 5 (2h):** Game Controller integration
- **Day 6 (1.5h):** Content expansion
- **Day 7 (1h):** Final polish + bug fixes

**Total:** 15 hours (conservative estimate)

---

## Success Criteria

### Functional Requirements:
- ✅ Can start new game from menu
- ✅ Can select 4 starter units
- ✅ Full battle loop works (opponent → battle → rewards → recruit → loop)
- ✅ Defeat flow works (battle → defeat → menu)
- ✅ Can save/load mid-game
- ✅ Settings persist and affect gameplay
- ✅ Team management (recruit/replace) works
- ✅ 10+ consecutive battles playable

### Quality Requirements:
- ✅ 182+ tests passing (100%)
- ✅ 0 TypeScript errors
- ✅ 0 accessibility violations (WCAG 2.1 AA)
- ✅ Performance: All screens <100ms render
- ✅ Production build: <150KB gzipped
- ✅ Mobile responsive (all screens)
- ✅ Dark mode support (all screens)

### Content Requirements:
- ✅ 12 starter units (all tags/roles)
- ✅ 30 opponents (diverse, balanced)
- ✅ 30 items (weapons, armor, accessories, consumables)
- ✅ 19 psynergy animations integrated

---

## Deliverables Checklist

### Code:
- [ ] `src/screens/MainMenuScreen.tsx`
- [ ] `src/screens/StarterSelectScreen.tsx`
- [ ] `src/screens/BattleScreen.tsx` (enhanced)
- [ ] `src/screens/RewardsScreen.tsx` (enhanced)
- [ ] `src/screens/RecruitScreen.tsx` (enhanced)
- [ ] `src/screens/SettingsScreen.tsx`
- [ ] `src/systems/RewardSystem.ts`
- [ ] `src/systems/TeamManager.ts`
- [ ] `src/systems/SettingsManager.ts`
- [ ] `src/data/starterUnits.ts`
- [ ] `src/data/items.ts`
- [ ] `src/data/opponents.ts` (expanded)
- [ ] `src/hooks/useBattleAnimation.ts`
- [ ] `src/components/battle/AttackAnimation.tsx`
- [ ] `src/components/MenuButton.tsx`
- [ ] `src/components/UnitCard.tsx`
- [ ] `src/components/settings/*` (3 components)
- [ ] `src/App.tsx` (full integration)

### Tests:
- [ ] 40 new unit tests
- [ ] 8 new integration tests
- [ ] 3 new E2E tests
- [ ] All existing tests still passing

### Documentation:
- [ ] Update README.md (full game features)
- [ ] Create GAMEPLAY.md (how to play guide)
- [ ] Update QUICKSTART.md (new screens)
- [ ] Add BALANCING.md (game balance notes)

---

## Post-Phase 7: Optional Enhancements

### Phase 8: Content Expansion (future)
- 50+ opponents
- 100+ items
- 5 boss encounters
- Achievement system
- Leaderboard (longest run)

### Phase 9: Advanced Features (future)
- Passive abilities for units
- Synergy bonuses (tag combos)
- Meta-progression (unlocks)
- Multiple difficulty modes
- New game+ (carry over items)

### Phase 10: Polish & Launch (future)
- Sound effects (20+ SFX)
- Background music (5 tracks)
- Particle effects
- Screen transitions
- Marketing assets
- Steam/Itch.io release

---

## Risk Assessment

### High Priority Risks:
1. **Battle animation complexity** - Mitigation: Start simple (CSS only), add GIFs later
2. **Performance with many units** - Mitigation: React.memo, virtualization if needed
3. **Save/Load compatibility** - Mitigation: Version saves, migration system
4. **Balance (too easy/hard)** - Mitigation: Playtesting, tunable constants

### Medium Priority Risks:
1. **Missing sprites** - Mitigation: CSS placeholders work fine
2. **Mobile performance** - Mitigation: Test early, optimize if needed
3. **Browser compatibility** - Mitigation: Target modern browsers only

### Low Priority Risks:
1. **Feature creep** - Mitigation: Stick to Phase 7 scope strictly
2. **Testing time** - Mitigation: Write tests alongside features

---

## Phase 7 Kickoff Checklist

Before starting Phase 7:
- ✅ Phase 1-6 complete (131/131 tests passing)
- ✅ No TypeScript errors
- ✅ Production build working
- ✅ Git repo clean (all changes committed)
- [ ] Create Phase 7 branch: `git checkout -b phase-7-full-game`
- [ ] Update project board with Phase 7 tasks
- [ ] Set up time tracking for 15-hour estimate

---

## Summary

**Phase 7 transforms the MVP opponent selection system into a complete, playable roguelike game.**

**What You'll Have After Phase 7:**
- 🎮 Full playable game loop (10+ battles)
- 🎨 7 polished screens (menu, starter, opponent, battle, rewards, recruit, settings)
- ⚔️ 12 starter units + 30 opponents + 30 items
- 🎬 Animated battles with psynergy effects
- 💾 Complete save/load system
- ⚙️ Settings and accessibility features
- ✅ 182+ tests (100% passing)
- 🚀 Ship-ready for Steam/Itch.io

**Time:** 15 hours  
**Status:** Ready to start  
**Next Step:** Begin with 7.1 (Main Menu Screen)

---

**Let's build Phase 7!** 🚀
