/*
 * GameStateMachine: Enforces valid state transitions for NextEra MVP.
 * 
 * MVP Flow:
 *   menu → starter_select → opponent_select → team_prep → battle → rewards → recruit → opponent_select (loop)
 * 
 * Defeat Flow (Decision #5):
 *   battle → defeat → menu (permadeath/instant restart)
 * 
 * Usage:
 *   const fsm = new GameStateMachine();
 *   const result = fsm.transitionTo('opponent_select');
 *   if (!result.ok) {
 *     // Handle invalid transition
 *   }
 */

import type { GameState } from '../types/game.js';
import { STATE_TRANSITIONS } from '../types/game.js';
import { ok, err, type Result } from '../utils/Result.js';

export class GameStateMachine {
  private current: GameState = 'menu';
  private readonly history: GameState[] = [];

  /**
   * Get the current game state
   */
  getState(): GameState {
    return this.current;
  }

  /**
   * Get state transition history (for debugging/replay)
   */
  getHistory(): readonly GameState[] {
    return [...this.history];
  }

  /**
   * Check if a transition is valid from current state
   */
  canTransitionTo(next: GameState): boolean {
    return STATE_TRANSITIONS[this.current].includes(next);
  }

  /**
   * Attempt to transition to a new state
   * Returns Result - Ok if valid transition, Err if invalid
   */
  transitionTo(next: GameState): Result<void, string> {
    if (!this.canTransitionTo(next)) {
      return err(`Invalid transition: ${this.current} -> ${next}`);
    }
    this.history.push(this.current);
    this.current = next;
    return ok(undefined);
  }

  /**
   * Reset to initial state (for new run or after defeat)
   */
  reset(): void {
    this.current = 'menu';
    this.history.length = 0;
  }

  /**
   * Get the previous state (for back navigation)
   */
  getPreviousState(): GameState | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  /**
   * Serialize state machine for save/load
   */
  serialize(): string {
    return JSON.stringify({
      current: this.current,
      history: this.history,
    });
  }

  /**
   * Deserialize state machine from save data
   */
  deserialize(json: string): Result<void, string> {
    try {
      const data = JSON.parse(json) as { current: GameState; history: GameState[] };
      
      // Validate state is valid
      if (!STATE_TRANSITIONS[data.current as keyof typeof STATE_TRANSITIONS]) {
        return err(`Invalid state in save data: ${data.current}`);
      }

      this.current = data.current;
      this.history.length = 0;
      this.history.push(...data.history);
      
      return ok(undefined);
    } catch (e) {
      return err(`Failed to deserialize state machine: ${(e as Error).message}`);
    }
  }
}

