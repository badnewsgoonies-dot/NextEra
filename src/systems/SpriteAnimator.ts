/*
 * SpriteAnimator: Animation state machine for battle sprites
 * 
 * Manages sprite transitions:
 * - idle → attack1 → attack2 → idle (400ms total)
 * - idle → hit → idle (300ms total)
 * - idle → downed (permanent)
 * - idle → cast1 → cast2 → idle (800ms for spells)
 * 
 * Thread-safe with proper cleanup
 */

import type { SpriteAnimState, SpriteSet } from '../data/spriteRegistry.js';

export type AnimationEvent = 
  | { type: 'playAttack'; onComplete?: () => void }
  | { type: 'playHit'; onComplete?: () => void }
  | { type: 'playDowned' }
  | { type: 'playCast'; onComplete?: () => void }
  | { type: 'reset' };

export class SpriteAnimator {
  private currentState: SpriteAnimState = 'idle';
  private timers: NodeJS.Timeout[] = [];
  private listeners: Set<() => void> = new Set();

  /**
   * Get current animation state
   */
  getState(): SpriteAnimState {
    return this.currentState;
  }

  /**
   * Subscribe to state changes
   */
  onChange(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyChange(): void {
    this.listeners.forEach(cb => cb());
  }

  /**
   * Set state and notify
   */
  private setState(newState: SpriteAnimState): void {
    this.currentState = newState;
    this.notifyChange();
  }

  /**
   * Play attack animation sequence
   * Total duration: 400ms (200ms per frame)
   */
  playAttack(onComplete?: () => void): void {
    this.cleanup(); // Cancel any ongoing animations

    // Attack1 frame
    this.setState('attack1');

    this.timers.push(setTimeout(() => {
      // Attack2 frame
      this.setState('attack2');
    }, 200));

    this.timers.push(setTimeout(() => {
      // Return to idle
      this.setState('idle');
      onComplete?.();
    }, 400));
  }

  /**
   * Play hit animation
   * Duration: 300ms
   */
  playHit(onComplete?: () => void): void {
    const wasIdle = this.currentState === 'idle';
    
    this.setState('hit');

    this.timers.push(setTimeout(() => {
      // Only return to idle if we were idle before
      if (wasIdle) {
        this.setState('idle');
      }
      onComplete?.();
    }, 300));
  }

  /**
   * Play downed animation (permanent)
   */
  playDowned(): void {
    this.cleanup();
    this.setState('downed');
  }

  /**
   * Play casting animation
   * Duration: 800ms (400ms per frame)
   */
  playCast(onComplete?: () => void): void {
    this.cleanup();

    this.setState('cast1');

    this.timers.push(setTimeout(() => {
      this.setState('cast2');
    }, 400));

    this.timers.push(setTimeout(() => {
      this.setState('idle');
      onComplete?.();
    }, 800));
  }

  /**
   * Reset to idle state
   */
  reset(): void {
    this.cleanup();
    this.setState('idle');
  }

  /**
   * Get sprite path for current state
   */
  getCurrentSprite(spriteSet: SpriteSet): string {
    switch (this.currentState) {
      case 'idle': return spriteSet.idle;
      case 'attack1': return spriteSet.attack1;
      case 'attack2': return spriteSet.attack2;
      case 'hit': return spriteSet.hit;
      case 'downed': return spriteSet.downed;
      case 'cast1': return spriteSet.cast1 || spriteSet.idle;
      case 'cast2': return spriteSet.cast2 || spriteSet.idle;
    }
  }

  /**
   * Clean up all timers
   */
  cleanup(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
  }

  /**
   * Destroy animator (cleanup all resources)
   */
  destroy(): void {
    this.cleanup();
    this.listeners.clear();
  }
}

