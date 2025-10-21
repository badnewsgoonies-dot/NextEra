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
  onSelect?: (index: number) => void;
}

export function ActionMenu({
  items,
  selectedIndex,
  disabled = false,
  title = 'Actions',
  onSelect,
}: ActionMenuProps): React.ReactElement {
  return (
    <div className="bg-gradient-to-b from-blue-900/95 to-blue-950/95 border-4 border-yellow-500/80 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
      <div className="text-base font-bold uppercase tracking-wider text-yellow-300 mb-3 drop-shadow-lg" 
           style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
        {title}
      </div>
      <div className="flex flex-col gap-2.5">
        {items.map((label, i) => (
          <MenuButton
            key={label}
            label={label}
            selected={i === selectedIndex}
            disabled={disabled}
            onClick={() => !disabled && onSelect?.(i)}
          />
        ))}
      </div>
    </div>
  );
}

