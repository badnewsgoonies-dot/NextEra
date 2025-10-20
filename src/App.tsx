/*
 * App: Main application component
 * 
 * Demo of full game loop:
 * - OpponentSelectScreen: Choose from 3 opponents
 * - BattleScreen: Watch auto-battle with animations
 * - Full integration with GameController
 */

import React, { useState, useEffect } from 'react';
import { ConsoleLogger } from './systems/Logger.js';
import { GameController } from './core/GameController.js';
import { OpponentSelectScreen } from './screens/OpponentSelectScreen.js';
import { BattleScreen } from './screens/BattleScreen.js';
import { RewardsScreen } from './screens/RewardsScreen.js';
import { RecruitScreen } from './screens/RecruitScreen.js';
import type { OpponentPreview, BattleResult, BattleUnit, BattleReward } from './types/game.js';
import { mockPlayerTeam } from '../tests/fixtures/battleFixtures.js';

type AppScreen = 'loading' | 'opponent_select' | 'battle' | 'rewards' | 'recruit' | 'defeat';

export function App(): React.ReactElement {
  const [controller] = useState(() => new GameController(new ConsoleLogger('info')));
  const [screen, setScreen] = useState<AppScreen>('loading');
  const [previews, setPreviews] = useState<readonly OpponentPreview[]>([]);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [playerUnits, setPlayerUnits] = useState<BattleUnit[]>([]);
  const [enemyUnits, setEnemyUnits] = useState<BattleUnit[]>([]);

  // Initialize game on mount
  useEffect(() => {
    const initResult = controller.startRun(mockPlayerTeam, Date.now());
    
    if (initResult.ok) {
      const choicesResult = controller.generateOpponentChoices();
      
      if (choicesResult.ok) {
        setPreviews(choicesResult.value);
        setScreen('opponent_select');
      }
    }
  }, [controller]);

  const handleSelectOpponent = (opponentId: string) => {
    // Select opponent
    const selectResult = controller.selectOpponent(opponentId);
    if (!selectResult.ok) {
      console.error('Failed to select opponent:', selectResult.error);
      return;
    }

    // Start battle
    const startResult = controller.startBattle();
    if (!startResult.ok) {
      console.error('Failed to start battle:', startResult.error);
      return;
    }

    // Execute battle
    const battleResult = controller.executeBattle();
    if (!battleResult.ok) {
      console.error('Failed to execute battle:', battleResult.error);
      return;
    }

    // Initialize battle units for animation
    const selectedPreview = previews.find(p => p.spec.id === opponentId);
    
    if (selectedPreview) {
      // Get current player team
      const currentTeam = controller.getState().playerTeam;
      
      // Create BattleUnits from player team
      const playerBattleUnits: BattleUnit[] = currentTeam.map((unit, index) => ({
        id: unit.id,
        name: unit.name,
        role: unit.role,
        tags: unit.tags,
        currentHp: unit.hp,
        maxHp: unit.maxHp,
        atk: unit.atk,
        def: unit.def,
        speed: unit.speed,
        isPlayer: true,
        originalIndex: index,
      }));

      // Create BattleUnits from enemy templates
      const enemyBattleUnits: BattleUnit[] = selectedPreview.spec.units.map((template, index) => ({
        id: template.id,
        name: template.name,
        role: template.role,
        tags: template.tags,
        currentHp: template.baseStats.hp,
        maxHp: template.baseStats.hp,
        atk: template.baseStats.atk,
        def: template.baseStats.def,
        speed: template.baseStats.speed,
        isPlayer: false,
        originalIndex: index,
      }));

      setPlayerUnits(playerBattleUnits);
      setEnemyUnits(enemyBattleUnits);
      setBattleResult(battleResult.value);
      setScreen('battle');
    }
  };

  const handleBattleComplete = () => {
    if (!battleResult) return;

    if (battleResult.winner === 'player') {
      // Go to rewards screen
      setScreen('rewards');
    } else if (battleResult.winner === 'enemy') {
      setScreen('defeat');
    } else {
      // Draw - restart
      setScreen('loading');
      setTimeout(() => {
        const initResult = controller.startRun(mockPlayerTeam, Date.now());
        if (initResult.ok) {
          const choicesResult = controller.generateOpponentChoices();
          if (choicesResult.ok) {
            setPreviews(choicesResult.value);
            setScreen('opponent_select');
          }
        }
      }, 2000);
    }
  };

  const handleRewardsContinue = () => {
    setScreen('recruit');
  };

  const handleRecruit = (enemyId: string, replaceUnitId?: string) => {
    console.log('Recruited:', enemyId, replaceUnitId ? `(replaced ${replaceUnitId})` : '');
    
    // TODO: Actually add enemy to team and remove replaced unit
    // For now, just advance to next battle
    
    const choicesResult = controller.generateOpponentChoices();
    if (choicesResult.ok) {
      setPreviews(choicesResult.value);
      setScreen('opponent_select');
    }
  };

  const handleSkipRecruit = () => {
    // Skip recruitment, go to next battle
    const choicesResult = controller.generateOpponentChoices();
    if (choicesResult.ok) {
      setPreviews(choicesResult.value);
      setScreen('opponent_select');
    }
  };

  // Loading screen
  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            NextEra MVP
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Initializing game...
          </p>
        </div>
      </div>
    );
  }

  // Opponent selection screen
  if (screen === 'opponent_select' && previews.length > 0) {
    return (
      <OpponentSelectScreen
        previews={previews}
        battleIndex={controller.getState().battleIndex}
        onSelect={handleSelectOpponent}
        onCancel={() => console.log('Cancelled')}
      />
    );
  }

  // Battle screen
  if (screen === 'battle' && battleResult && playerUnits.length > 0 && enemyUnits.length > 0) {
    return (
      <BattleScreen
        result={battleResult}
        playerUnits={playerUnits}
        enemyUnits={enemyUnits}
        onComplete={handleBattleComplete}
      />
    );
  }

  // Rewards screen
  if (screen === 'rewards' && battleResult) {
    // Create mock rewards (TODO: implement RewardSystem)
    const mockRewards: BattleReward = {
      items: [],
      defeatedEnemies: previews.find(p => p.spec.id === controller.getState().selectedOpponentId)?.spec.units || [],
      experience: battleResult.turnsTaken * 10,
    };

    return (
      <RewardsScreen
        rewards={mockRewards}
        onContinue={handleRewardsContinue}
      />
    );
  }

  // Recruit screen
  if (screen === 'recruit') {
    const defeatedEnemies = previews.find(p => p.spec.id === controller.getState().selectedOpponentId)?.spec.units || [];
    
    return (
      <RecruitScreen
        defeatedEnemies={defeatedEnemies}
        currentTeam={controller.getState().playerTeam}
        onRecruit={handleRecruit}
        onSkip={handleSkipRecruit}
      />
    );
  }

  // Defeat screen
  if (screen === 'defeat') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-800 to-red-900 flex items-center justify-center">
        <div className="text-center max-w-md bg-white dark:bg-gray-800 rounded-lg p-8">
          <h1 className="text-4xl font-bold text-red-500 mb-4">
            Defeat
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Your party was defeated...
          </p>
          <button
            onClick={() => {
              // Restart
              setScreen('loading');
              setTimeout(() => {
                const initResult = controller.startRun(mockPlayerTeam, Date.now());
                if (initResult.ok) {
                  const choicesResult = controller.generateOpponentChoices();
                  if (choicesResult.ok) {
                    setPreviews(choicesResult.value);
                    setScreen('opponent_select');
                  }
                }
              }, 1000);
            }}
            className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  );
}
