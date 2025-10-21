/*
 * BattleFormationTest: Visual QA harness for testing 2x2 formation layouts
 *
 * This component allows testing different party sizes to verify:
 * - Proper 2x2 diagonal grid formation
 * - Scaling differences (enemies 0.8x, players 1.0x)
 * - Positioning with different unit counts (1-4 per team)
 * - Asymmetric formations (e.g., 1 player vs 4 enemies)
 *
 * Usage: Temporarily mount this component to visually verify layouts
 */

import React, { useState } from 'react';
import type { BattleUnit } from '../types/game.js';
import { BattleScreen } from './BattleScreen.js';

// Test fixture generator
function createTestUnit(
  id: string,
  name: string,
  isPlayer: boolean,
  index: number
): BattleUnit {
  return {
    id,
    name,
    role: index % 4 === 0 ? 'Tank' : index % 3 === 0 ? 'Support' : index % 2 === 0 ? 'Specialist' : 'DPS',
    tags: ['Holy'],
    currentHp: 100,
    maxHp: 100,
    atk: 20,
    def: 15,
    speed: 40 + index * 5,
    isPlayer,
    originalIndex: index,
  };
}

// Generate test teams of various sizes
function generateTeam(count: number, isPlayer: boolean): BattleUnit[] {
  const prefix = isPlayer ? 'P' : 'E';
  const baseName = isPlayer ? 'Hero' : 'Monster';
  return Array.from({ length: count }, (_, i) =>
    createTestUnit(`${prefix}${i + 1}`, `${baseName} ${i + 1}`, isPlayer, i)
  );
}

export function BattleFormationTest(): React.ReactElement {
  const [playerCount, setPlayerCount] = useState(4);
  const [enemyCount, setEnemyCount] = useState(4);
  const [showGrid, setShowGrid] = useState(true);
  const [currentTest, setCurrentTest] = useState<string>('4v4');

  // Predefined test scenarios
  const scenarios = {
    '1v1': { players: 1, enemies: 1 },
    '1v2': { players: 1, enemies: 2 },
    '1v3': { players: 1, enemies: 3 },
    '1v4': { players: 1, enemies: 4 },
    '2v2': { players: 2, enemies: 2 },
    '2v3': { players: 2, enemies: 3 },
    '2v4': { players: 2, enemies: 4 },
    '3v3': { players: 3, enemies: 3 },
    '3v4': { players: 3, enemies: 4 },
    '4v4': { players: 4, enemies: 4 },
    '4v1': { players: 4, enemies: 1 },
  };

  const handleScenario = (scenario: keyof typeof scenarios) => {
    const config = scenarios[scenario];
    setPlayerCount(config.players);
    setEnemyCount(config.enemies);
    setCurrentTest(scenario);
  };

  const playerUnits = generateTeam(playerCount, true);
  const enemyUnits = generateTeam(enemyCount, false);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Test Controls */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b-2 border-yellow-400 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-yellow-400 mb-4">
            🎨 Battle Formation Visual QA Test
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm text-white mb-2">
                Players: {playerCount}
              </label>
              <input
                type="range"
                min="1"
                max="4"
                value={playerCount}
                onChange={e => setPlayerCount(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-white mb-2">
                Enemies: {enemyCount}
              </label>
              <input
                type="range"
                min="1"
                max="4"
                value={enemyCount}
                onChange={e => setEnemyCount(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-white mb-2">Current Test</label>
              <div className="text-xl font-bold text-yellow-400">{currentTest}</div>
            </div>

            <div>
              <label className="block text-sm text-white mb-2">Grid Overlay</label>
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-4 py-2 rounded ${
                  showGrid ? 'bg-green-500' : 'bg-red-500'
                } text-white font-bold`}
              >
                {showGrid ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Quick Scenario Buttons */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(scenarios).map(scenario => (
              <button
                key={scenario}
                onClick={() => handleScenario(scenario as keyof typeof scenarios)}
                className={`px-3 py-1 rounded font-mono text-sm ${
                  currentTest === scenario
                    ? 'bg-yellow-400 text-black font-bold'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                {scenario}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 p-3 bg-slate-700 rounded text-xs text-white">
            <div className="font-bold mb-2">Expected Layout:</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Players (Bottom-Left):</strong>
                <ul className="ml-4 mt-1">
                  <li>• Scale: 1.0x (full size)</li>
                  <li>• Position: 170px column, 70px row spacing</li>
                  <li>• Diagonal offset: 25px</li>
                  <li>• Formation: Unit 0,1 front / Unit 2,3 back</li>
                </ul>
              </div>
              <div>
                <strong>Enemies (Top-Right):</strong>
                <ul className="ml-4 mt-1">
                  <li>• Scale: 0.8x (smaller, background)</li>
                  <li>• Position: 180px column, 80px row spacing</li>
                  <li>• Diagonal offset: 30px</li>
                  <li>• Formation: Unit 0,1 front / Unit 2,3 back</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Overlay for Visual Alignment */}
      {showGrid && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {/* Center crosshair */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-green-500 opacity-50" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-green-500 opacity-50" />

          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-30">
            <defs>
              <pattern
                id="grid"
                width="50"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="cyan"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Formation markers - Players (bottom-left) */}
          <div className="absolute bottom-20 left-8">
            {[0, 1, 2, 3].slice(0, playerCount).map(idx => {
              const row = Math.floor(idx / 2);
              const col = idx % 2;
              const x = col * 170 + row * 25;
              const y = row * 70;

              return (
                <div
                  key={`player-marker-${idx}`}
                  className="absolute"
                  style={{
                    left: `${x}px`,
                    bottom: `${y}px`,
                    width: '100px',
                    height: '100px',
                    border: '2px dashed lime',
                    backgroundColor: 'rgba(0, 255, 0, 0.1)',
                  }}
                >
                  <div className="text-lime-400 font-mono text-xs p-1">P{idx}</div>
                </div>
              );
            })}
          </div>

          {/* Formation markers - Enemies (top-right) */}
          <div className="absolute top-20 right-12">
            {[0, 1, 2, 3].slice(0, enemyCount).map(idx => {
              const row = Math.floor(idx / 2);
              const col = idx % 2;
              const x = col * 180 + row * 30;
              const y = row * 80;

              return (
                <div
                  key={`enemy-marker-${idx}`}
                  className="absolute"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    width: '80px',
                    height: '80px',
                    border: '2px dashed red',
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  }}
                >
                  <div className="text-red-400 font-mono text-xs p-1">E{idx}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Battle Screen */}
      <div className="pt-32">
        <BattleScreen
          playerUnits={playerUnits}
          enemyUnits={enemyUnits}
          onComplete={() => {
            console.log('Battle complete (test harness)');
          }}
          seed={12345}
          battleIndex={0}
        />
      </div>
    </div>
  );
}

export default BattleFormationTest;
