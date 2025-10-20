/*
 * RecruitScreen: Recruit defeated enemies
 * Per PowerPoint mockup Slide 5
 * 
 * Features:
 * - Shows defeated enemies from battle
 * - Player can recruit one enemy
 * - If team full (4 units), must replace existing unit
 * - Skip option to recruit nobody
 */

import React, { useState } from 'react';
import type { EnemyUnitTemplate, PlayerUnit, Role } from '../types/game.js';

export interface RecruitScreenProps {
  defeatedEnemies: readonly EnemyUnitTemplate[];
  currentTeam: readonly PlayerUnit[];
  onRecruit: (enemyId: string, replaceUnitId?: string) => void;
  onSkip: () => void;
}

const ROLE_COLORS: Record<Role, string> = {
  Tank: 'bg-blue-600',
  DPS: 'bg-red-600',
  Support: 'bg-purple-600',
  Specialist: 'bg-amber-600',
};

export function RecruitScreen({
  defeatedEnemies,
  currentTeam,
  onRecruit,
  onSkip,
}: RecruitScreenProps): React.ReactElement {
  const [selectedEnemyId, setSelectedEnemyId] = useState<string | null>(null);
  const [showReplacementModal, setShowReplacementModal] = useState(false);

  const teamIsFull = currentTeam.length >= 4;

  const handleRecruitClick = (enemyId: string) => {
    if (teamIsFull) {
      setSelectedEnemyId(enemyId);
      setShowReplacementModal(true);
    } else {
      onRecruit(enemyId);
    }
  };

  const handleReplace = (replaceUnitId: string) => {
    if (selectedEnemyId) {
      onRecruit(selectedEnemyId, replaceUnitId);
      setShowReplacementModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-800 to-purple-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Recruit Defeated Unit
          </h1>
          <p className="text-purple-200">
            You may recruit one defeated enemy. 
            {teamIsFull && ' Your roster is full - choose a unit to replace.'}
          </p>
          <p className="text-sm text-purple-300 mt-2">
            Current team: {currentTeam.length}/4 units
          </p>
        </div>

        {/* Defeated Enemies */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {defeatedEnemies.map((enemy) => {
            const spriteColor = ROLE_COLORS[enemy.role];
            
            return (
              <div
                key={enemy.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400 transition-all hover:shadow-lg"
              >
                {/* Enemy Sprite */}
                <div className="flex justify-center mb-4">
                  <div className={`w-20 h-20 rounded-full ${spriteColor} border-4 border-white shadow-lg flex items-center justify-center`}>
                    <span className="text-white text-3xl font-bold">
                      {enemy.name.charAt(0)}
                    </span>
                  </div>
                </div>

                {/* Enemy Info */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                  {enemy.name}
                </h3>
                
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {enemy.role}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    <div className="text-gray-500 dark:text-gray-400">HP</div>
                    <div className="font-bold text-gray-900 dark:text-white">{enemy.baseStats.hp}</div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    <div className="text-gray-500 dark:text-gray-400">ATK</div>
                    <div className="font-bold text-gray-900 dark:text-white">{enemy.baseStats.atk}</div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    <div className="text-gray-500 dark:text-gray-400">DEF</div>
                    <div className="font-bold text-gray-900 dark:text-white">{enemy.baseStats.def}</div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    <div className="text-gray-500 dark:text-gray-400">SPD</div>
                    <div className="font-bold text-gray-900 dark:text-white">{enemy.baseStats.speed}</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {enemy.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Recruit Button */}
                <button
                  onClick={() => handleRecruitClick(enemy.id)}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
                >
                  Recruit
                </button>
              </div>
            );
          })}
        </div>

        {/* Skip Button */}
        <div className="text-center">
          <button
            onClick={onSkip}
            className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
          >
            Skip Recruitment
          </button>
        </div>
      </div>

      {/* Replacement Modal */}
      {showReplacementModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-2xl w-full shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Unit to Replace
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your roster is full (4/4). Select a unit to replace:
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {currentTeam.map((unit) => {
                const spriteColor = ROLE_COLORS[unit.role];
                
                return (
                  <button
                    key={unit.id}
                    onClick={() => handleReplace(unit.id)}
                    className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 transition-all text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-12 h-12 rounded-full ${spriteColor} border-2 border-white flex items-center justify-center`}>
                        <span className="text-white text-xl font-bold">
                          {unit.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {unit.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {unit.role} • Lv {unit.level}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      HP {unit.hp}/{unit.maxHp} • ATK {unit.atk} • DEF {unit.def}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowReplacementModal(false)}
              className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

