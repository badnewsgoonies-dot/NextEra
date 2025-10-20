/*
 * TargetHelp: Small helper strip shown while in targeting mode
 */

import React from 'react';

export function TargetHelp(): React.ReactElement {
  return (
    <div className="mt-2 text-xs text-gray-300 bg-slate-800/50 rounded p-2">
      <span className="font-semibold text-cyan-300">Targeting:</span> Use ←/→ to cycle enemies, Enter to confirm, Esc to cancel.
    </div>
  );
}

