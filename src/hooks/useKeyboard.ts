/*
 * useKeyboard: Keyboard navigation hook
 * 
 * Handles keyboard events for game navigation:
 * - Arrow keys (up, down, left, right)
 * - Action keys (enter, space, escape)
 * - Dev keys (F1 for debug overlay)
 * 
 * Adapted from legacy useMenuInput.ts with full keyboard support
 */

import { useEffect } from 'react';

export interface KeyboardHandlers {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
  onF1?: () => void;
}

export interface UseKeyboardOptions extends KeyboardHandlers {
  enabled?: boolean;
}

export function useKeyboard({
  enabled = true,
  onUp,
  onDown,
  onLeft,
  onRight,
  onEnter,
  onSpace,
  onEscape,
  onF1,
}: UseKeyboardOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for arrow keys to avoid page scroll
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
          onUp?.();
          break;
        case 'ArrowDown':
          onDown?.();
          break;
        case 'ArrowLeft':
          onLeft?.();
          break;
        case 'ArrowRight':
          onRight?.();
          break;
        case 'Enter':
          onEnter?.();
          break;
        case ' ': // Space
          e.preventDefault(); // Prevent page scroll
          onSpace?.();
          break;
        case 'Escape':
          onEscape?.();
          break;
        case 'F1':
          e.preventDefault(); // Prevent browser help
          onF1?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onUp, onDown, onLeft, onRight, onEnter, onSpace, onEscape, onF1]);
}

