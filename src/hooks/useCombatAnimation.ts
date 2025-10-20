/*
 * useCombatAnimation: Coordinates combat animations
 * 
 * Orchestrates the complete attack sequence:
 * 1. Attacker sprite: Attack1 (200ms)
 * 2. Attacker sprite: Attack2 (200ms)
 * 3. Psynergy effect at target (400ms overlap)
 * 4. Target sprite: Hit animation (300ms)
 * 5. Damage number popup (1000ms)
 * 6. Return all to idle
 * 
 * Total sequence: ~1200ms
 */

import { useState, useCallback, useRef } from 'react';

export interface CombatAnimationState {
  attackingUnitId: string | null;
  targetedUnitId: string | null;
  showDamage: boolean;
  damageValue: number | null;
  damagePosition: { x: number; y: number } | null;
}

export function useCombatAnimation() {
  const [state, setState] = useState<CombatAnimationState>({
    attackingUnitId: null,
    targetedUnitId: null,
    showDamage: false,
    damageValue: null,
    damagePosition: null,
  });

  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimeouts();
    setState({
      attackingUnitId: null,
      targetedUnitId: null,
      showDamage: false,
      damageValue: null,
      damagePosition: null,
    });
  }, [clearTimeouts]);

  /**
   * Play full attack sequence
   */
  const playAttackSequence = useCallback((
    attackerId: string,
    targetId: string,
    damage: number,
    targetPosition: { x: number; y: number },
    onComplete: () => void
  ) => {
    clearTimeouts();

    // Phase 1: Start attack animation
    setState(prev => ({ ...prev, attackingUnitId: attackerId }));

    // Phase 2: Target hit + damage number (simplified - no psynergy)
    timeoutRefs.current.push(setTimeout(() => {
      setState(prev => ({
        ...prev,
        targetedUnitId: targetId,
        showDamage: true,
        damageValue: damage,
        damagePosition: targetPosition,
      }));
    }, 400)); // Hit reaction

    // Phase 3: Clear attack animation
    timeoutRefs.current.push(setTimeout(() => {
      setState(prev => ({
        ...prev,
        attackingUnitId: null,
      }));
    }, 600)); // Attacker returns to idle

    // Phase 4: Clear hit animation
    timeoutRefs.current.push(setTimeout(() => {
      setState(prev => ({
        ...prev,
        targetedUnitId: null,
      }));
    }, 700)); // Target returns to idle

    // Phase 5: Complete (damage number fades on its own)
    timeoutRefs.current.push(setTimeout(() => {
      setState(prev => ({
        ...prev,
        showDamage: false,
        damageValue: null,
        damagePosition: null,
      }));
      onComplete();
    }, 1000)); // Total sequence time (faster without psynergy)

  }, [clearTimeouts]);

  return {
    state,
    playAttackSequence,
    reset,
  };
}

