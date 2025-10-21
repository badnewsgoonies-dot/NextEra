/*
 * useManualBattle: Battle logic hook for manual player-controlled combat
 *
 * Separates battle mechanics from UI rendering for better maintainability.
 * Handles turn order, damage calculation, state updates, and win conditions.
 *
 * This hook encapsulates all the game logic that was previously mixed into
 * the BattleScreen component, following the original architecture pattern
 * where battle systems are separate from UI.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BattleUnit, BattleResult, CombatAction } from '../types/game.js';
import { makeRng, type IRng } from '../utils/rng.js';

export type BattlePhase = 'menu' | 'targeting' | 'animating' | 'resolving';

export interface UseManualBattleProps {
  playerUnits: BattleUnit[];
  enemyUnits: BattleUnit[];
  onComplete: (result: BattleResult) => void;
  /** Seed for deterministic RNG (defaults to provided value for reproducibility) */
  seed?: number;
}

export interface UseManualBattleReturn {
  // Unit state
  players: BattleUnit[];
  enemies: BattleUnit[];
  alivePlayers: BattleUnit[];
  aliveEnemies: BattleUnit[];

  // Turn state
  turnsTaken: number;
  activeId: string | null;
  targetedId: string | null;
  phase: BattlePhase;

  // Battle state
  isBattleOver: { playersDead: boolean; enemiesDead: boolean; over: boolean };
  defending: ReadonlySet<string>;

  // Actions
  findUnit: (id: string) => BattleUnit | undefined;
  computeDamage: (attacker: BattleUnit, defender: BattleUnit) => number;
  applyDamage: (defenderId: string, amount: number) => void;
  executeDefend: (actorId: string) => void;
  executeFlee: () => void;
  advanceTurn: () => void;

  // Action tracking
  pushAction: (action: Omit<CombatAction, 'seq'>) => void;
}

/**
 * Calculate turn order based on speed, with deterministic tiebreakers
 *
 * Sort priority:
 * 1. Speed (highest first)
 * 2. Player units (break ties in favor of player)
 * 3. Original index (for full determinism)
 */
function computeTurnOrder(alivePlayers: BattleUnit[], aliveEnemies: BattleUnit[]): string[] {
  const alive = [...alivePlayers, ...aliveEnemies];
  alive.sort((a, b) => {
    // Primary: Speed (highest first)
    if (b.speed !== a.speed) return b.speed - a.speed;
    // Secondary: Player wins ties
    if (a.isPlayer !== b.isPlayer) return a.isPlayer ? -1 : 1;
    // Tertiary: Original index (deterministic)
    return a.originalIndex - b.originalIndex;
  });
  return alive.map(u => u.id);
}

/**
 * Custom hook that manages battle state and logic for manual combat
 *
 * Returns all necessary state and actions for the BattleScreen component
 * to render the UI and handle player input.
 */
