# UI Implementation Plan - Golden Sun Inspired

**Based on:** answer.pptx mockups + NextEra MVP spec  
**Sprite Package:** psynergy.zip (Golden Sun animations)  
**Status:** Ready to implement

---

## UI Mockups from PowerPoint

### Slide 2: Main Menu

```
┌─────────────────────┐
│   NextRealDeal      │
│                     │
│   > New Game        │
│     Load Game       │
│     Settings        │
│     Exit            │
└─────────────────────┘
```

### Slide 3: Choose Your Opponent (ALREADY IMPLEMENTED ✅)

```
┌──────────────────────────────────────────────────────┐
│  Choose Your Opponent                                 │
│                                                       │
│  [Opponent A]    [Opponent B]    [Opponent C]       │
│  Threat: 20      Threat: 25      Threat: 30         │
│  Difficulty: Easy Difficulty: Medium Difficulty: Hard│
│  Tags: Bandits   Tags: Beasts    Tags: Fliers       │
│  Fliers          Poison           Bandits            │
└──────────────────────────────────────────────────────┘
```

**Status:** ✅ Already have OpponentSelectScreen with better design!

### Slide 4: Battle Screen

```
┌──────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐             │
│  │  Isaac   │  │  Enemy1  │             │
│  │  HP 120  │  │  HP  80  │             │
│  │  MP  4   │  │          │             │
│  └──────────┘  └──────────┘             │
│                                          │
│  ┌──────────┐  ┌──────────┐             │
│  │  Garet   │  │  Enemy2  │             │
│  └──────────┘  └──────────┘             │
│                                          │
│  Active: Isaac                           │
│  ┌────────────────────┐                 │
│  │ > Attack           │                 │
│  │   Spells           │                 │
│  │   Items            │                 │
│  │   Defend           │                 │
│  └────────────────────┘                 │
└──────────────────────────────────────────┘
```

### Slide 5: Rewards & Recruit

