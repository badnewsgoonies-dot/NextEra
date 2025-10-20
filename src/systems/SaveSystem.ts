/*
 * SaveSystem: Persistence layer for NextEra MVP
 * 
 * Simplified from legacy SaveManager:
 * - No registry pattern (single save state)
 * - Serializes complete game state including SaveSliceChoice
 * - Supports InMemory (tests) and LocalStorage (browser) stores
 * - Deterministic save/load (same seed → same opponent previews)
 * 
 * Usage:
 *   const saveSystem = new SaveSystem(logger);
 *   await saveSystem.save('slot1', gameState);
 *   const loaded = await saveSystem.load('slot1');
 */

import type { ILogger } from './Logger.js';
import type { ISaveStore, SaveEnvelope, PlayerUnit, Item, ProgressionCounters, SaveSliceChoice } from '../types/game.js';
import { ok, err, type Result } from '../utils/Result.js';
import { InMemorySaveStore } from './SaveStore.js';

export interface GameStateSnapshot {
  readonly playerTeam: readonly PlayerUnit[];
  readonly inventory: readonly Item[];
  readonly progression: ProgressionCounters;
  readonly choice: SaveSliceChoice;
  readonly runSeed: number;
}

export class SaveSystem {
  private store: ISaveStore;

  constructor(
    private readonly logger: ILogger,
    store?: ISaveStore
  ) {
    this.store = store || new InMemorySaveStore();
  }

  /**
   * Set the storage adapter (for switching between InMemory and LocalStorage)
   */
  setStore(store: ISaveStore): void {
    this.store = store;
  }

  /**
   * Save complete game state to a slot
   */
  async save(slot: string, state: GameStateSnapshot): Promise<Result<void, string>> {
    try {
      const envelope: SaveEnvelope = {
        version: 'v1',
        timestamp: new Date().toISOString(),
        playerTeam: state.playerTeam,
        inventory: state.inventory,
        progression: state.progression,
        choice: state.choice,
        runSeed: state.runSeed,
      };

      const serialized = JSON.stringify(envelope);
      await this.store.write(slot, serialized);

      this.logger.info('save:success', { slot, size: serialized.length });
      return ok(undefined);
    } catch (e) {
      const error = e as Error;
      this.logger.error('save:failed', { slot, error: error.message });
      return err(`Failed to save: ${error.message}`);
    }
  }

  /**
   * Load game state from a slot
   */
  async load(slot: string): Promise<Result<SaveEnvelope, string>> {
    try {
      const serialized = await this.store.read(slot);
      const envelope = JSON.parse(serialized) as SaveEnvelope;

      // Validate version
      if (envelope.version !== 'v1') {
        this.logger.warn('save:unsupported_version', { slot, version: envelope.version });
        return err(`Unsupported save version: ${envelope.version}`);
      }

      this.logger.info('save:loaded', { slot, timestamp: envelope.timestamp });
      return ok(envelope);
    } catch (e) {
      const error = e as Error;
      
      if (error.message.includes('ENOENT') || error.message.includes('not found')) {
        this.logger.warn('save:not_found', { slot });
        return err('Save slot not found');
      }

      this.logger.error('save:load_failed', { slot, error: error.message });
      return err(`Failed to load: ${error.message}`);
    }
  }

  /**
   * Delete a save slot
   */
  async deleteSave(slot: string): Promise<Result<void, string>> {
    try {
      await this.store.delete(slot);
      this.logger.info('save:deleted', { slot });
      return ok(undefined);
    } catch (e) {
      const error = e as Error;
      this.logger.error('save:delete_failed', { slot, error: error.message });
      return err(`Failed to delete: ${error.message}`);
    }
  }

  /**
   * List all save slots
   */
  async listSlots(): Promise<Result<readonly { slot: string; modified: string; size: number }[], string>> {
    try {
      const slots = await this.store.list();
      return ok(slots);
    } catch (e) {
      const error = e as Error;
      this.logger.error('save:list_failed', { error: error.message });
      return err(`Failed to list slots: ${error.message}`);
    }
  }

  /**
   * Check if a slot exists
   */
  async hasSlot(slot: string): Promise<boolean> {
    try {
      await this.store.read(slot);
      return true;
    } catch {
      return false;
    }
  }
}