export function useManualBattle({
  playerUnits,
  enemyUnits,
  onComplete,
  seed = Date.now(), // Allow seed override for deterministic battles
}: UseManualBattleProps): UseManualBattleReturn {
  // Clone units to avoid mutating props
  const [players, setPlayers] = useState<BattleUnit[]>(
    playerUnits.map(u => ({ ...u, currentHp: Math.max(0, u.currentHp) }))
  );
  const [enemies, setEnemies] = useState<BattleUnit[]>(
    enemyUnits.map(u => ({ ...u, currentHp: Math.max(0, u.currentHp) }))
  );

  // Turn & phase state
  const [turnsTaken, setTurnsTaken] = useState(0);
  const [roundOrder, setRoundOrder] = useState<string[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [targetedId, setTargetedId] = useState<string | null>(null);
  const [phase, setPhase] = useState<BattlePhase>('menu');

  // Battle mechanics
  const defending = useRef<Set<string>>(new Set());
  const rngRef = useRef<IRng>(makeRng(seed));

  // Action log for BattleResult
  const [seq, setSeq] = useState(1);
  const [actions, setActions] = useState<CombatAction[]>([]);

  // Derived state
  const alivePlayers = useMemo(() => players.filter(u => u.currentHp > 0), [players]);
  const aliveEnemies = useMemo(() => enemies.filter(u => u.currentHp > 0), [enemies]);

  // Victory condition
  const isBattleOver = useMemo(() => {
    const playersDead = alivePlayers.length === 0;
    const enemiesDead = aliveEnemies.length === 0;
    return { playersDead, enemiesDead, over: playersDead || enemiesDead };
  }, [alivePlayers, aliveEnemies]);

  // Find unit by ID across both teams
  const findUnit = useCallback((id: string): BattleUnit | undefined => {
    return players.find(u => u.id === id) ?? enemies.find(u => u.id === id);
  }, [players, enemies]);

  /**
   * Calculate damage using the battle formula
   * Formula: floor(atk - def/2) + variance(-2, 2), minimum 1
   * Applies 50% reduction if defender is defending
   */
  const computeDamage = useCallback((attacker: BattleUnit, defender: BattleUnit): number => {
    const base = Math.floor(attacker.atk - defender.def / 2);
    const variance = rngRef.current.int(-2, 2);
    let dmg = Math.max(1, base + variance);

    // Defend reduces damage by 50%
    if (defending.current.has(defender.id)) {
      dmg = Math.floor(dmg * 0.5);
    }

    return Math.max(1, dmg);
  }, []);

  /**
   * Apply damage to a unit (mutates state)
   * Clears defend status after taking damage
   */
  const applyDamage = useCallback((defenderId: string, amount: number) => {
    setPlayers(prev =>
      prev.map(u => u.id !== defenderId ? u : { ...u, currentHp: Math.max(0, u.currentHp - amount) })
    );
    setEnemies(prev =>
      prev.map(u => u.id !== defenderId ? u : { ...u, currentHp: Math.max(0, u.currentHp - amount) })
    );

    // Clear defend status when hit
    if (defending.current.has(defenderId)) {
      defending.current.delete(defenderId);
    }
  }, []);

  /**
   * Log an action to the battle result
   */
  const pushAction = useCallback((a: Omit<CombatAction, 'seq'>) => {
    setActions(prev => [...prev, { ...a, seq }]);
    setSeq(s => s + 1);
  }, [seq]);

  /**
   * Advance to the next unit's turn
   * Handles round transitions and turn counting
   */
  const advanceTurn = useCallback(() => {
    const nextIndex = roundIdx + 1;
    if (nextIndex >= roundOrder.length) {
      // Start new round
      setTurnsTaken(t => t + 1);
      const nextOrder = computeTurnOrder(alivePlayers, aliveEnemies);
      setRoundOrder(nextOrder);
      setRoundIdx(0);
      setActiveId(nextOrder[0] ?? null);
    } else {
      // Next unit in current round
      setRoundIdx(nextIndex);
      setActiveId(roundOrder[nextIndex] ?? null);
    }
  }, [roundIdx, roundOrder, alivePlayers, aliveEnemies]);

  /**
   * Execute a defend action for a unit
   */
  const executeDefend = useCallback((actorId: string) => {
    defending.current.add(actorId);
    pushAction({ type: 'defend', actorId });
  }, [pushAction]);

  /**
   * Execute flee action (ends battle as draw)
   */
  const executeFlee = useCallback(() => {
    const unitsDefeated = enemyUnits
      .filter(e => (enemies.find(x => x.id === e.id)?.currentHp ?? 0) <= 0)
      .map(e => e.id);

    const result: BattleResult = {
      winner: 'draw',
      actions,
      unitsDefeated,
      turnsTaken,
    };
    onComplete(result);
  }, [actions, enemies, enemyUnits, onComplete, turnsTaken]);

  /**
   * Initialize first round on mount
   */
  useEffect(() => {
    const order = computeTurnOrder(alivePlayers, aliveEnemies);
    setRoundOrder(order);
    setRoundIdx(0);
    setActiveId(order[0] ?? null);
    setPhase('menu');
  }, []); // Only run on mount

  /**
   * Check for battle end conditions
   */
  useEffect(() => {
    if (isBattleOver.over) {
      const unitsDefeated = enemyUnits
        .filter(e => (enemies.find(x => x.id === e.id)?.currentHp ?? 0) <= 0)
        .map(e => e.id);

      const winner = isBattleOver.enemiesDead ? 'player' : 'enemy';
      const result: BattleResult = {
        winner,
        actions,
        unitsDefeated,
        turnsTaken,
      };
      onComplete(result);
    }
  }, [isBattleOver, actions, enemies, enemyUnits, onComplete, turnsTaken]);

  return {
    // State
    players,
    enemies,
    alivePlayers,
    aliveEnemies,
    turnsTaken,
    activeId,
    targetedId,
    phase,
    isBattleOver,
    defending: defending.current,

    // Actions
    findUnit,
    computeDamage,
    applyDamage,
    executeDefend,
    executeFlee,
    advanceTurn,
    pushAction,
  };
}