```
┌──────────────────────────────────────────┐
│  Rewards & Recruit                        │
│                                          │
│  Rewards:                                │
│  +100 Gold                               │
│  Potion                                  │
│  Power Scroll                            │
│                                          │
│  Recruit Defeated Unit:                  │
│  ┌────────────────┐  ┌────────────────┐ │
│  │ Ruffian        │  │ Brigand        │ │
│  │ HP 75  ATK 18  │  │ HP 90  ATK 22  │ │
│  │ [Recruit]      │  │ [Recruit]      │ │
│  └────────────────┘  └────────────────┘ │
│                                          │
│  Max 4 units. If roster full, replace.   │
└──────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Copy Sprites to Project (~15 min)

```bash
# Copy psynergy animations to public assets
mkdir -p /home/geni/Documents/NextEraGame/NextEra/public/sprites/psynergy
cp -r /tmp/sprites/psynergy/*.gif /home/geni/Documents/NextEraGame/NextEra/public/sprites/psynergy/

# Organize by type
mkdir -p public/sprites/{ui,characters,abilities}
```

**Sprites Available:**

- Psynergy animations (attack effects): Blue_Bolt, Dragon_Fire, Inferno, etc.
- Unleashes (special attacks): Titan_Blade, Mortal_Danger
- Summons (large attacks): Ragnarok

**Missing (need to source or create):**

- Character battle sprites (Isaac, Garet, Ivan, Mia)
- Enemy sprites (Bandits, Beasts, etc.)
- UI icons (HP/MP bars, menu cursors)

### Phase 2: Main Menu Screen (~1 hour)

**File:** `src/screens/MainMenuScreen.tsx`

**Features:**

- Vertical menu (New Game, Load Game, Settings, Exit)
- Keyboard navigation (Up/Down, Enter)
- Arrow cursor animation
- Background image (optional)

**Component:**

```typescript
export function MainMenuScreen({
  onNewGame,
  onLoadGame,
  onSettings,
  onExit,
}: MainMenuProps) {
  // Keyboard navigation (arrow keys + enter)
  // Animated cursor
  // Sound effects on selection
}
```

### Phase 3: Battle Screen (~3-4 hours)

**File:** `src/screens/BattleScreen.tsx`

**Layout (Golden Sun style):**

- Left column: Player party (4 units max)
- Right column: Enemy party (1-4 units)
- Bottom: Active unit panel + action menu
- Center: Battle animation area

**Components Needed:**

1. **UnitBattleCard** - Shows unit sprite, HP/MP bars, status
2. **ActionMenu** - Attack/Spells/Items/Defend
3. **BattleAnimationLayer** - Displays attack animations
4. **TurnOrderIndicator** - Shows who's next

**Battle Flow:**

```typescript
// Use BattleResult.actions to animate
actions.forEach((action, i) => {
  setTimeout(() => {
    if (action.type === 'attack') {
      // 1. Show attacker animation
      // 2. Play attack effect (psynergy animation)
      // 3. Display damage number
      // 4. Update defender HP bar
    }
  }, i * 800); // 800ms per action
});
```

**Features:**

- Auto-battle visualization (no player input during combat)
- Damage numbers pop up on hit
- HP bars animate down
- Death animations (unit fades out)
- Victory/defeat screen after battle ends

### Phase 4: Rewards Screen (~2 hours)

**File:** `src/screens/RewardsScreen.tsx`

**Features:**

- Display items gained (from BattleReward)
- Gold amount (if implemented)
- Experience points (if implemented)
- Continue button → Recruit screen

**Component:**

```typescript
export function RewardsScreen({
  rewards: BattleReward,
  onContinue,
}: RewardsScreenProps) {
  // Animate rewards appearing
  // Show item icons/names
  // Continue to recruit
}
```

### Phase 5: Recruit Screen (~2 hours)

**File:** `src/screens/RecruitScreen.tsx`

**Features:**

- Show defeated enemies (from BattleResult.unitsDefeated)
- Display unit stats (HP, ATK, Role, Tags)
- Recruit button on each
- If team full (4 units), show replacement modal
- Skip button (don't recruit)

**Logic:**

```typescript
export function RecruitScreen({
  defeatedEnemies: EnemyUnitTemplate[],
  currentTeam: PlayerUnit[],
  onRecruit: (enemyId: string, replaceId?: string) => void,
  onSkip: () => void,
}) {
  const [selectedEnemy, setSelectedEnemy] = useState<string | null>(null);
  const [showReplacementModal, setShowReplacementModal] = useState(false);

  const handleRecruit = (enemyId: string) => {
    if (currentTeam.length >= 4) {
      // Show replacement modal
      setSelectedEnemy(enemyId);
      setShowReplacementModal(true);
    } else {
      // Direct recruit
      onRecruit(enemyId);
    }
  };
}
```

### Phase 6: Starter Selection Screen (~2 hours)

**File:** `src/screens/StarterSelectionScreen.tsx`

**Features:**

- Grid of available starter units
- Select 4 units (checkboxes)
- Preview selected team
- Start button (disabled until 4 selected)

**Layout:**

```
┌────────────────────────────────────┐
│  Choose Your Starting Team (4)     │
│                                    │
│  [☑ Warrior]  [☐ Mage]            │
│  HP 100       HP 60                │
│  ATK 20       ATK 25               │
│                                    │
│  [☑ Rogue]    [☐ Cleric]          │
│  ...                               │
│                                    │
│  Selected: 2/4                     │
│  [Start] (disabled)                │
└────────────────────────────────────┘
```

---

## Sprite Integration Strategy

### Available Sprites (psynergy.zip)

- ✅ Psynergy animations (attack effects)
- ❌ Character battle sprites (need to source)
- ❌ Enemy sprites (need to source)
- ❌ UI elements (HP bars, cursors)

### Options

**Option A: Use Placeholder Sprites**

- Colored squares for units (red = player, blue = enemy)
- Animated borders for attacks
- Simple HP bars with Tailwind
- **Pros:** Fast, no asset dependencies
- **Cons:** Less polished

**Option B: Find/Create Character Sprites**

- Search for Golden Sun sprite sheets online
- Use psynergy animations for attacks only
- **Pros:** More authentic to mockup
- **Cons:** Requires asset hunting

**Option C: Hybrid Approach** (Recommended)

- Placeholder character sprites initially
- Use psynergy GIFs for attack animations
- Polish with real sprites later
- **Pros:** Functional now, upgradeable later
- **Cons:** Mixed visual style

---

## File Structure

```
src/
├── screens/
│   ├── MainMenuScreen.tsx          (NEW)
│   ├── OpponentSelectScreen.tsx    (✅ EXISTS)
│   ├── StarterSelectScreen.tsx     (NEW)
│   ├── TeamPrepScreen.tsx          (NEW - optional for MVP)
│   ├── BattleScreen.tsx            (NEW)
│   ├── RewardsScreen.tsx           (NEW)
│   └── RecruitScreen.tsx           (NEW)
├── components/
│   ├── battle/
│   │   ├── UnitBattleCard.tsx      (NEW)
│   │   ├── ActionMenu.tsx          (NEW)
│   │   ├── BattleAnimation.tsx     (NEW)
│   │   ├── DamageNumber.tsx        (NEW)
│   │   └── HPBar.tsx               (NEW)
│   └── recruit/
│       ├── RecruitCard.tsx         (NEW)
│       └── ReplacementModal.tsx    (NEW)
public/
└── sprites/
    ├── psynergy/                    (FROM ZIP)
    ├── characters/                  (TBD)
    └── enemies/                     (TBD)
```

---

## Implementation Priority

### Recommended Order

1. **Main Menu** (1 hour) - Entry point
2. **Battle Screen** (3-4 hours) - Core visualization
3. **Rewards Screen** (2 hours) - Simple
4. **Recruit Screen** (2 hours) - Team management
5. **Starter Selection** (2 hours) - Initial setup
6. **Polish & Animation** (2-3 hours) - Psynergy effects

**Total:** 12-14 hours for complete UI

---

## Quick Start Implementation

### Option 1: Minimal Viable UI (4-6 hours)

- Main Menu (basic)
- Battle Screen (placeholder sprites, show actions)
- Rewards Screen (list items)
- Recruit Screen (simple selection)
- **Result:** Playable end-to-end

### Option 2: Polished UI (12-14 hours)

- All screens with animations
- Psynergy GIF effects
- HP bar animations
- Damage number popups
- Sound effects (optional)
- **Result:** Production-quality presentation

### Option 3: Incremental (Recommended)

- Start with Option 1 (get it playable)
- Add polish incrementally
- Test with real users
- Iterate based on feedback

---

## Next Steps

**I can help you:**

**A) Implement Main Menu Screen** (1 hour)

- Wire to GameController
- Navigation working
- Save/load integration

**B) Implement Battle Screen** (3-4 hours)

- Visualize BattleResult.actions
- Animate combat sequence
- Use psynergy GIFs for attacks

**C) Complete All Screens** (12-14 hours)

- Full UI as per mockups
- End-to-end playable
- Sprite integration

**D) Find/Prepare Sprites First**

- Source character sprites
- Organize sprite assets
- Then implement screens

**Which approach would you prefer?**

Meanwhile, I have the psynergy animations ready to use for attack effects! 🎮
