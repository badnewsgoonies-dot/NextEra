/*
 * MenuButton: Reusable menu button component
 * 
 * Features:
 * - Keyboard navigation support
 * - Disabled state
 * - Selected/focused visual feedback
 * - Accessibility (ARIA labels, roles)
 * - Animations (hover, focus)
 */

import React from 'react';

export interface MenuButtonProps {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  onFocus?: () => void;
  className?: string;
}

export const MenuButton = React.memo(function MenuButton({
  label,
  selected,
  disabled = false,
  onClick,
  onFocus,
  className = '',
}: MenuButtonProps): React.ReactElement {
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Base styles with Golden Sun aesthetic
  const baseStyles = `
    px-6 py-3 rounded-lg text-lg font-bold
    transition-all duration-150 ease-out
    focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 
    focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900/50
    border-2
  `;

  // State-dependent styles (Golden Sun palette)
  const stateStyles = disabled
    ? 'bg-gray-600/50 border-gray-700 text-gray-400 cursor-not-allowed opacity-60'
    : selected
    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400 text-blue-900 shadow-lg shadow-yellow-500/50 scale-105 cursor-pointer font-extrabold'
    : 'bg-gradient-to-r from-blue-700 to-blue-800 border-blue-600 text-yellow-100 shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 hover:scale-102 cursor-pointer';

  return (
    <button
      type="button"
      role="menuitem"
      aria-label={label}
      aria-disabled={disabled}
      tabIndex={selected ? 0 : -1} // Roving tabindex
      onClick={handleClick}
      onFocus={onFocus}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`${baseStyles} ${stateStyles} ${className}`}
      style={selected ? { textShadow: '1px 1px 2px rgba(0,0,0,0.5)' } : {}}
    >
      <span className="flex items-center justify-between gap-3">
        {selected && <span aria-hidden="true" className="text-blue-900 font-black">▶</span>}
        <span className="flex-1 text-center">{label}</span>
        {selected && <span aria-hidden="true" className="text-blue-900 font-black">◀</span>}
      </span>
    </button>
  );
});
