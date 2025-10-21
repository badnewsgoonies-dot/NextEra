# Battle Formation Visual Diagrams

Complete visual reference for all battlefield formations (1-4 units per team).

---

## Legend

```
[P#] = Player unit (foreground, 100% scale)
[E#] = Enemy unit (background, 80% scale)

Coordinates shown as (x, y) in pixels
Grid squares represent 50px for scale reference
```

---

## 1v1 Formation

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                          TOP-RIGHT (Enemies)                │
│                          ┌──────────┐                       │
│                          │  [E1]    │                       │
│                          │  (0,0)   │                       │
│                          │  80%     │                       │
│                          └──────────┘                       │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│         BOTTOM-LEFT (Players)                               │
│         ┌──────────┐                                        │
│         │  [P1]    │                                        │
│         │  (0,0)   │                                        │
│         │  100%    │                                        │
│         └──────────┘                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Units: 1 player, 1 enemy
Formation: Single unit at origin for each team
```

---

## 2v2 Formation

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                     TOP-RIGHT (Enemies)                     │
│                  ┌──────────┐      ┌──────────┐            │
│                  │  [E1]    │      │  [E2]    │            │
│                  │  (0,0)   │      │ (180,0)  │            │
│                  │  80%     │      │  80%     │            │
│                  └──────────┘      └──────────┘            │
│                  ◄────180px────►                            │
│                                                             │
│                                                             │
│    BOTTOM-LEFT (Players)                                    │
│    ┌──────────┐      ┌──────────┐                          │
│    │  [P1]    │      │  [P2]    │                          │
│    │  (0,0)   │      │ (170,0)  │                          │
│    │  100%    │      │  100%    │                          │
│    └──────────┘      └──────────┘                          │
│    ◄────170px────►                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Units: 2 players, 2 enemies
Formation: Horizontal row (front row only)
```

---

## 3v3 Formation

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     TOP-RIGHT (Enemies)                     │
│                       ┌──────────┐                          │
│                       │  [E3]    │  ← Back row              │
│                       │ (30,80)  │    (shifted right)       │
│                       │  80%     │                          │
│                       └──────────┘                          │
│                  ┌──────────┐      ┌──────────┐            │
│                  │  [E1]    │      │  [E2]    │            │
│                  │  (0,0)   │      │ (180,0)  │            │
│                  │  80%     │      │  80%     │            │
│                  └──────────┘      └──────────┘            │
│                                                             │
│    BOTTOM-LEFT (Players)                                    │
│         ┌──────────┐                                        │
│         │  [P3]    │  ← Back row                            │
│         │ (25,70)  │    (shifted right)                     │
│         │  100%    │                                        │
│         └──────────┘                                        │
│    ┌──────────┐      ┌──────────┐                          │
│    │  [P1]    │      │  [P2]    │                          │
│    │  (0,0)   │      │ (170,0)  │                          │
│    │  100%    │      │  100%    │                          │
│    └──────────┘      └──────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Units: 3 players, 3 enemies
Formation: 2 front + 1 back (diagonal depth)
```

---

## 4v4 Formation (Complete 2x2 Grid)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     TOP-RIGHT (Enemies)                     │
│                                                             │
│                       ┌──────────┐      ┌──────────┐       │
│                       │  [E3]    │      │  [E4]    │ ← Back│
│                       │ (30,80)  │      │ (210,80) │       │
│                       │  80%     │      │  80%     │       │
│                       └──────────┘      └──────────┘       │
│                  ┌──────────┐      ┌──────────┐            │
│                  │  [E1]    │      │  [E2]    │ ← Front    │
│                  │  (0,0)   │      │ (180,0)  │            │
│                  │  80%     │      │  80%     │            │
│                  └──────────┘      └──────────┘            │
│                  ◄────180px────►                            │
│                                                             │
│    BOTTOM-LEFT (Players)                                    │
│         ┌──────────┐      ┌──────────┐                     │
│         │  [P3]    │      │  [P4]    │ ← Back              │
│         │ (25,70)  │      │ (195,70) │                     │
│         │  100%    │      │  100%    │                     │
│         └──────────┘      └──────────┘                     │
│    ┌──────────┐      ┌──────────┐                          │
│    │  [P1]    │      │  [P2]    │ ← Front                  │
│    │  (0,0)   │      │ (170,0)  │                          │
│    │  100%    │      │  100%    │                          │
│    └──────────┘      └──────────┘                          │
│    ◄────170px────►                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Units: 4 players, 4 enemies
Formation: Perfect 2x2 diagonal grid
Depth: Back row shifted right (25px players, 30px enemies)
```

