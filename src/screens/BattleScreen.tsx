/*
 * BattleScreen (manual): Player-controlled JRPG battle
 *
 * Controls:
 *  - Arrow Up/Down: navigate action menu
 *  - Enter/Space: select action / confirm target
 *  - Arrow Left/Right (in targeting): change target
 *  - Escape: cancel targeting, or Flee from the menu
 *
 * Produces a BattleResult compatible with RewardSystem:
 *  - winner: 'player' | 'enemy' | 'draw' (flee = draw)
 *  - actions: CombatAction[]
 *  - unitsDefeated: string[] (enemy unit IDs)
 *  - turnsTaken: number
 */

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { BattleUnit, BattleResult, CombatAction } from '../types/game.js';
import { useKeyboard } from '../hooks/useKeyboard.js';
import { AnimatedUnitSprite } from '../components/battle/AnimatedUnitSprite.js';
import { AnimatedEnemySprite } from '../components/battle/AnimatedEnemySprite.js';
import { GoldenSunHPBar } from '../components/battle/GoldenSunHPBar.js';
import { AttackAnimation } from '../components/battle/AttackAnimation.js';
import { ActionMenu } from '../components/battle/ActionMenu.js';
import { PlayerStatusPanel } from '../components/battle/PlayerStatusPanel.js';
import { TurnBanner } from '../components/battle/TurnBanner.js';
import { TargetHelp } from '../components/battle/TargetHelp.js';
import { makeRng } from '../utils/rng.js';
import { getBattleBackground, preloadCommonSprites } from '../data/spriteRegistry.js';

export interface ManualBattleScreenProps {
  playerUnits: BattleUnit[];
  enemyUnits: BattleUnit[];
  onComplete: (result: BattleResult) => void;
  battleIndex?: number; // For deterministic background selection
}

type Phase = 'menu' | 'targeting' | 'animating' | 'resolving';

const ACTIONS = ['Attack', 'Defend', 'Flee'] as const;

