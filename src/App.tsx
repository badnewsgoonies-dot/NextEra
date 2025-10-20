/*
 * App: Main application component
 * 
 * Demo of OpponentSelectScreen with ChoiceSystem integration
 * This demonstrates Phase 1-4 working together:
 * - ChoiceSystem generates 3 deterministic opponent cards
 * - OpponentSelectScreen displays them with full keyboard navigation
 * - All architecture decisions implemented and working
 */

import React, { useState, useEffect } from 'react';
import { makeRng } from './utils/rng.js';
import { ConsoleLogger } from './systems/Logger.js';
import { ChoiceSystem } from './systems/ChoiceSystem.js';
import { OpponentSelectScreen } from './screens/OpponentSelectScreen.js';
import type { OpponentPreview } from './types/game.js';

export function App(): React.ReactElement {
  const [previews, setPreviews] = useState<readonly OpponentPreview[]>([]);
  const [battleIndex, setBattleIndex] = useState(0);
  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);

  // Initialize ChoiceSystem
  useEffect(() => {
    const logger = new ConsoleLogger('info');
    const choiceSystem = new ChoiceSystem(logger, { enableLogging: true });
    
    // Generate initial opponent choices
    const rootRng = makeRng(Date.now()); // Use timestamp as seed for demo
    const result = choiceSystem.generateChoices(rootRng, battleIndex);

    if (result.ok) {
      setPreviews(result.value);
      console.log('✅ Generated 3 opponent previews:', result.value.map(p => p.spec.name));
    } else {
      console.error('❌ Failed to generate choices:', result.error);
    }
  }, [battleIndex]);

  const handleSelect = (opponentId: string) => {
    setSelectedOpponent(opponentId);
    console.log('✅ Opponent selected:', opponentId);
    
    // In real app: transition to team_prep → battle
    // For demo: generate new choices
    setTimeout(() => {
      setBattleIndex(prev => prev + 1);
      setSelectedOpponent(null);
    }, 2000);
  };

  const handleCancel = () => {
    console.log('❌ Selection cancelled');
    // In real app: return to previous screen
  };

  if (previews.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            NextEra MVP
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generating opponents...
          </p>
        </div>
      </div>
    );
  }

  if (selectedOpponent) {
    const selected = previews.find(p => p.spec.id === selectedOpponent);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-primary mb-4">
            ✓ Selected!
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {selected?.spec.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {selected?.spec.difficulty} Difficulty · {selected?.spec.primaryTag} Type
          </p>
          <p className="text-sm text-gray-500">
            Generating next battle choices...
          </p>
        </div>
      </div>
    );
  }

  return (
    <OpponentSelectScreen
      previews={previews}
      battleIndex={battleIndex}
      onSelect={handleSelect}
      onCancel={handleCancel}
    />
  );
}

