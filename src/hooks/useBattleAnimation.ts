/*
 * useBattleAnimation: Manage battle action animation sequence
 * 
 * Features:
 * - Sequential action playback
 * - Play/pause control
 * - Speed control (1x, 2x, 4x)
 * - Current action tracking
 * - Completion callback
 */

import { useState, useEffect, useCallback } from 'react';
import type { BattleResult, CombatAction } from '../types/game.js';

export type BattleSpeed = 1 | 2 | 4;

export interface UseBattleAnimationReturn {
  currentAction: CombatAction | null;
  currentIndex: number;
  isPlaying: boolean;
  speed: BattleSpeed;
  isComplete: boolean;
  play: () => void;
  pause: () => void;
  setSpeed: (speed: BattleSpeed) => void;
  skipToEnd: () => void;
}

export function useBattleAnimation(
  result: BattleResult,
  onComplete: () => void
): UseBattleAnimationReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<BattleSpeed>(1);
  const [isComplete, setIsComplete] = useState(false);

  const actions = result.actions;
  const currentAction = currentIndex < actions.length ? actions[currentIndex] : null;

  // Advance to next action
  const advanceAction = useCallback(() => {
    setCurrentIndex(prev => {
      const next = prev + 1;
      if (next >= actions.length) {
        setIsComplete(true);
        setIsPlaying(false);
        setTimeout(onComplete, 500); // Small delay before completion
        return prev;
      }
      return next;
    });
  }, [actions.length, onComplete]);

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying || isComplete) return;

    const baseDelay = 1000; // 1 second per action at 1x
    const delay = baseDelay / speed;

    const timer = setTimeout(advanceAction, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying, speed, isComplete, advanceAction]);

  const play = useCallback(() => {
    if (!isComplete) {
      setIsPlaying(true);
    }
  }, [isComplete]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const skipToEnd = useCallback(() => {
    setCurrentIndex(actions.length - 1);
    setIsComplete(true);
    setIsPlaying(false);
    setTimeout(onComplete, 500); // Consistent 500ms delay like natural completion
  }, [actions.length, onComplete]);

  return {
    currentAction,
    currentIndex,
    isPlaying,
    speed,
    isComplete,
    play,
    pause,
    setSpeed,
    skipToEnd,
  };
}
