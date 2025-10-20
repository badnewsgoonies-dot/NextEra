/*
 * SettingsManager: Manage game settings with localStorage persistence
 * 
 * Features:
 * - Audio settings (volume, mute)
 * - Accessibility settings (high contrast, reduce motion, text size)
 * - Gameplay settings (battle speed, auto-save, UI options)
 * - Persists to localStorage
 */

import { ok, err, type Result } from '../utils/Result.js';

export interface Settings {
  audio: {
    masterVolume: number; // 0-100
    musicVolume: number; // 0-100
    sfxVolume: number; // 0-100
    muted: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reduceMotion: boolean;
    textSize: 'small' | 'medium' | 'large';
  };
  gameplay: {
    battleSpeed: 1 | 2 | 4;
    autoSave: boolean;
    showDamageNumbers: boolean;
    showCounterTags: boolean;
  };
}

export const DEFAULT_SETTINGS: Settings = {
  audio: {
    masterVolume: 80,
    musicVolume: 70,
    sfxVolume: 100,
    muted: false,
  },
  accessibility: {
    highContrast: false,
    reduceMotion: false,
    textSize: 'medium',
  },
  gameplay: {
    battleSpeed: 1,
    autoSave: true,
    showDamageNumbers: true,
    showCounterTags: false,
  },
};

const SETTINGS_KEY = 'nextera_settings';

export class SettingsManager {
  private settings: Settings;

  constructor() {
    this.settings = this.loadSettings();
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): Settings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new settings
        return {
          audio: { ...DEFAULT_SETTINGS.audio, ...parsed.audio },
          accessibility: { ...DEFAULT_SETTINGS.accessibility, ...parsed.accessibility },
          gameplay: { ...DEFAULT_SETTINGS.gameplay, ...parsed.gameplay },
        };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * Get current settings
   */
  getSettings(): Settings {
    return { ...this.settings };
  }

  /**
   * Update settings
   */
  updateSettings(partial: Partial<Settings>): Result<void, string> {
    try {
      this.settings = {
        audio: { ...this.settings.audio, ...partial.audio },
        accessibility: { ...this.settings.accessibility, ...partial.accessibility },
        gameplay: { ...this.settings.gameplay, ...partial.gameplay },
      };
      this.saveSettings();
      return ok(undefined);
    } catch (error) {
      return err(`Failed to update settings: ${error}`);
    }
  }

  /**
   * Reset settings to defaults
   */
  resetToDefaults(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
  }

  /**
   * Get effective volume (considering mute and master volume)
   */
  getEffectiveMusicVolume(): number {
    if (this.settings.audio.muted) return 0;
    return (this.settings.audio.musicVolume / 100) * (this.settings.audio.masterVolume / 100);
  }

  /**
   * Get effective SFX volume (considering mute and master volume)
   */
  getEffectiveSFXVolume(): number {
    if (this.settings.audio.muted) return 0;
    return (this.settings.audio.sfxVolume / 100) * (this.settings.audio.masterVolume / 100);
  }
}
