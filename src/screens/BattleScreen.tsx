/*
 * BattleScreen: Auto-battle visualization
 * 
 * Displays combat sequence from BattleResult.actions
 * - Player team on left (4 units max)
 * - Enemy team on right (1-4 units)
 * - Animates attacks using psynergy GIFs
 * - Shows damage numbers
 * - Updates HP bars in real-time
 * - Victory/defeat screen at end
 */

import React, { useState, useEffect } from 'react';
import type { BattleResult, BattleUnit } from '../types/game.js';
import { UnitBattleCard } from '../components/battle/UnitBattleCard.js';
import { DamageNumber } from '../components/battle/DamageNumber.js';

export interface BattleScreenProps {
  result: BattleResult;
  playerUnits: readonly BattleUnit[];
  enemyUnits: readonly BattleUnit[];
  onComplete: () => void;
}

interface DamagePopup {
  id: string;
  damage: number;
  x: number;
  y: number;
}

export function BattleScreen({
  result,
  playerUnits: initialPlayerUnits,
  enemyUnits: initialEnemyUnits,
  onComplete,
}: BattleScreenProps): React.ReactElement {
  // Clone units to track HP changes during animation
  const [playerUnits, setPlayerUnits] = useState(() => 
    initialPlayerUnits.map(u => ({ ...u }))
  );
  const [enemyUnits, setEnemyUnits] = useState(() => 
    initialEnemyUnits.map(u => ({ ...u }))
  );
  
  const [currentActionIndex, setCurrentActionIndex] = useState(-1);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [targetedUnitId, setTargetedUnitId] = useState<string | null>(null);
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [psynergyEffect, setPsynergyEffect] = useState<string | null>(null);
  const [battleComplete, setBattleComplete] = useState(false);

  // Auto-play battle actions
  useEffect(() => {
    if (currentActionIndex >= result.actions.length - 1) {
      // Battle complete
      setBattleComplete(true);
      return;
    }

    const timer = setTimeout(() => {
      const nextIndex = currentActionIndex + 1;
      const action = result.actions[nextIndex];

      if (action.type === 'attack') {
        // Animate attack
        setActiveUnitId(action.actorId);
        setTargetedUnitId(action.targetId || null);

        // Show psynergy effect
        const effects = [
          'Blue_Bolt', 'Dragon_Fire', 'Sonic_Slash', 'Inferno',
          'Spark_Plasma', 'Fiery_Blast', 'Ice_Missile', 'Nettle'
        ];
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        setPsynergyEffect(randomEffect);

        // Show damage number
        setTimeout(() => {
          if (action.damage && action.targetId) {
            // Find target position for damage popup
            const isPlayerTarget = playerUnits.some(u => u.id === action.targetId);
            const damagePopup: DamagePopup = {
              id: `${action.seq}-${action.targetId}`,
              damage: action.damage,
              x: isPlayerTarget ? 25 : 75, // Left for players, right for enemies
              y: 40 + Math.random() * 20, // Slight random vertical offset
            };
            setDamagePopups(prev => [...prev, damagePopup]);

            // Update HP
            if (isPlayerTarget) {
              setPlayerUnits(prev =>
                prev.map(u =>
                  u.id === action.targetId
                    ? { ...u, currentHp: Math.max(0, u.currentHp - action.damage!) }
                    : u
                )
              );
            } else {
              setEnemyUnits(prev =>
                prev.map(u =>
                  u.id === action.targetId
                    ? { ...u, currentHp: Math.max(0, u.currentHp - action.damage!) }
                    : u
                )
              );
            }
          }
        }, 400); // Damage appears mid-animation

        // Clear highlights after animation
        setTimeout(() => {
          setActiveUnitId(null);
          setTargetedUnitId(null);
          setPsynergyEffect(null);
        }, 800);

      } else if (action.type === 'defeat') {
        // Unit defeated - HP should already be 0
        setActiveUnitId(null);
        setTargetedUnitId(null);
      }

      setCurrentActionIndex(nextIndex);
    }, currentActionIndex === -1 ? 1000 : 1200); // First action after 1s, then 1.2s per action

    return () => clearTimeout(timer);
  }, [currentActionIndex, result.actions, playerUnits, enemyUnits]);

  // Handle battle completion
  useEffect(() => {
    if (battleComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2000); // Show result for 2 seconds before transitioning

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [battleComplete, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 p-8">
      {/* Battle Title */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-white text-center">
          Battle
        </h1>
        <div className="text-center text-gray-300 mt-2">
          Turn {currentActionIndex + 1} / {result.actions.length}
        </div>
      </div>

      {/* Battle Arena */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 gap-8 relative">
        {/* Player Team (Left) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-blue-400 mb-4">Your Team</h2>
          {playerUnits.map((unit) => (
            <UnitBattleCard
              key={unit.id}
              unit={unit}
              isActive={activeUnitId === unit.id}
              isTargeted={targetedUnitId === unit.id}
              isDead={unit.currentHp <= 0}
            />
          ))}
        </div>

        {/* Enemy Team (Right) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-red-400 mb-4">Enemies</h2>
          {enemyUnits.map((unit) => (
            <UnitBattleCard
              key={unit.id}
              unit={unit}
              isActive={activeUnitId === unit.id}
              isTargeted={targetedUnitId === unit.id}
              isDead={unit.currentHp <= 0}
            />
          ))}
        </div>

        {/* Psynergy Animation Overlay */}
        {psynergyEffect && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src={`/sprites/psynergy/${psynergyEffect}.gif`}
              alt="Attack effect"
              className="w-64 h-64 object-contain"
            />
          </div>
        )}

        {/* Damage Numbers */}
        {damagePopups.map((popup) => (
          <DamageNumber
            key={popup.id}
            damage={popup.damage}
            x={popup.x}
            y={popup.y}
            onComplete={() => {
              setDamagePopups(prev => prev.filter(p => p.id !== popup.id));
            }}
          />
        ))}
      </div>

      {/* Battle Result */}
      {battleComplete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-10 max-w-lg text-center shadow-2xl border-4 border-gray-200 dark:border-gray-700">
            {result.winner === 'player' && (
              <>
                <div className="text-7xl mb-4 animate-bounce">🎉</div>
                <h2 className="text-5xl font-black text-green-500 mb-4 animate-pulse">Victory!</h2>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
                  You defeated the enemies!
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  {result.turnsTaken} turns • {result.unitsDefeated.length} enemies defeated
                </p>
                <div className="text-sm text-green-600 dark:text-green-400 font-semibold">
                  Loading next battle...
                </div>
              </>
            )}
            {result.winner === 'enemy' && (
              <>
                <div className="text-7xl mb-4">💀</div>
                <h2 className="text-5xl font-black text-red-500 mb-4">Defeat</h2>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
                  Your party was defeated...
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  Survived {result.turnsTaken} turns
                </p>
                <div className="text-sm text-gray-500">
                  Returning to defeat screen...
                </div>
              </>
            )}
            {result.winner === 'draw' && (
              <>
                <div className="text-7xl mb-4">⚔️</div>
                <h2 className="text-5xl font-black text-gray-500 mb-4">Draw</h2>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
                  Both sides fell in battle...
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  {result.turnsTaken} turns of fierce combat
                </p>
                <div className="text-sm text-gray-500">
                  Restarting...
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

