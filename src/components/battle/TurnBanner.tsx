/*
 * TurnBanner: subtle banner indicating current turn (round)
 */

import React from 'react';

export function TurnBanner({ turn }: { turn: number }): React.ReactElement {
  return (
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-900/95 to-blue-800/95 border-3 border-yellow-500/80 rounded-lg px-4 py-2 text-base shadow-xl backdrop-blur-sm">
      <span className="font-bold text-yellow-300 drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
        Turn
      </span>
      <span className="font-extrabold text-white text-lg">{turn}</span>
    </div>
  );
}

