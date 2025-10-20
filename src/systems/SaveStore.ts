/*
 * SaveStore: Storage adapters for save system.
 * Provides in-memory (tests) and localStorage (browser) implementations.
 */

import type { ISaveStore } from '../types/game.js';

/**
 * Cross-environment byte size helper.
 * Uses Buffer in Node, Blob in browser.
 */
const byteSize = (s: string): number => {
  if (typeof Buffer !== 'undefined' && typeof Buffer.byteLength === 'function') {
    return Buffer.byteLength(s, 'utf8');
  }
  return new Blob([s]).size; // Browser-safe
};

/**
 * In-memory store for tests and headless environments.
 */
export class InMemorySaveStore implements ISaveStore {
  private map = new Map<string, { payload: string; modified: string }>();

  async write(slot: string, payload: string): Promise<void> {
    this.map.set(slot, { payload, modified: new Date().toISOString() });
  }

  async read(slot: string): Promise<string> {
    const hit = this.map.get(slot);
    if (!hit) throw new Error('ENOENT: Slot not found');
    return hit.payload;
  }

  async delete(slot: string): Promise<void> {
    if (!this.map.has(slot)) throw new Error('ENOENT: Slot not found');
    this.map.delete(slot);
  }

  async list(): Promise<Array<{ slot: string; modified: string; size: number }>> {
    return Array.from(this.map.entries()).map(([slot, { payload, modified }]) => ({
      slot,
      modified,
      size: byteSize(payload),
    }));
  }

  /**
   * Sync count for debug stats (no async in getDebugStats).
   */
  count(): number {
    return this.map.size;
  }
}

/**
 * Browser localStorage adapter.
 */
export class LocalStorageSaveStore implements ISaveStore {
  private prefix = 'nextrealdeal:save:';
  private indexKey = this.prefix + 'index';

  private getIndex(): string[] {
    try {
      const item = typeof localStorage !== 'undefined' ? localStorage.getItem(this.indexKey) : null;
      return JSON.parse(item || '[]') as string[];
    } catch {
      return [];
    }
  }

  private setIndex(slots: string[]): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.indexKey, JSON.stringify(slots));
      } catch (error) {
        // Log but don't throw - this is a best-effort operation
        console.error('Failed to update save index:', error);
      }
    }
  }

  async write(slot: string, payload: string): Promise<void> {
    const key = this.prefix + slot;
    const entry = { payload, modified: new Date().toISOString() };
    
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(entry));

        const idx = new Set(this.getIndex());
        idx.add(slot);
        this.setIndex([...idx]);
      } catch (error) {
        console.error('Failed to write save to localStorage:', error);
        throw new Error('Failed to save: Storage quota may be exceeded');
      }
    }
  }

  async read(slot: string): Promise<string> {
    const key = this.prefix + slot;
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    if (!raw) throw new Error('ENOENT: Slot not found');

    try {
      const entry = JSON.parse(raw) as { payload: string; modified: string };
      return entry.payload;
    } catch (error) {
      console.error('Failed to parse save data:', error);
      throw new Error('Corrupted save data');
    }
  }

  async delete(slot: string): Promise<void> {
    const key = this.prefix + slot;
    
    if (typeof localStorage === 'undefined') {
      throw new Error('ENOENT: Slot not found');
    }
    
    if (!localStorage.getItem(key)) throw new Error('ENOENT: Slot not found');

    try {
      localStorage.removeItem(key);

      const idx = new Set(this.getIndex());
      idx.delete(slot);
      this.setIndex([...idx]);
    } catch (error) {
      console.error('Failed to delete save from localStorage:', error);
      throw new Error('Failed to delete save');
    }
  }

  async list(): Promise<Array<{ slot: string; modified: string; size: number }>> {
    return this.getIndex().map(slot => {
      const key = this.prefix + slot;
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      if (!raw) return { slot, modified: new Date(0).toISOString(), size: 0 };

      try {
        const entry = JSON.parse(raw) as { payload: string; modified: string };
        const size =
          typeof entry.payload === 'string'
            ? byteSize(entry.payload)
            : byteSize(JSON.stringify(entry.payload));

        return { slot, modified: entry.modified, size };
      } catch (error) {
        console.error(`Failed to parse save data for slot ${slot}:`, error);
        // Return placeholder for corrupted entry
        return { slot, modified: new Date(0).toISOString(), size: 0 };
      }
    });
  }
}

