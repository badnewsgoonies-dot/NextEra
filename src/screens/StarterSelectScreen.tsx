/*
 * StarterSelectScreen: Choose 4 starter units
 * 
 * Features:
 * - Display 12 starter units in grid
 * - Select exactly 4 units
 * - Clear visual feedback for selection
 * - Start button enabled when 4 selected
 * - Cancel button returns to menu
 * - Full keyboard navigation
 * - Accessibility (ARIA, screen reader)
 */

import React, { useState, useEffect, useRef } from 'react';
import { UnitCard } from '../components/UnitCard.js';
import type { PlayerUnit } from '../types/game.js';
import { STARTER_CATALOG } from '../data/starterUnits.js';

export interface StarterSelectScreenProps {
  onSelect: (starters: PlayerUnit[]) => void;
  onCancel: () => void;
}

export function StarterSelectScreen({
  onSelect,
  onCancel,
}: StarterSelectScreenProps): React.ReactElement {
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridCols, setGridCols] = useState(3);

  const maxSelection = 4;
  const canStart = selectedUnits.size === maxSelection;

  // Toggle unit selection
  const toggleUnit = (unitId: string) => {
    setSelectedUnits(prev => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else if (next.size < maxSelection) {
        next.add(unitId);
      }
      return next;
    });
  };

  // Start game with selected units
  const handleStart = () => {
    if (canStart) {
      const selected = STARTER_CATALOG.filter(u => selectedUnits.has(u.id));
      onSelect(selected);
    }
  };

  // Compute grid columns for responsive keyboard navigation
  useEffect(() => {
    const computeCols = () => {
      const el = gridRef.current;
      if (!el) return;
      const cols = getComputedStyle(el).gridTemplateColumns.split(' ').length;
      setGridCols(cols || 1);
    };
    
    computeCols();
    window.addEventListener('resize', computeCols);
    return () => window.removeEventListener('resize', computeCols);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const totalUnits = STARTER_CATALOG.length;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - 1));
          break;

        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(totalUnits - 1, prev + 1));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - gridCols));
          break;

        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(totalUnits - 1, prev + gridCols));
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            // Ctrl+Enter = Start (if ready)
            if (canStart) {
              handleStart();
            }
          } else {
            // Select/deselect focused unit
            toggleUnit(STARTER_CATALOG[focusedIndex].id);
          }
          break;

        case 'Escape':
          e.preventDefault();
          onCancel();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, canStart, onCancel, gridCols]);

  // Move DOM focus when focusedIndex changes (for screen readers)
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const items = el.querySelectorAll('[role="checkbox"]');
    const target = items[focusedIndex] as HTMLElement | undefined;
    target?.focus();
  }, [focusedIndex]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Team
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Select exactly {maxSelection} units to begin your journey
        </p>
        
        {/* Selection counter */}
        <div className="mt-4 flex items-center gap-4">
          <div
            className={`text-2xl font-bold ${
              canStart
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
            role="status"
            aria-live="polite"
          >
            Selected: {selectedUnits.size}/{maxSelection}
          </div>
          {canStart && (
            <div className="text-green-600 dark:text-green-400 font-semibold">
              ✓ Ready to start!
            </div>
          )}
        </div>
      </div>

      {/* Unit grid */}
      <div className="max-w-6xl mx-auto">
        <div
          ref={gridRef}
          role="group"
          aria-label="Starter units selection"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          {STARTER_CATALOG.map((unit, index) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              selected={selectedUnits.has(unit.id)}
              focused={focusedIndex === index}
              disabled={!selectedUnits.has(unit.id) && selectedUnits.size >= maxSelection}
              onSelect={() => toggleUnit(unit.id)}
              onFocus={() => setFocusedIndex(index)}
              tabIndex={focusedIndex === index ? 0 : -1}
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
        >
          ← Back to Menu
        </button>

        <button
          type="button"
          onClick={handleStart}
          disabled={!canStart}
          className={`px-8 py-4 rounded-lg font-bold text-xl transition-all ${
            canStart
              ? 'bg-primary text-white shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          Start Journey →
        </button>
      </div>

      {/* Keyboard hints */}
      <div className="max-w-6xl mx-auto mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Arrow keys: Navigate • Space/Enter: Select • Ctrl+Enter: Start • Esc: Cancel</p>
      </div>
    </div>
  );
}
