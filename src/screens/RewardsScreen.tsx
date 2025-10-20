/*
 * RewardsScreen: Display battle loot and rewards
 * Per PowerPoint mockup Slide 5
 */

import React from 'react';
import type { BattleReward } from '../types/game.js';

export interface RewardsScreenProps {
  rewards: BattleReward;
  onContinue: () => void;
}

export function RewardsScreen({ rewards, onContinue }: RewardsScreenProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-900 p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-green-600 dark:text-green-400 mb-8">
          🎁 Rewards
        </h1>

        {/* Items Gained */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Items Gained:
          </h2>
          
          {rewards.items.length > 0 ? (
            <div className="space-y-3">
              {rewards.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  <div className="text-3xl">📦</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      {item.rarity && ` • ${item.rarity}`}
                    </div>
                  </div>
                  {item.stats && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {item.stats.atkBonus && `+${item.stats.atkBonus} ATK `}
                      {item.stats.defBonus && `+${item.stats.defBonus} DEF `}
                      {item.stats.speedBonus && `+${item.stats.speedBonus} SPD`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No items gained this battle
            </p>
          )}
        </div>

        {/* Experience */}
        {rewards.experience > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Experience Gained
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                +{rewards.experience} XP
              </span>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-lg transition-colors shadow-lg"
        >
          Continue to Recruitment →
        </button>
      </div>
    </div>
  );
}

