/*
 * GameController: Main game orchestrator
 * 
 * Coordinates all systems and manages the core game loop:
 * 1. Start run with starter team
 * 2. Generate opponent choices (ChoiceSystem)
 * 3. Select opponent
 * 4. Execute battle (BattleSystem)
 * 5. Award rewards (future)
 * 6. Recruit defeated enemy (future)
 * 7. Loop back to step 2
 * 
 * Also handles:
 * - State machine transitions
 * - Save/load orchestration
 * - Progression tracking
 * - Event logging
 */

import type { ILogger } from '../systems/Logger.js';
import type { IRng } from '../utils/rng.js';
import type {
  PlayerUnit,
  OpponentPreview,
  BattleResult,
  ProgressionCounters,
  GameState,
} from '../types/game.js';
import { ok, err, type Result } from '../utils/Result.js';
import { GameStateMachine } from './GameStateMachine.js';
import { ChoiceSystem } from '../systems/ChoiceSystem.js';
// BattleSystem removed - battles now handled by manual BattleScreen.tsx
import { SaveSystem, type GameStateSnapshot } from '../systems/SaveSystem.js';
import { EventLogger } from '../systems/EventLogger.js';
import { makeRng } from '../utils/rng.js';

export interface GameControllerState {
  runSeed: number;
  battleIndex: number;
  playerTeam: PlayerUnit[];
  progression: ProgressionCounters;
  currentChoices: OpponentPreview[] | null;
  selectedOpponentId: string | null;
  lastBattleResult: BattleResult | null;
}

export class GameController {
  private readonly stateMachine: GameStateMachine;
  private readonly choiceSystem: ChoiceSystem;
  // battleSystem removed - manual combat in BattleScreen.tsx
  private readonly saveSystem: SaveSystem;
  private readonly eventLogger: EventLogger;
  
  private state: GameControllerState;
  private rootRng: IRng;

  constructor(logger: ILogger, saveSystem?: SaveSystem) {
    this.stateMachine = new GameStateMachine();
    this.choiceSystem = new ChoiceSystem(logger, { enableLogging: true });
    this.eventLogger = new EventLogger(logger);
    // battleSystem removed - manual combat in BattleScreen.tsx
    this.saveSystem = saveSystem || new SaveSystem(logger);

    // Initialize with empty state
    this.state = {
      runSeed: 0,
      battleIndex: 0,
      playerTeam: [],
      progression: {
        runsAttempted: 0,
        runsCompleted: 0,
        battlesWon: 0,
        battlesLost: 0,
        unitsRecruited: 0,
      },
      currentChoices: null,
      selectedOpponentId: null,
      lastBattleResult: null,
    };

    this.rootRng = makeRng(0);
  }

  /**
   * Start a new run with starter team
   */
  startRun(starterTeam: PlayerUnit[], seed?: number): Result<void, string> {
    // Reset state machine
    this.stateMachine.reset();

    // Generate or use provided seed
    const runSeed = seed ?? Date.now();
    this.rootRng = makeRng(runSeed);

    // Initialize state
    this.state = {
      runSeed,
      battleIndex: 0,
      playerTeam: [...starterTeam],
      progression: {
        ...this.state.progression,
        runsAttempted: this.state.progression.runsAttempted + 1,
      },
      currentChoices: null,
      selectedOpponentId: null,
      lastBattleResult: null,
    };

    // Log run start
    this.eventLogger.logRunStarted({
      runSeed,
      starterTeamSize: starterTeam.length,
    });

    // Transition through starter_select (team already provided) then to opponent_select
    let transition = this.stateMachine.transitionTo('starter_select');
    if (!transition.ok) {
      return err(`Failed to transition to starter_select: ${transition.error}`);
    }

    transition = this.stateMachine.transitionTo('opponent_select');
    if (!transition.ok) {
      return err(`Failed to transition to opponent_select: ${transition.error}`);
    }

    return ok(undefined);
  }

  /**
   * Generate three opponent choices for current battle
   */
  generateOpponentChoices(): Result<readonly OpponentPreview[], string> {
    if (this.stateMachine.getState() !== 'opponent_select') {
      return err('Cannot generate choices - not in opponent_select state');
    }

    // Fork RNG for this choice generation
    const choiceRng = this.rootRng.fork('choice');
    const result = this.choiceSystem.generateChoices(
      choiceRng,
      this.state.battleIndex,
      this.state.playerTeam
    );

    if (!result.ok) {
      return err(`Failed to generate choices: ${result.error}`);
    }

    this.state.currentChoices = [...result.value];
    return ok(result.value);
  }