export function BattleScreen({
  playerUnits,
  enemyUnits,
  onComplete,
  battleIndex = 0,
}: ManualBattleScreenProps): React.ReactElement {
  // Golden Sun background (deterministic)
  const background = useMemo(() => getBattleBackground(battleIndex), [battleIndex]);

  // Preload common sprites on mount
  useEffect(() => {
    preloadCommonSprites().catch(err => console.warn('Sprite preload failed:', err));
  }, []);
  // Mutable battle state (cloned)
  const [players, setPlayers] = useState<BattleUnit[]>(
    playerUnits.map(u => ({ ...u, currentHp: Math.max(0, u.currentHp) }))
  );
  const [enemies, setEnemies] = useState<BattleUnit[]>(
    enemyUnits.map(u => ({ ...u, currentHp: Math.max(0, u.currentHp) }))
  );

  // Turn & UI state
  const [turnsTaken, setTurnsTaken] = useState(0);
  const [roundOrder, setRoundOrder] = useState<string[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [targetedId, setTargetedId] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>('menu');
  const [menuIndex, setMenuIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);

  // Attack animation state
  const [showAttackAnim, setShowAttackAnim] = useState(false);
  const [attackAnimRole, setAttackAnimRole] = useState<any>(null);
  const [attackAnimPos, setAttackAnimPos] = useState({ x: 0, y: 0 });

  // Flags (e.g., defend)
  const defending = useRef<Set<string>>(new Set());

  // Log output for RewardSystem
  const [seq, setSeq] = useState(1);
  const [actions, setActions] = useState<CombatAction[]>([]);

  // Deterministic RNG for damage variance
  const rngRef = useRef(makeRng(Date.now()));

  // Enemy refs for position targeting
  const enemyEls = useRef<Record<string, HTMLDivElement | null>>({});

  // Derived lists
  const alivePlayers = useMemo(() => players.filter(u => u.currentHp > 0), [players]);
  const aliveEnemies = useMemo(() => enemies.filter(u => u.currentHp > 0), [enemies]);

  // Compute initiative order for a round
  const computeRoundOrder = useCallback((): string[] => {
    const alive = [...alivePlayers, ...aliveEnemies];
    alive.sort((a, b) => {
      if (b.speed !== a.speed) return b.speed - a.speed;
      if (a.isPlayer !== b.isPlayer) return a.isPlayer ? -1 : 1;
      return a.originalIndex - b.originalIndex;
    });
    return alive.map(u => u.id);
  }, [alivePlayers, aliveEnemies]);

  const findUnit = useCallback((id: string): BattleUnit | undefined => {
    return players.find(u => u.id === id) ?? enemies.find(u => u.id === id);
  }, [players, enemies]);

  const isBattleOver = useMemo(() => {
    const playersDead = alivePlayers.length === 0;
    const enemiesDead = aliveEnemies.length === 0;
    return { playersDead, enemiesDead, over: playersDead || enemiesDead };
  }, [alivePlayers, aliveEnemies]);

  const finishBattle = useCallback((winner: 'player' | 'enemy' | 'draw') => {
    const unitsDefeated = enemyUnits
      .filter(e => (enemies.find(x => x.id === e.id)?.currentHp ?? 0) <= 0)
      .map(e => e.id);

    const result: BattleResult = {
      winner,
      actions,
      unitsDefeated,
      turnsTaken,
    };
    onComplete(result);
  }, [actions, enemies, enemyUnits, onComplete, turnsTaken]);

  // Damage formula
  const computeDamage = useCallback((attacker: BattleUnit, defender: BattleUnit): number => {
    const base = Math.floor(attacker.atk - defender.def / 2);
    const variance = rngRef.current.int(-2, 2);
    let dmg = Math.max(1, base + variance);
    if (defending.current.has(defender.id)) {
      dmg = Math.floor(dmg * 0.5);
    }
    return Math.max(1, dmg);
  }, []);

  const applyDamage = useCallback((defenderId: string, amount: number) => {
    setPlayers(prev =>
      prev.map(u => u.id !== defenderId ? u : { ...u, currentHp: Math.max(0, u.currentHp - amount) })
    );
    setEnemies(prev =>
      prev.map(u => u.id !== defenderId ? u : { ...u, currentHp: Math.max(0, u.currentHp - amount) })
    );
    if (defending.current.has(defenderId)) {
      defending.current.delete(defenderId);
    }
  }, []);

  const pushAction = useCallback((a: Omit<CombatAction, 'seq'>) => {
    setActions(prev => [...prev, { ...a, seq }]);
    setSeq(s => s + 1);
  }, [seq]);

  const advanceTurnPointer = useCallback(() => {
    const nextIndex = roundIdx + 1;
    if (nextIndex >= roundOrder.length) {
      setTurnsTaken(t => t + 1);
      const nextOrder = computeRoundOrder();
      setRoundOrder(nextOrder);
      setRoundIdx(0);
      setActiveId(nextOrder[0] ?? null);
    } else {
      setRoundIdx(nextIndex);
      setActiveId(roundOrder[nextIndex] ?? null);
    }
  }, [roundIdx, roundOrder, computeRoundOrder]);

  const getTargetCenter = useCallback((id: string) => {
    const el = enemyEls.current[id];
    if (!el || typeof window === 'undefined') {
      return { x: Math.round((typeof window !== 'undefined' ? window.innerWidth : 800) / 2), y: Math.round((typeof window !== 'undefined' ? window.innerHeight : 600) / 2) };
    }
    const r = el.getBoundingClientRect();
    return { 
      x: Math.round(r.left + r.width / 2 + (typeof window !== 'undefined' ? window.scrollX : 0)), 
      y: Math.round(r.top + r.height / 2 + (typeof window !== 'undefined' ? window.scrollY : 0))
    };
  }, []);

  // Initialize first round
  useEffect(() => {
    const order = computeRoundOrder();
    setRoundOrder(order);
    setRoundIdx(0);
    setActiveId(order[0] ?? null);
    setPhase('menu');
  }, [computeRoundOrder]);

  // Handle active unit changes - FIXED: prevent infinite loop
  const hasHandledTurn = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    if (!activeId) return;
    
    // Prevent handling same unit multiple times
    const turnKey = `${activeId}-${roundIdx}`;
    if (hasHandledTurn.current.has(turnKey)) return;
    
    if (isBattleOver.over) {
      if (isBattleOver.enemiesDead) finishBattle('player');
      else if (isBattleOver.playersDead) finishBattle('enemy');
      return;
    }
    
    const unit = findUnit(activeId);
    if (!unit) return;

    if (unit.currentHp <= 0) {
      hasHandledTurn.current.add(turnKey);
      advanceTurnPointer();
      return;
    }

    if (unit.isPlayer) {
      if (phase !== 'menu') {
        setMenuIndex(0);
        setPhase('menu');
      }
      hasHandledTurn.current.add(turnKey);
    } else if (phase === 'menu' || phase === 'resolving') {
      // Enemy AI: attack lowest HP player (only trigger once per turn)
      hasHandledTurn.current.add(turnKey);
      setPhase('animating');
      
      const target = [...alivePlayers].sort((a, b) => a.currentHp - b.currentHp)[0];
      if (!target) {
        finishBattle('enemy');
        return;
      }

      const dmg = computeDamage(unit, target);
      setTargetedId(target.id);
      
      // Show attack animation
      setAttackAnimRole(unit.role);
      setAttackAnimPos(getTargetCenter(target.id));
      setShowAttackAnim(true);
      
      pushAction({ type: 'attack', actorId: unit.id, targetId: target.id, damage: dmg });

      setTimeout(() => {
        applyDamage(target.id, dmg);
      }, 400);

      setTimeout(() => {
        setShowAttackAnim(false);
        setTargetedId(null);
        setPhase('resolving');
        advanceTurnPointer();
      }, 800);
    }
  }, [
    activeId,
    roundIdx,
    phase,
    alivePlayers,
    advanceTurnPointer,
    applyDamage,
    computeDamage,
    findUnit,
    finishBattle,
    getTargetCenter,
    isBattleOver,
    pushAction,
  ]);

  const confirmFlee = useCallback(() => finishBattle('draw'), [finishBattle]);

  const handleConfirmAction = useCallback(() => {
    if (!activeId) return;
    const actor = findUnit(activeId);
    if (!actor || !actor.isPlayer) return;

    const label = ACTIONS[menuIndex];
    if (label === 'Attack') {
      if (aliveEnemies.length === 0) return;
      setTargetIndex(0);
      setPhase('targeting');
      setTargetedId(aliveEnemies[0].id);
    } else if (label === 'Defend') {
      defending.current.add(actor.id);
      pushAction({ type: 'defend', actorId: actor.id });
      setPhase('resolving');
      advanceTurnPointer();
    } else if (label === 'Flee') {
      confirmFlee();
    }
  }, [activeId, aliveEnemies, advanceTurnPointer, confirmFlee, findUnit, menuIndex, pushAction]);

  const handleConfirmTarget = useCallback(() => {
    if (!activeId) return;
    const actor = findUnit(activeId);
    if (!actor) return;

    if (phase !== 'targeting') return;
    const target = aliveEnemies[targetIndex];
    if (!target) return;

    setPhase('animating');

    const dmg = computeDamage(actor, target);
    setTargetedId(target.id);
    
    // Show attack animation at target position
    setAttackAnimRole(actor.role);
    setAttackAnimPos(getTargetCenter(target.id));
    setShowAttackAnim(true);
    
    pushAction({ type: 'attack', actorId: actor.id, targetId: target.id, damage: dmg });

    setTimeout(() => {
      applyDamage(target.id, dmg);
    }, 400);

    setTimeout(() => {
      setShowAttackAnim(false);
      setTargetedId(null);
      setPhase('resolving');
      advanceTurnPointer();
    }, 800);
  }, [
    activeId,
    advanceTurnPointer,
    aliveEnemies,
    applyDamage,
    computeDamage,
    findUnit,
    getTargetCenter,
    phase,
    pushAction,
    targetIndex,
  ]);

  const keyboardEnabled = phase === 'menu' || phase === 'targeting';

  useKeyboard({
    enabled: keyboardEnabled,
    onUp: () => {
      if (phase !== 'menu') return;
      setMenuIndex(i => (i - 1 + ACTIONS.length) % ACTIONS.length);
    },
    onDown: () => {
      if (phase !== 'menu') return;
      setMenuIndex(i => (i + 1) % ACTIONS.length);
    },
    onLeft: () => {
      if (phase !== 'targeting') return;
      setTargetIndex(i => {
        const next = (i - 1 + aliveEnemies.length) % Math.max(1, aliveEnemies.length);
        setTargetedId(aliveEnemies[next]?.id ?? null);
        return next;
      });
    },
    onRight: () => {
      if (phase !== 'targeting') return;
      setTargetIndex(i => {
        const next = (i + 1) % Math.max(1, aliveEnemies.length);
        setTargetedId(aliveEnemies[next]?.id ?? null);
        return next;
      });
    },
    onEnter: () => {
      if (phase === 'menu') handleConfirmAction();
      else if (phase === 'targeting') handleConfirmTarget();
    },
    onSpace: () => {
      if (phase === 'menu') handleConfirmAction();
      else if (phase === 'targeting') handleConfirmTarget();
    },
    onEscape: () => {
      if (phase === 'targeting') {
        setPhase('menu');
        setTargetedId(null);
      } else if (phase === 'menu') {
        confirmFlee();
      }
    },
  });

  useEffect(() => {
    if (!activeId && roundOrder.length > 0) {
      setActiveId(roundOrder[roundIdx] ?? null);
    }
    if (isBattleOver.over) {
      if (isBattleOver.enemiesDead) finishBattle('player');
      else if (isBattleOver.playersDead) finishBattle('enemy');
    }
  }, [activeId, roundIdx, roundOrder, finishBattle, isBattleOver]);

  return (
    <div className="min-h-screen w-full text-white relative overflow-hidden">
      {/* Golden Sun Battle Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: `url(${background})`,
          imageRendering: 'pixelated',
        }}
      />
      
      {/* Dark overlay for better visibility */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      <div className="max-w-6xl mx-auto px-4 pt-8 pb-24 relative z-20">
        <TurnBanner turn={turnsTaken + 1} />

        {/* Enemy line - Golden Sun sprites */}
        <div className="mt-6 grid grid-cols-4 gap-4 justify-items-center">
          {enemies.map((u) => (
            <div key={u.id} ref={(el) => { enemyEls.current[u.id] = el; }} className="flex flex-col items-center">
              <AnimatedEnemySprite
                unit={u}
                isHit={targetedId === u.id && phase === 'animating'}
                className={`
                  transition-all duration-200
                  ${activeId === u.id ? 'scale-110 drop-shadow-lg' : ''}
                  ${targetedId === u.id ? 'ring-4 ring-red-400' : ''}
                `}
              />
              <div className="mt-2 w-full">
                <GoldenSunHPBar unit={u} showName={true} />
              </div>
            </div>
          ))}
        </div>

        {/* Player line - Golden Sun sprites */}
        <div className="mt-10 grid grid-cols-4 gap-4 justify-items-center">
          {players.map((u) => (
            <div key={u.id} className="flex flex-col items-center">
              <AnimatedUnitSprite
                unit={u}
                isAttacking={activeId === u.id && phase === 'animating'}
                isHit={targetedId === u.id && phase === 'animating'}
                className={`
                  transition-all duration-200
                  ${activeId === u.id ? 'scale-110 drop-shadow-2xl' : ''}
                  ${targetedId === u.id ? 'ring-4 ring-yellow-400' : ''}
                `}
              />
              <div className="mt-2 w-full px-2">
                <GoldenSunHPBar unit={u} showName={true} />
              </div>
            </div>
          ))}
        </div>

        {/* Right-side HUD */}
        <div className="absolute bottom-6 right-6 w-80 z-30">
          <PlayerStatusPanel
            unit={findUnit(activeId ?? '') ?? alivePlayers[0] ?? players[0]}
            phase={phase}
            defending={defending.current.has(activeId ?? '')}
          />
          <div className="mt-3">
            <ActionMenu
              items={ACTIONS as unknown as string[]}
              selectedIndex={menuIndex}
              disabled={phase !== 'menu'}
              title={phase === 'targeting' ? 'Choose Target' : 'Actions'}
            />
            {phase === 'targeting' && (
              <TargetHelp />
            )}
          </div>
        </div>
      </div>

      {/* Attack animation overlay - FIXED with Prompt 2 solution */}
      {showAttackAnim && attackAnimRole && (
        <AttackAnimation
          attackerRole={attackAnimRole}
          targetPosition={attackAnimPos}
          onComplete={() => setShowAttackAnim(false)}
          duration={800}
        />
      )}
    </div>
  );
}

export default BattleScreen;