---

## Asymmetric Formations

### 1v4 Formation

```
┌─────────────────────────────────────────────────────────────┐
│                     TOP-RIGHT (Enemies - Full 2x2)          │
│                       ┌──────────┐      ┌──────────┐       │
│                       │  [E3]    │      │  [E4]    │       │
│                       │ (30,80)  │      │ (210,80) │       │
│                       └──────────┘      └──────────┘       │
│                  ┌──────────┐      ┌──────────┐            │
│                  │  [E1]    │      │  [E2]    │            │
│                  │  (0,0)   │      │ (180,0)  │            │
│                  └──────────┘      └──────────┘            │
│                                                             │
│                                                             │
│    BOTTOM-LEFT (Player - Lone Hero)                         │
│    ┌──────────┐                                             │
│    │  [P1]    │                                             │
│    │  (0,0)   │                                             │
│    │  100%    │                                             │
│    └──────────┘                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Strategy: Lone hero faces overwhelming odds
```

### 4v1 Formation

```
┌─────────────────────────────────────────────────────────────┐
│                     TOP-RIGHT (Enemy - Boss)                │
│                  ┌──────────┐                               │
│                  │  [E1]    │                               │
│                  │  (0,0)   │                               │
│                  │  80%     │                               │
│                  └──────────┘                               │
│                                                             │
│                                                             │
│    BOTTOM-LEFT (Players - Full Party)                       │
│         ┌──────────┐      ┌──────────┐                     │
│         │  [P3]    │      │  [P4]    │                     │
│         │ (25,70)  │      │ (195,70) │                     │
│         └──────────┘      └──────────┘                     │
│    ┌──────────┐      ┌──────────┐                          │
│    │  [P1]    │      │  [P2]    │                          │
│    │  (0,0)   │      │ (170,0)  │                          │
│    └──────────┘      └──────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Strategy: Full party vs single powerful enemy (boss fight)
```

### 2v3 Formation

```
┌─────────────────────────────────────────────────────────────┐
│                     TOP-RIGHT (Enemies)                     │
│                       ┌──────────┐                          │
│                       │  [E3]    │                          │
│                       │ (30,80)  │                          │
│                       └──────────┘                          │
│                  ┌──────────┐      ┌──────────┐            │
│                  │  [E1]    │      │  [E2]    │            │
│                  │  (0,0)   │      │ (180,0)  │            │
│                  └──────────┘      └──────────┘            │
│                                                             │
│                                                             │
│    BOTTOM-LEFT (Players)                                    │
│    ┌──────────┐      ┌──────────┐                          │
│    │  [P1]    │      │  [P2]    │                          │
│    │  (0,0)   │      │ (170,0)  │                          │
│    └──────────┘      └──────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Players: Front row only (2 units)
Enemies: Front row + 1 back (3 units with depth)
```

---

## Position Calculation Reference

### Grid Formula

```
For index i in [0, 1, 2, 3]:

  row = floor(i / 2)    // Integer division by 2
  col = i % 2           // Modulo 2 (0 or 1)

  x = col × COLUMN_SPACING + row × DIAGONAL_OFFSET
  y = row × ROW_SPACING
```

### Example Calculations

**Player Unit 3:**
```
index = 3
row = floor(3 / 2) = 1
col = 3 % 2 = 1

x = 1 × 170 + 1 × 25 = 195px
y = 1 × 70 = 70px

Result: (195, 70)
```

