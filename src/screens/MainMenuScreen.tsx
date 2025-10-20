/*
 * MainMenuScreen: Main game menu
 * 
 * Features:
 * - New Game → StarterSelectScreen
 * - Continue → Load last save (if exists)
 * - Load Game → SaveSlotSelectScreen
 * - Settings → SettingsScreen
 * - Exit → Close app
 * - Full keyboard navigation (↑↓ + Enter)
 * - Accessibility (ARIA, screen reader)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MenuButton } from '../components/MenuButton.js';

export interface MainMenuScreenProps {
  onNewGame: () => void;
  onContinue: () => void;
  onLoadGame: () => void;
  onSettings: () => void;
  onExit: () => void;
  hasSaves: boolean;
}

export function MainMenuScreen({
  onNewGame,
  onContinue,
  onLoadGame,
  onSettings,
  onExit,
  hasSaves,
}: MainMenuScreenProps): React.ReactElement {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Menu items configuration (memoized to avoid recreation on every render)
  const menuItems = useMemo(() => [
    { label: 'New Game', action: onNewGame, disabled: false },
    { label: 'Continue', action: onContinue, disabled: !hasSaves },
    { label: 'Load Game', action: onLoadGame, disabled: false },
    { label: 'Settings', action: onSettings, disabled: false },
    { label: 'Exit', action: onExit, disabled: false },
  ], [onNewGame, onContinue, onLoadGame, onSettings, onExit, hasSaves]);

  // Find first enabled item
  const firstEnabledIndex = menuItems.findIndex(item => !item.disabled);

  // Initialize with first enabled item
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < menuItems.length && menuItems[selectedIndex].disabled) {
      setSelectedIndex(firstEnabledIndex);
    }
  }, [selectedIndex, firstEnabledIndex, menuItems.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => {
            // Find previous enabled item
            let newIndex = prev - 1;
            while (newIndex >= 0 && menuItems[newIndex].disabled) {
              newIndex--;
            }
            return newIndex >= 0 ? newIndex : prev;
          });
          break;

        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => {
            // Find next enabled item
            let newIndex = prev + 1;
            while (newIndex < menuItems.length && menuItems[newIndex].disabled) {
              newIndex++;
            }
            return newIndex < menuItems.length ? newIndex : prev;
          });
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < menuItems.length) {
            menuItems[selectedIndex].action();
          }
          break;

        case 'Escape':
          e.preventDefault();
          onExit();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, menuItems, onExit]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center p-8">
      {/* Title */}
      <div className="mb-16 text-center">
        <h1 className="text-7xl font-bold text-white mb-4 drop-shadow-2xl">
          NextEra
        </h1>
        <p className="text-2xl text-blue-200 font-medium">
          Battle-First Roguelike
        </p>
      </div>

      {/* Menu */}
      <nav
        role="menu"
        aria-label="Main menu"
        className="flex flex-col gap-4 w-full max-w-md"
      >
        {menuItems.map((item, idx) => (
          <MenuButton
            key={item.label}
            label={item.label}
            selected={selectedIndex === idx}
            disabled={item.disabled}
            onClick={item.action}
            onFocus={() => setSelectedIndex(idx)}
          />
        ))}
      </nav>

      {/* Keyboard hints */}
      <div className="mt-12 text-center text-blue-200 text-sm">
        <p>Use ↑↓ arrows to navigate, Enter to select</p>
        {!hasSaves && (
          <p className="mt-2 text-yellow-300 text-xs">
            (Continue disabled - no saved games found)
          </p>
        )}
      </div>

      {/* Version info */}
      <div className="absolute bottom-4 right-4 text-blue-300 text-xs">
        v0.7.0 - Phase 7
      </div>
    </div>
  );
}
