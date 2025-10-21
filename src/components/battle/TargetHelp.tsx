/*
 * TargetHelp: Small helper strip shown while in targeting mode
 */

import React from 'react';

export function TargetHelp(): React.ReactElement {
  return (
    <div className="mt-3 text-xs text-yellow-200 bg-blue-900/60 border-2 border-blue-700 rounded-lg p-3 backdrop-blur-sm">
      <span className="font-bold text-yellow-300">Targeting:</span> Use ←/→ to cycle enemies, Enter to confirm, Esc to cancel.
    </div>
  );
}

