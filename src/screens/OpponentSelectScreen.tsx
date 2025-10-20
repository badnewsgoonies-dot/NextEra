/*
 * OpponentSelectScreen: Main opponent selection interface
 * 
 * Features:
 * - Displays 3 opponent preview cards from ChoiceSystem
 * - Roving tabindex navigation (arrow keys move between cards)
 * - Keyboard selection (Enter/Space to confirm)
 * - Live region for screen reader announcements
 * - Expandable cards (Up/Down arrows)
 * - Performance target: <4ms initial render
 * 
 * Keyboard Controls:
 * - Arrow Left/Right: Navigate between cards
 * - Arrow Up/Down: Expand/collapse focused card
 * - Enter/Space: Select opponent and confirm
 * - Escape: Cancel/back
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { OpponentPreview } from '../types/game.js';
import { OpponentCard } from '../components/OpponentCard.js';
import { useKeyboard } from '../hooks/useKeyboard.js';

export interface OpponentSelectScreenProps {
  previews: readonly OpponentPreview[];
  battleIndex: number;
  onSelect: (opponentId: string) => void;
  onCancel: () => void;
}

export function OpponentSelectScreen({
  previews,
  battleIndex,
  onSelect,
  onCancel,
}: OpponentSelectScreenProps): React.ReactElement {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // Refs for managing focus
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Update announcement for screen readers
  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    // Clear after 1 second to allow re-announcement
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);

  // Navigate left (previous card)
  const navigateLeft = useCallback(() => {
    if (previews.length === 0) return;
    const newIndex = focusedIndex > 0 ? focusedIndex - 1 : previews.length - 1;
    setFocusedIndex(newIndex);
    setExpandedIndex(null); // Collapse when navigating
    
    const preview = previews[newIndex];
    if (preview) {
      announce(`${preview.spec.name}, ${preview.spec.difficulty} difficulty`);
    }
  }, [focusedIndex, previews, announce]);

  // Navigate right (next card)
  const navigateRight = useCallback(() => {
    if (previews.length === 0) return;
    const newIndex = focusedIndex < previews.length - 1 ? focusedIndex + 1 : 0;
    setFocusedIndex(newIndex);
    setExpandedIndex(null); // Collapse when navigating
    
    const preview = previews[newIndex];
    if (preview) {
      announce(`${preview.spec.name}, ${preview.spec.difficulty} difficulty`);
    }
  }, [focusedIndex, previews, announce]);

  // Toggle expand focused card
  const toggleExpand = useCallback(() => {
    setExpandedIndex(current => current === focusedIndex ? null : focusedIndex);
    announce(expandedIndex === focusedIndex ? 'Collapsed' : 'Expanded');
  }, [focusedIndex, expandedIndex, announce]);

  // Select focused card
  const selectFocused = useCallback(() => {
    if (focusedIndex < 0 || focusedIndex >= previews.length) return;
    const preview = previews[focusedIndex];
    if (!preview) return;
    
    setSelectedIndex(focusedIndex);
    announce(`${preview.spec.name} selected. Press Enter again to confirm.`);
  }, [focusedIndex, previews, announce]);

  // Confirm selection
  const confirmSelection = useCallback(() => {
    if (selectedIndex !== null) {
      if (selectedIndex < 0 || selectedIndex >= previews.length) return;
      const preview = previews[selectedIndex];
      if (!preview) return;
      
      const selectedId = preview.spec.id;
      announce(`Confirmed ${preview.spec.name}`);
      onSelect(selectedId);
    } else {
      // First press selects, need second press to confirm
      selectFocused();
    }
  }, [selectedIndex, previews, onSelect, selectFocused, announce]);

  // Keyboard navigation
  useKeyboard({
    enabled: true,
    onLeft: navigateLeft,
    onRight: navigateRight,
    onUp: toggleExpand,
    onDown: toggleExpand,
    onEnter: confirmSelection,
    onSpace: confirmSelection,
    onEscape: onCancel,
  });

  // Move DOM focus when keyboard navigation changes (for screen readers)
  useEffect(() => {
    const cardElement = cardRefs.current[focusedIndex];
    if (cardElement) {
      cardElement.focus();
    }
  }, [focusedIndex]);

  // Announce on mount
  useEffect(() => {
    announce(`3 opponents available for battle ${battleIndex + 1}. Use arrow keys to navigate.`);
  }, [battleIndex, announce]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
          Select Your Opponent
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Battle #{battleIndex + 1}
        </p>
      </div>

      {/* Card Grid */}
      <div 
        role="radiogroup"
        aria-label="Opponent selection"
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {previews.map((preview, index) => (
          <div 
            key={preview.spec.id} 
            ref={(el) => { cardRefs.current[index] = el; }}
          >
            <OpponentCard
              preview={preview}
              selected={selectedIndex === index}
              focused={focusedIndex === index}
              expanded={expandedIndex === index}
              onSelect={() => {
                setSelectedIndex(index);
                announce(`${preview.spec.name} selected`);
              }}
              onFocus={() => {
                setFocusedIndex(index);
              }}
              onToggleExpand={() => {
                setExpandedIndex(current => current === index ? null : index);
              }}
              tabIndex={focusedIndex === index ? 0 : -1}
            />
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="max-w-7xl mx-auto mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Use <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">←</kbd>
          {' '}and{' '}
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">→</kbd>
          {' '}to navigate
        </p>
        <p className="mt-1">
          Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd>
          {' '}to select, <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd>
          {' '}to cancel
        </p>
      </div>

      {/* Live Region for Screen Readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </div>
  );
}

