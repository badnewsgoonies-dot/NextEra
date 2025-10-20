/*
 * TurnBanner: subtle banner indicating current turn (round)
 */

import React from 'react';

export function TurnBanner({ turn }: { turn: number }): React.ReactElement {
  return (
    <div className="inline-flex items-center gap-2 bg-slate-800/70 border border-slate-700 rounded px-3 py-1 text-sm">
      <span className="font-semibold text-cyan-300">Turn</span>
      <span className="font-bold">{turn}</span>
    </div>
  );
}

