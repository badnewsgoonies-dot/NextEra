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

  // Base styles
  const baseStyles = `
    px-8 py-4 rounded-lg text-xl font-bold
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
  `;

  // State-dependent styles
  const stateStyles = disabled
    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-600 cursor-not-allowed opacity-50'
    : selected
    ? 'bg-primary text-white shadow-lg scale-105 cursor-pointer'
    : 'bg-white dark:bg-surface-dark text-gray-900 dark:text-white shadow-md hover:shadow-lg hover:scale-105 cursor-pointer';

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
    >
      <span className="flex items-center justify-center gap-3">
        {selected && <span aria-hidden="true">▶</span>}
        {label}
      </span>
    </button>
  );
});