  /**
   * Select an opponent and transition to team prep
   */
  selectOpponent(opponentId: string): Result<OpponentPreview, string> {
    if (!this.state.currentChoices) {
      return err('No choices available - call generateOpponentChoices first');
    }

    const selected = this.state.currentChoices.find(c => c.spec.id === opponentId);
    if (!selected) {
      return err(`Opponent ${opponentId} not found in current choices`);
    }

    this.state.selectedOpponentId = opponentId;

    // Log selection
    this.eventLogger.logChoiceSelected({
      battleIndex: this.state.battleIndex,
      selectedId: opponentId,
      difficulty: selected.spec.difficulty,
      primaryTag: selected.spec.primaryTag,
    });

    // Transition to team prep
    const transition = this.stateMachine.transitionTo('team_prep');
    if (!transition.ok) {
      return err(`State transition failed: ${transition.error}`);
    }

    return ok(selected);
  }

  /**
   * Proceed from team prep to battle
   */
  startBattle(): Result<void, string> {
    if (this.stateMachine.getState() !== 'team_prep') {
      return err('Cannot start battle - not in team_prep state');
    }

    const transition = this.stateMachine.transitionTo('battle');
    if (!transition.ok) {
      return err(`State transition failed: ${transition.error}`);
    }

    return ok(undefined);
  }

  /**
   * @deprecated
   * executeBattle() is deprecated - battles are now manual (BattleScreen.tsx)
   * 
   * The battle result and progression updates are now handled by:
   * - BattleScreen.tsx: Runs manual combat, returns BattleResult via onComplete
   * - App.tsx: Receives result, updates progression, transitions states
   * 
   * This method is preserved for backward compatibility with tests.
   * Remove once all tests are updated to use manual battle flow.
   */
  executeBattle(): Result<BattleResult, string> {
    return err('executeBattle is deprecated - use manual BattleScreen.tsx instead');
  }

  /**
   * Advance to next battle (from recruit screen)
   */
  advanceToNextBattle(): Result<void, string> {
    if (this.stateMachine.getState() !== 'recruit') {
      return err('Cannot advance - not in recruit state');
    }

    // Increment battle index
    this.state.battleIndex++;

    // Reset battle-specific state
    this.state.currentChoices = null;
    this.state.selectedOpponentId = null;
    this.state.lastBattleResult = null;

    // Transition back to opponent select
    const transition = this.stateMachine.transitionTo('opponent_select');
    if (!transition.ok) {
      return err(`State transition failed: ${transition.error}`);
    }

    return ok(undefined);
  }

  /**
   * Save current game state
   */
  async saveGame(slot: string): Promise<Result<void, string>> {
    const snapshot: GameStateSnapshot = {
      playerTeam: this.state.playerTeam,
      inventory: [], // TODO: Implement inventory system
      progression: this.state.progression,
      choice: {
        nextChoiceSeed: String(this.state.runSeed),
        battleIndex: this.state.battleIndex,
        lastChoices: this.state.currentChoices ?? undefined,
      },
      runSeed: this.state.runSeed,
    };

    return await this.saveSystem.save(slot, snapshot);
  }

  /**
   * Load game state from save
   */
  async loadGame(slot: string): Promise<Result<void, string>> {
    const loadResult = await this.saveSystem.load(slot);
    
    if (!loadResult.ok) {
      return err(loadResult.error);
    }

    const saveData = loadResult.value;

    // Restore state
    this.state = {
      runSeed: saveData.runSeed,
      battleIndex: saveData.choice.battleIndex,
      playerTeam: [...saveData.playerTeam],
      progression: saveData.progression,
      currentChoices: saveData.choice.lastChoices ? [...saveData.choice.lastChoices] : null,
      selectedOpponentId: null,
      lastBattleResult: null,
    };

    // Restore RNG
    this.rootRng = makeRng(saveData.runSeed);

    // Reset state machine and transition to opponent_select
    this.stateMachine.reset();
    let transition = this.stateMachine.transitionTo('starter_select');
    if (!transition.ok) {
      return err(`Failed to restore state: ${transition.error}`);
    }
    
    transition = this.stateMachine.transitionTo('opponent_select');
    if (!transition.ok) {
      return err(`Failed to restore state: ${transition.error}`);
    }

    return ok(undefined);
  }

  /**
   * Get current game state (read-only)
   */
  getState(): Readonly<GameControllerState> {
    return { ...this.state };
  }

  /**
   * Get current state machine state
   */
  getCurrentState(): GameState {
    return this.stateMachine.getState();
  }

  /**
   * Get state machine (for debugging/testing)
   */
  getStateMachine(): GameStateMachine {
    return this.stateMachine;
  }
}