**Enemy Unit 2:**
```
index = 2
row = floor(2 / 2) = 1
col = 2 % 2 = 0

x = 0 × 180 + 1 × 30 = 30px
y = 1 × 80 = 80px

Result: (30, 80)
```

---

## Depth Perception Diagram

```
Side View (visualizing depth):

        Back Row                    Front Row
        (row 1)                     (row 0)
           │                           │
           │                           │
           ▼                           ▼
    ┌─────────────┐            ┌─────────────┐
    │   [P3/P4]   │            │   [P1/P2]   │
    │   Smaller   │            │   Larger    │
    │   Further   │            │   Closer    │
    └─────────────┘            └─────────────┘
           ▲                           ▲
           │                           │
           │◄──── Diagonal Shift ─────►│
           │    Creates Depth          │
           │                           │


Top-Down View (showing diagonal offset):

Front Row (y=0):
    [P1]────170px────[P2]
    ●                 ●

Back Row (y=70):
      25px shift
         ↓
        [P3]────170px────[P4]
        ●                 ●
```

---

## Scale Comparison

```
Enemy Sprite (80% scale):          Player Sprite (100% scale):

   ┌────────┐                         ┌──────────┐
   │        │                         │          │
   │  80%   │                         │   100%   │
   │ Enemy  │                         │  Player  │
   │        │                         │          │
   └────────┘                         └──────────┘
      64px                                80px
    (approx)                            (approx)

Visual Effect: Enemies appear further back in 3D space
```

---

## Formation Pattern Summary

```
1 Unit:   ●              (single origin point)

2 Units:  ● ●            (horizontal row)

3 Units:    ●            (1 back, 2 front - depth starts)
           ● ●

4 Units:   ● ●           (2x2 grid - full depth)
           ● ●
```

---

## Common Issues to Watch For

### ❌ Wrong: Linear Layout (Old Implementation)

```
All units in a straight line:

    [P1] [P2] [P3] [P4]
    ●    ●    ●    ●

Problem: No depth perception, all same y-coordinate
```

### ✅ Correct: 2x2 Diagonal Grid

```
Back row offset for depth:

         ● ●   [P3] [P4]  ← y=70, x offset by 25
    ● ●        [P1] [P2]  ← y=0

Result: Visual depth, diagonal stagger
```

---

## Testing Checklist

Use this checklist when visually inspecting formations:

**For Each Formation:**
- [ ] Front row units aligned horizontally (same y)
- [ ] Back row units aligned horizontally (same y)
- [ ] Back row shifted down from front row
- [ ] Back row shifted right (diagonal offset visible)
- [ ] Column spacing consistent within rows
- [ ] Enemy sprites appear smaller than player sprites
- [ ] No overlapping units
- [ ] Units positioned within viewport
- [ ] Formation looks balanced/centered

**For 4v4 Specifically:**
- [ ] Perfect 2x2 grid visible
- [ ] 4 distinct positions per team
- [ ] Diagonal line from P1 to P4 creates depth
- [ ] Same pattern for enemy team

---

## Viewport Positioning

```
Screen Layout (1920x1080 reference):

┌────────────────────────────────────────────────┐
│ Turn Banner (top-left)                         │
│                                                │
│                     ┌─────────────┐ Enemy     │
│                     │ Enemy Units │ Formation │
│                     │  (top-right)│           │
│                     └─────────────┘           │
│                                                │
│ ┌──────────┐                                  │
│ │ Player   │                                  │
│ │  Units   │                         ┌──────┐ │
│ │(bot-left)│                         │ HUD  │ │
│ └──────────┘                         │Menu  │ │
│                                      └──────┘ │
└────────────────────────────────────────────────┘

Absolute positioning places units relative to:
- Players: bottom-left corner
- Enemies: top-right corner
```

---

**Document Status:** ✅ Complete
**Last Updated:** 2025-10-21
**Diagrams:** 11 formation scenarios
**Purpose:** Visual reference for QA testing
