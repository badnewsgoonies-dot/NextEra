/*
 * SettingsScreen: Configure game settings
 * 
 * Features:
 * - Audio settings (volumes, mute)
 * - Accessibility settings (contrast, motion, text size)
 * - Gameplay settings (speed, UI options)
 * - Settings persist to localStorage
 */

import React, { useState, useEffect } from 'react';
import { SettingsManager, type Settings } from '../systems/SettingsManager.js';

export interface SettingsScreenProps {
  onBack: () => void;
  settingsManager: SettingsManager;
}

export function SettingsScreen({
  onBack,
  settingsManager,
}: SettingsScreenProps): React.ReactElement {
  const [settings, setSettings] = useState<Settings>(settingsManager.getSettings());

  // Save settings with debounce (avoid excessive localStorage writes)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const res = settingsManager.updateSettings(settings);
      if (!res.ok) {
        console.error('Settings save failed:', res.error);
        // TODO: Show user-facing error toast/message
      }
    }, 300); // Wait 300ms after last change
    
    return () => clearTimeout(timeoutId);
  }, [settings, settingsManager]);

  const handleVolumeChange = (
    category: 'masterVolume' | 'musicVolume' | 'sfxVolume',
    value: number
  ) => {
    setSettings(prev => ({
      ...prev,
      audio: { ...prev.audio, [category]: value },
    }));
  };

  const handleToggle = (
    category: 'audio' | 'accessibility' | 'gameplay',
    key: string,
    value: boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: value },
    }));
  };

  const handleReset = () => {
    settingsManager.resetToDefaults();
    setSettings(settingsManager.getSettings());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Audio Settings */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🔊 Audio
          </h2>

          {/* Master Volume */}
          <div className="mb-4">
            <label htmlFor="masterVolume" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Master Volume: {settings.audio.masterVolume}%
            </label>
            <input
              id="masterVolume"
              type="range"
              min="0"
              max="100"
              value={settings.audio.masterVolume}
              onChange={(e) => handleVolumeChange('masterVolume', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          {/* Music Volume */}
          <div className="mb-4">
            <label htmlFor="musicVolume" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Music Volume: {settings.audio.musicVolume}%
            </label>
            <input
              id="musicVolume"
              type="range"
              min="0"
              max="100"
              value={settings.audio.musicVolume}
              onChange={(e) => handleVolumeChange('musicVolume', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          {/* SFX Volume */}
          <div className="mb-4">
            <label htmlFor="sfxVolume" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              SFX Volume: {settings.audio.sfxVolume}%
            </label>
            <input
              id="sfxVolume"
              type="range"
              min="0"
              max="100"
              value={settings.audio.sfxVolume}
              onChange={(e) => handleVolumeChange('sfxVolume', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          {/* Mute Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Mute All Audio
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.audio.muted}
              aria-label="Mute All Audio"
              onClick={() => handleToggle('audio', 'muted', !settings.audio.muted)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.audio.muted ? 'bg-red-600' : 'bg-green-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.audio.muted ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Accessibility Settings */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ♿ Accessibility
          </h2>

          {/* High Contrast */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              High Contrast Mode
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.accessibility.highContrast}
              aria-label="High Contrast Mode"
              onClick={() => handleToggle('accessibility', 'highContrast', !settings.accessibility.highContrast)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.accessibility.highContrast ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.accessibility.highContrast ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Reduce Motion
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.accessibility.reduceMotion}
              aria-label="Reduce Motion"
              onClick={() => handleToggle('accessibility', 'reduceMotion', !settings.accessibility.reduceMotion)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.accessibility.reduceMotion ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.accessibility.reduceMotion ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Text Size */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Text Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    accessibility: { ...prev.accessibility, textSize: size },
                  }))}
                  className={`py-2 px-4 rounded-lg font-semibold transition-colors ${
                    settings.accessibility.textSize === size
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Gameplay Settings */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🎮 Gameplay
          </h2>

          {/* Battle Speed */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Default Battle Speed
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 4] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    gameplay: { ...prev.gameplay, battleSpeed: speed },
                  }))}
                  className={`py-2 px-4 rounded-lg font-semibold transition-colors ${
                    settings.gameplay.battleSpeed === speed
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Save */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Auto-Save
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.gameplay.autoSave}
              aria-label="Auto-Save"
              onClick={() => handleToggle('gameplay', 'autoSave', !settings.gameplay.autoSave)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.gameplay.autoSave ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.gameplay.autoSave ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Show Damage Numbers */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Show Damage Numbers
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.gameplay.showDamageNumbers}
              aria-label="Show Damage Numbers"
              onClick={() => handleToggle('gameplay', 'showDamageNumbers', !settings.gameplay.showDamageNumbers)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.gameplay.showDamageNumbers ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.gameplay.showDamageNumbers ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Show Counter Tags */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Show Counter Tags
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.gameplay.showCounterTags}
              aria-label="Show Counter Tags"
              onClick={() => handleToggle('gameplay', 'showCounterTags', !settings.gameplay.showCounterTags)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.gameplay.showCounterTags ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.gameplay.showCounterTags ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Reset Button */}
        <div className="text-center">
          <button
            onClick={handleReset}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
