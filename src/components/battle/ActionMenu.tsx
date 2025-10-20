/*
 * ActionMenu: Vertical command list with selection highlight
 * Uses Tailwind and matches MenuButton patterns.
 */

import React from 'react';
import { MenuButton } from '../MenuButton.js';

export interface ActionMenuProps {
  items: string[];
  selectedIndex: number;
  disabled?: boolean;
  title?: string;
}

export function ActionMenu({
  items,
  selectedIndex,
  disabled = false,
  title = 'Actions',
}: ActionMenuProps): React.ReactElement {
  return (
    <div className="bg-slate-900/80 border-2 border-cyan-400 rounded-lg p-3 shadow-md">
      <div className="text-sm uppercase tracking-wider text-cyan-300 mb-2">{title}</div>
      <div className="flex flex-col gap-2">
        {items.map((label, i) => (
          <MenuButton
            key={label}
            label={label}
            selected={i === selectedIndex}
            disabled={disabled}
            onClick={() => {/* keyboard handles commit; clicks are no-op here */}}
          />
        ))}
      </div>
    </div>
  );
}

